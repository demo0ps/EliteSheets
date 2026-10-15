from __future__ import annotations

import copy
import csv
from datetime import datetime, timedelta, timezone
import smtplib
from email.message import EmailMessage
from io import BytesIO, StringIO
import hashlib
import hmac
import json
import logging
import os
from pathlib import Path
import re
import secrets
import tempfile
import uuid
from zoneinfo import ZoneInfo
from functools import wraps

from fastapi import FastAPI, Request, HTTPException, Depends, UploadFile, File, Form
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from . import helper
import httpx
from .blobs import LocalBlobs, R2Blobs, materialise
from .cloud_store import CloudStore, CreditCapReached
from .engine import infer_plan, finalise_cell_profiles, input_signature, transform, decimal_value, validate_and_repair_sa_id, percentage_to_caps_level, MAX_OUTPUT_ROWS
from .models import MappingPlan, SourcePlan, AISettings
from .online_models import Login, Signup, DemoLogin, Preferences, PlatformSettings, CustomerCreate, ChatInput, ProposalConfirm, Run, Analyse, PlanConfirm
from .samples import create_samples, sample_case
from .security import password_hash, password_matches, Vault
from . import yoco
from .store import now, canonical, digest, microdollars
from .workbooks import profile, check_file, public_value, norm, book_rows

ROOT = Path(__file__).resolve().parent.parent
LOG = logging.getLogger('sheetqms.online')


# Credits: one credit = R0.01 of provider cost (see billing/CREDITS-DESIGN.md)
INCLUDED_CREDITS = 200
# Margin view estimates (billing/CREDITS-DESIGN.md): R0.01 provider cost per credit, 15% VAT on the fee.
CREDIT_PROVIDER_COST_RAND = 0.01
VAT_RATE = 0.15
GRANT_PREFIX = 'Admin grant: '


def csv_cell(value):
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return value  # numbers stay numeric, so a charge of -1 is not turned into text
    text = '' if value is None else str(value)
    # Stop spreadsheet formula injection when the file is opened in Excel.
    if text[:1] in ('=', '+', '-', '@'):
        text = "'" + text
    return text


def csv_text(header, rows):
    import csv as _csv
    buffer = StringIO()
    writer = _csv.writer(buffer)
    writer.writerow(header)
    for row in rows:
        writer.writerow([csv_cell(v) for v in row])
    return '\ufeff' + buffer.getvalue()  # BOM so Excel reads the UTF-8 correctly


SUBSCRIPTION_STATUSES = ('active', 'trial', 'past_due', 'paused', 'cancelled')
DATE_PATTERN = re.compile(r'\d{4}-\d{2}-\d{2}')


def valid_date(value):
    if value is None:
        return True
    if not isinstance(value, str) or not DATE_PATTERN.fullmatch(value):
        return False
    try:
        datetime.strptime(value, '%Y-%m-%d')
    except ValueError:
        return False
    return True


CREDIT_COSTS = {'sheet_job': 3}
CREDIT_TZ = ZoneInfo('Africa/Johannesburg')


def credit_month():
    return datetime.now(CREDIT_TZ).strftime('%Y-%m')


def credit_resets():
    d = datetime.now(CREDIT_TZ)
    year, month = (d.year + 1, 1) if d.month == 12 else (d.year, d.month + 1)
    return f'{year:04d}-{month:02d}-01'


def _text_safe_cell(*cells):
    """Grid values are values only: a typed '=...' is stored as plain text, never as a live formula."""
    for cell in cells:
        if isinstance(cell.value, str) and cell.value.startswith('='):
            cell.data_type = 's'


def create_online_app(root=None, demo=None, database_url=None, blobs=None, encryption_key=None):
    demo = os.getenv('SHEETQMS_DEMO') == '1' if demo is None else demo
    production = os.getenv('SHEETQMS_ENV') == 'production' and not demo
    root = Path(root or os.getenv('SHEETQMS_DEV_DATA_DIR', str(Path.home() / '.local/sheetqms-cloud')))
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    database_url = database_url or os.getenv('SHEETQMS_DATABASE_URL')
    if production and (not database_url or not database_url.startswith('postgresql')):
        raise ValueError('Production requires durable PostgreSQL; local SQLite is rejected.')
    database_url = database_url or 'sqlite:///' + str(root / 'development.sqlite3')
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
    store = CloudStore(database_url, migrate=not production or os.getenv('SHEETQMS_AUTO_MIGRATE') == '1')
    if blobs is None:
        if production:
            blobs = R2Blobs()
        else:
            blobs = LocalBlobs(root / 'objects')
    vault = Vault(encryption_key or os.getenv('SHEETQMS_ENCRYPTION_KEY'), demo=demo or not production)
    app = FastAPI(title='Elite Sheets online', version='0.2.0', docs_url=None, redoc_url=None)
    app.state.store, app.state.blobs, app.state.demo = store, blobs, demo
    allowed = ['*'] if demo else ['localhost', '127.0.0.1', 'testserver'] + [x.strip() for x in os.getenv('SHEETQMS_APP_HOSTS', '').split(',') if x.strip()]
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed)
    app.mount('/static', StaticFiles(directory=ROOT / 'web'), name='static')
    if demo:
        samples_dir = root / 'samples'
        create_samples(samples_dir)
        for tenant, name, email, display, role in [
            ('platform', 'Platform administration', 'admin@demo.elitesheets', 'Platform admin', 'admin'),
            ('demo-a', 'Demo customer A', 'operator@demo.elitesheets', 'Demo operator', 'operator'),
            ('demo-b', 'Demo customer B', 'other@demo.elitesheets', 'Other customer', 'operator')]:
            store.bootstrap_user(tenant, name, email, display, role, password_hash(secrets.token_urlsafe(20)))
    else:
        email, password = os.getenv('SHEETQMS_ADMIN_EMAIL'), os.getenv('SHEETQMS_ADMIN_PASSWORD')
        if email and password and not store.user_email(email):
            store.bootstrap_user('platform', 'Platform administration', email, 'Platform admin', 'admin', password_hash(password))

    @app.middleware('http')
    async def guards(request, call_next):
        trace = str(uuid.uuid4())
        response = await call_next(request)
        response.headers['X-Trace-Id'] = trace
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy'] = 'same-origin'
        response.headers['Cache-Control'] = 'no-store' if not request.url.path.startswith('/static') else 'public,max-age=3600'
        response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
        LOG.info(canonical({'path': request.url.path, 'status': response.status_code, 'trace_id': trace}))
        return response

    @app.exception_handler(RequestValidationError)
    async def safe_error(request, exc):
        return JSONResponse({'detail': [{'loc': e['loc'], 'msg': e['msg'], 'type': e['type']} for e in exc.errors()]}, status_code=422)

    def token_for(request):
        token = request.cookies.get('sqm_session', '')
        if demo and request.headers.get('X-Demo-Session'):
            token = request.headers['X-Demo-Session']
        return token

    def current(request: Request):
        user = store.session(token_for(request))
        if not user:
            raise HTTPException(401, 'Sign in to access your customer workspace.')
        if user['role'] != 'admin':
            access = access_for(user['id'])
            if access == 'blocked':
                raise HTTPException(403, 'Your account is paused. Contact your administrator to restore access.')
            if access == 'read_only' and request.method not in {'GET', 'HEAD', 'OPTIONS'}:
                raise HTTPException(403, 'Your subscription is not active, so you can view and download but not make changes. Renew or contact your administrator.')
        if request.method not in {'GET', 'HEAD', 'OPTIONS'}:
            supplied = request.headers.get('X-CSRF-Token', '')
            if not hmac.compare_digest(supplied, user['csrf']):
                raise HTTPException(403, 'Session request token is missing or invalid.')
        return user

    def administrator(user=Depends(current)):
        if user['role'] != 'admin':
            raise HTTPException(403, 'Only the platform admin can access credentials, spending or customer administration.')
        return user

    def workspace(request: Request, user=Depends(current)):
        requested = request.headers.get('X-Workspace-ID', '')
        if user['role'] == 'admin':
            tenant = requested or 'demo-a' if demo else requested
            if not tenant or not store.tenant(tenant):
                raise HTTPException(422, 'Select an existing customer workspace.')
        else:
            tenant = user['tenant_id']
            if requested and requested != tenant:
                raise HTTPException(403, 'Customer workspaces are isolated.')
        return user, tenant

    def settings_model():
        raw = store.settings()
        return PlatformSettings.model_validate(raw)

    def ai_model():
        return AISettings.model_validate({k: v for k, v in settings_model().model_dump().items() if k in AISettings.model_fields})

    def settings_public(admin=False):
        settings = settings_model()
        if admin:
            result = settings.model_dump(exclude={'api_key', 'clear_key'})
            result.update(key_configured=bool(store.encrypted_key()), spent_micro_usd=store.spent(), demo_mode=demo, deployment_mode='serverless-ready' if production else 'development preview')
            return result
        return {'enabled': settings.enabled and not demo, 'model': settings.model or 'Not configured', 'key_configured': bool(store.encrypted_key()), 'demo_mode': demo, 'auto_learn': settings.auto_learn, 'note': 'Only the platform admin can change AI credentials, models and spending.'}

    def public(job):
        return {k: job.get(k) for k in ['id', 'title', 'created', 'state', 'trace_id', 'profiles', 'plan', 'report', 'mapping_origin', 'clarifications', 'chat', 'proposal', 'knowledge_conflict', 'use_workbook_rules', 'knowledge_id', 'plan_confirmation', 'batch_audit']}

    def get_job(tenant, identifier):
        job = store.job(tenant, identifier)
        if not job:
            raise HTTPException(404, 'Job not found in this customer workspace.')
        return job

    def message(job, role, text, kind='text'):
        item = {'id': str(uuid.uuid4()), 'role': role, 'text': text, 'kind': kind, 'created': now()}
        job.setdefault('chat', []).append(item)
        return item

    def missing_cells(job):
        if job.get('plan', {}).get('destination', {}).get('mode') != 'pivot' or not job.get('report'):
            return []
        key_field = job['plan']['destination']['key']
        categories = job['plan']['destination']['categories']
        return [(str(row.get(key_field, '')), cat) for row in job['report']['rows'] for cat in categories if row.get(cat) is None]

    def mapping_context(job):
        plan = MappingPlan.model_validate(job['plan'])
        target_headers = list(job['profiles']['template']['sheets'][0]['headers']) if job['profiles']['template']['sheets'] else []
        source_headers = []
        for s in plan.sources:
            for p in job['profiles']['sources']:
                if p['id'] == s.source_id:
                    for sheet in p['sheets']:
                        if sheet['name'] == s.sheet:
                            for h in sheet['headers']:
                                source_headers.append((s, h))
        mapped_targets = {k for s in plan.sources for k, v in s.field_map.items() if v} | {s.period for s in plan.sources if s.period}
        used_sources = {v for s in plan.sources for k, v in s.field_map.items() if v} | {c for s in plan.sources for c in s.columns}
        unmapped_targets = [h for h in target_headers if h not in mapped_targets] if plan.destination.mode == 'direct' else []
        unused_sources = [h for _, h in source_headers if h not in used_sources]
        return plan, target_headers, source_headers, unmapped_targets, unused_sources

    def describe_mapping_plain(job):
        plan, target_headers, source_headers, unmapped_targets, unused_sources = mapping_context(job)
        if plan.destination.mode == 'direct':
            pairs = [f"{v} → {k}" for s in plan.sources for k, v in s.field_map.items() if v]
            summary = f"Here is how your columns are matched: {', '.join(pairs)}." if pairs else "No columns are matched yet."
            if unmapped_targets:
                summary += f" I still need to know which column goes into '{unmapped_targets[0]}' (your file has: {', '.join(h for _, h in source_headers)})."
            else:
                summary += " Want to change any of them? Just say something like 'put Quantity in Qty'."
            return summary
        return f"I'm combining your files into the table ({', '.join(target_headers)}). Click Run transformation (or reply 'go') to fill it in."

    def bot_summary(job):
        report = job.get('report')
        if report and report['status'] == 'RELEASED':
            cols = ', '.join(report.get('headers', [])[:6])
            key_col = job['plan']['destination'].get('key') or (report['headers'][0] if report.get('headers') else '')
            row_names = ', '.join(str(r.get(key_col, '')) for r in report.get('rows', [])[:4] if r.get(key_col) is not None)
            row_detail = f" ({row_names})" if row_names else ""
            return f"All done! QMS released this workbook ({report['passed_checks']}/{report['total_checks']} checks passed, {report['output_rows']} rows{row_detail} across {cols}). Tell me what you'd like to edit or click Download XLSX."
        questions = report['questions'] if report else job['plan']['questions']
        if questions and job.get('explanation_style') == 'concise':
            return 'Output held. ' + questions[0]['text'] + ' Reply with evidence or a value to continue.'
        missing = missing_cells(job)
        if missing:
            entity, category = missing[0]
            return f"Almost done — {entity} / {category} is blank in your sheet. What number should I put there? (You can just reply with the number, like 18, or '{entity} {category} is 18'.)"
        plan, target_headers, source_headers, unmapped_targets, unused_sources = mapping_context(job)
        if unmapped_targets:
            target_col = unmapped_targets[0]
            if len(unused_sources) == 1:
                src_col = unused_sources[0]
                return f"I matched most of your sheet, but I'm not sure what goes into '{target_col}'. Your file has a column called '{src_col}' — should I put '{src_col}' into '{target_col}'? (Just reply 'yes' or tell me which column to use.)"
            return f"Quick question to finish matching your columns: which column from your file should go into '{target_col}'? Your file has: {', '.join(h for _, h in source_headers)}."
        if questions:
            return f"Almost done — I just need one quick answer: {questions[0]['text']} Reply below in plain words or tap a quick button."
        if report:
            failed = [c['name'] + ': ' + c['detail'] for c in report['checks'] if not c['passed']][:2]
            return 'Output held: ' + '; '.join(failed)
        src_names = ', '.join(p['name'] for p in job['profiles']['sources'])
        cols = ', '.join(target_headers[:6])
        return f"Loaded {src_names} into {job['profiles']['template']['name']} (columns: {cols}). Click Run transformation (or type 'go') to fill your table."

    def object_key(tenant, job_id, file_id, extension):
        return f'customers/{tenant}/jobs/{job_id}/originals/{file_id}{extension}'

    def create_job(tenant, request_id, target_data, source_data, title):
        prior = store.request_job(tenant, request_id)
        if prior:
            return prior
        limit = settings_model()
        count, usage = store.usage(tenant)
        if count >= limit.max_jobs_per_customer:
            raise HTTPException(409, 'This customer has reached the configured job limit. Delete files or ask the admin.')
        incoming = len(target_data[1]) + sum(len(data) for _, data in source_data)
        if incoming > 50 * 1024 * 1024 or usage + incoming > limit.max_storage_mib_per_customer * 1024 * 1024:
            raise HTTPException(413, 'Batch or customer storage limit exceeded.')
        identifier = str(uuid.uuid4())
        with tempfile.TemporaryDirectory(prefix='sqm-inspect-') as directory:
            parsed, originals = [], []
            for index, (filename, data) in enumerate([target_data] + source_data):
                extension = Path(filename).suffix.lower()
                if extension not in ({'.xlsx'} if index == 0 else {'.xlsx', '.xls', '.csv'}) or len(data) > 20 * 1024 * 1024:
                    raise HTTPException(422, 'Use XLSX target and XLSX/XLS/UTF-8 CSV sources, at most 20 MiB each.')
                file_id = 'template' if index == 0 else f'source-{index}'
                path = Path(directory) / (file_id + extension)
                path.write_bytes(data)
                check_file(path)
                inspected = profile(path, file_id, template=index == 0)
                inspected['name'] = Path(filename).name[:180]
                if index == 0 and not inspected['rules'] and not inspected['config'].get('write_mode'):
                    tpl_headers = inspected['sheets'][0]['headers'] if inspected.get('sheets') and inspected['sheets'][0].get('headers') else ['Col1']
                    inspected['config'].setdefault('mode', 'direct')
                    inspected['config'].setdefault('key', tpl_headers[0])
                    inspected['config'].setdefault('write_mode', 'replace')
                    inspected['rules'].append({'id': 'R01-auto', 'kind': 'required', 'fields': [tpl_headers[0]], 'value': 'required', 'evidence': 'Default key required check'})
                parsed.append(inspected)
                originals.append({'id': file_id, 'name': inspected['name'], 'extension': extension, 'object_key': object_key(tenant, identifier, file_id, extension), 'path': str(path), 'bytes': len(data), 'data': data})
            job = {'id': identifier, 'tenant_id': tenant, 'title': title or Path(target_data[0]).name, 'created': now(), 'trace_id': str(uuid.uuid4()), 'state': 'INSPECTED', 'files': {'template': originals[0], 'sources': originals[1:]}, 'profiles': {'template': parsed[0], 'sources': parsed[1:]}, 'mapping_origin': 'Rule-informed structure recognition', 'clarifications': [], 'chat': [], 'proposal': None, 'report': None, 'knowledge_id': None, 'use_workbook_rules': False, 'stored_bytes': incoming}
            plan = infer_plan(job)
            finalise_cell_profiles(job, plan)
            job['knowledge_conflict'] = False
            job['plan'] = plan.model_dump()
            job['state'] = 'NEEDS_CLARIFICATION' if plan.questions else 'MAPPED'
            message(job, 'qms', bot_summary(job))
            for file in originals:
                blobs.put(file['object_key'], file.pop('data'))
                file.pop('path')
            try:
                saved = store.create_job(tenant, request_id, job, limit.max_jobs_per_customer, limit.max_storage_mib_per_customer * 1024 * 1024)
            except Exception:
                for file in originals:
                    blobs.delete(file['object_key'])
                raise
            if saved['id'] != identifier:
                for file in originals:
                    blobs.delete(file['object_key'])
            return saved

    def run_job(tenant, job, use_rules=False):
        if use_rules and job.get('knowledge_conflict'):
            job['use_workbook_rules'] = True
        identity = digest({'plan': job['plan'], 'inputs': [p['sha256'] for p in [job['profiles']['template']] + job['profiles']['sources']], 'conflict': job.get('use_workbook_rules'), 'confirmation': job.get('plan_confirmation')})
        if job.get('run_identity') == identity and job.get('report'):
            return job
        with materialise(job, blobs) as (work, output):
            plan = MappingPlan.model_validate(work['plan'])
            report = transform(work, plan, output, work.get('knowledge_conflict', False), work.get('use_workbook_rules', False))
            if report.status == 'RELEASED':
                key = f'customers/{tenant}/jobs/{job["id"]}/output.xlsx'
                data = output.read_bytes()
                _, stored = store.usage(tenant)
                old_size = job.get('output_bytes',0)
                if stored - old_size + len(data) > settings_model().max_storage_mib_per_customer * 1024 * 1024:
                    raise ValueError('Verified output exceeds this customer storage quota; delivery held.')
                blobs.put(key, data)
                job['stored_bytes'] = job.get('stored_bytes',0) - old_size + len(data)
                job['output_bytes'] = len(data)
                job['output_object'] = key
        job['report'] = report.model_dump()
        job['state'] = report.status
        job['run_identity'] = identity
        message(job, 'qms', bot_summary(job), 'verdict')
        store.save_job(tenant, job, 'qms_' + report.status.lower(), {'passed': report.passed_checks, 'checks': report.total_checks})
        return job

    def job_lease(function):
        @wraps(function)
        def wrapped(*args, **kwargs):
            identifier = kwargs['identifier']
            _, tenant = kwargs['identity']
            get_job(tenant, identifier)  # Reject cross-customer IDs before acquiring anything.
            try:
                with store.lease(tenant, identifier):
                    return function(*args, **kwargs)
            except ValueError as exc:
                raise HTTPException(409, str(exc)) from exc
        return wrapped

    @app.get('/health')
    def health():
        return {'status': 'ok', 'version': '0.2.0', 'demo': demo, 'production': production}

    @app.get('/', response_class=HTMLResponse)
    def index():
        html = (ROOT / 'web/index.html').read_text()
        for filename in ['app.js', 'styles.css']:
            asset = ROOT / 'web' / filename
            html = html.replace('__' + filename.split('.')[0].upper() + '_VERSION__', hashlib.sha256(asset.read_bytes()).hexdigest()[:12])
        return html

    @app.get('/api/bootstrap')
    def bootstrap(request: Request):
        return {'session_present': bool(store.session(token_for(request))), 'demo_mode': demo, 'production': production, 'version': '0.2.0', 'public_signup': False, 'note': 'Synthetic preview; live AI and real credentials are disabled.' if demo else 'Sign in to your private customer workspace.'}

    def login_result(user, response):
        token, csrf = store.new_session(user)
        response.set_cookie('sqm_session', token, httponly=True, secure=production, samesite='lax', max_age=43200)
        return {'user': {k: user[k] for k in ['id', 'name', 'email', 'role', 'tenant_id']}, 'csrf': csrf, 'demo_token': token if demo else None}

    @app.post('/api/auth/login')
    def login(body: Login, request: Request, response: Response):
        key = digest(['login', request.client.host, body.email.lower()])
        if not store.take_rate(key):
            raise HTTPException(429, 'Too many login attempts. Try later; no automatic retry.')
        user = store.user_email(body.email)
        # A dummy hash makes an unknown-email attempt perform the same expensive primitive.
        encoded = user['password_hash'] if user else password_hash('not-an-account-' + 'x' * 20)
        if not password_matches(body.password, encoded) or not user or not user['active']:
            raise HTTPException(401, 'Email or password is incorrect.')
        return login_result(user, response)

    @app.post('/api/auth/signup')
    def signup(body: Signup, request: Request, response: Response):
        key = digest(['signup', request.client.host, body.email.lower()])
        if not store.take_rate(key):
            raise HTTPException(429, 'Too many sign-up attempts. Try later.')
        if store.user_email(body.email):
            raise HTTPException(409, 'An account with this email already exists.')
        tenant = str(uuid.uuid4())
        user = store.bootstrap_user(tenant, body.name.strip(), body.email.strip(), body.display_name.strip(), 'operator', password_hash(body.password))
        prefs = Preferences.model_validate(store.preferences(user['id'])).model_dump()
        prefs['vertical'] = body.vertical
        store.save_preferences(user['id'], prefs)
        store.event('platform', None, str(uuid.uuid4()), 'customer_signup', {'tenant_id': tenant, 'vertical': body.vertical})
        return login_result(user, response)

    @app.post('/api/auth/demo')
    def demo_login(body: DemoLogin, response: Response):
        if not demo:
            raise HTTPException(404, 'Demo sign-in is disabled.')
        email = {'operator': 'operator@demo.elitesheets', 'admin': 'admin@demo.elitesheets', 'other_customer': 'other@demo.elitesheets'}[body.role]
        user = store.user_email(email)
        if body.vertical:
            prefs = Preferences.model_validate(store.preferences(user['id'])).model_dump()
            prefs['vertical'] = body.vertical
            store.save_preferences(user['id'], prefs)
        return login_result(user, response)

    @app.get('/api/auth/session')
    def session(user=Depends(current)):
        return {'user': {k: user[k] for k in ['id', 'name', 'email', 'role', 'tenant_id']}, 'csrf': user['csrf']}

    @app.post('/api/auth/logout')
    def logout(request: Request, response: Response, user=Depends(current)):
        store.logout(token_for(request))
        response.delete_cookie('sqm_session')
        return {'ok': True}

    def access_for(user_id):
        if store.get_user_limits(user_id)['paused']:
            return 'blocked'
        sub = store.get_subscription(user_id)
        if sub['status'] == 'paused':
            return 'blocked'
        if sub['status'] == 'cancelled':
            return 'read_only'
        if sub['status'] == 'past_due':
            today = datetime.now(CREDIT_TZ).strftime('%Y-%m-%d')
            return 'full' if sub['grace_until'] and today <= sub['grace_until'] else 'read_only'
        return 'full'

    def credit_limit(user_id):
        allowance = store.credit_allowance(user_id)
        return allowance if allowance is not None else store.credit_config()['included']

    def credit_view(user_id):
        granted, used = store.credit_summary(user_id, credit_month())
        included = credit_limit(user_id)
        return {'included': included, 'granted': granted, 'used': used, 'left': max(included + granted - used, 0)}

    def whole_number(value, low, high):
        return isinstance(value, int) and not isinstance(value, bool) and low <= value <= high

    def send_plain_email(settings, to, subject, body):
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = settings['sender']
        msg['To'] = to
        msg.set_content(body)
        with smtplib.SMTP(settings['host'], settings['port'], timeout=20) as smtp:
            smtp.starttls()
            if settings['user']:
                smtp.login(settings['user'], settings['password'])
            smtp.send_message(msg)

    def check_low_balance(user):
        month = credit_month()
        view = credit_view(user['id'])
        if view['included'] <= 0 or view['left'] > 0.2 * view['included']:
            return
        if store.credit_alert_sent(user['id'], month, 'low'):
            return
        settings = share_email_settings()
        if not settings:
            return  # no email service configured yet; the meter still shows the warning
        try:
            send_plain_email(settings, user['email'], 'Your Elite Sheets credits are running low',
                             f"You have {view['left']} of {view['included']} credits left this month. Credits reset on {credit_resets()}. "
                             "Buy a top-up in Elite Sheets or ask your administrator to add credits.\n\n"
                             "If you were not expecting this, you can ignore this email.")
        except Exception:
            LOG.exception('low-balance email failed')
            return
        store.record_credit_alert(user['id'], month, 'low')

    def charge_credits(user, action):
        limits = store.get_user_limits(user['id'])
        try:
            store.credit_adjust(user['id'], credit_month(), -CREDIT_COSTS[action], action, included=credit_limit(user['id']), cap=limits['spend_cap'])
        except CreditCapReached:
            raise HTTPException(402, "You have reached this month's spending cap set by your administrator.")
        except ValueError:
            raise HTTPException(402, "You have used this month's credits. Buy a top-up or wait for the monthly reset.")
        check_low_balance(user)

    def refund_credits(user, action, reason):
        store.credit_adjust(user['id'], credit_month(), CREDIT_COSTS[action], reason)

    @app.get('/api/helper/usage')
    def helper_usage_view(user=Depends(current)):
        month = credit_month()
        used = {kind: store.helper_count(user['id'], month, kind) for kind in helper.HELPER_LIMITS}
        return {'month': month, 'limits': helper.HELPER_LIMITS, 'used': used, 'configured': helper.configured(), 'subjects': helper.SUBJECTS, 'grades': helper.GRADES}

    @app.post('/api/helper/generate')
    def helper_generate(body: helper.HelperRequest, user=Depends(current)):
        month = credit_month()
        bucket_name = helper.bucket(body.kind)
        if store.helper_count(user['id'], month, bucket_name) >= helper.HELPER_LIMITS[bucket_name]:
            raise HTTPException(402, "You have used this month's Sheet Helper allowance for this kind of draft. It resets next month.")
        key = os.environ.get('SHEETQMS_GEMINI_API_KEY', '').strip()
        if not key:
            raise HTTPException(503, 'Sheet Helper is not switched on yet. Your marks and learner data are unaffected.')
        try:
            result = helper.generate(body, key, transport=getattr(app.state, 'helper_transport', None))
        except helper.HelperError as exc:
            raise HTTPException(422, str(exc))
        except httpx.HTTPError:
            raise HTTPException(502, 'The AI service did not respond. No allowance was used. Try again shortly.')
        store.helper_record(user['id'], month, bucket_name)
        return result

    @app.post('/api/helper/chat')
    def helper_chat(body: helper.ChatRequest, user=Depends(current)):
        month = credit_month()
        if store.helper_count(user['id'], month, 'chat') >= helper.HELPER_LIMITS['chat']:
            raise HTTPException(402, "You have used this month's Sheet Helper conversation messages. It resets next month.")
        key = os.environ.get('SHEETQMS_GEMINI_API_KEY', '').strip()
        if not key:
            raise HTTPException(503, 'Sheet Helper is not switched on yet. Your marks and learner data are unaffected.')
        try:
            result = helper.chat(body, key, transport=getattr(app.state, 'helper_transport', None))
        except helper.HelperError as exc:
            raise HTTPException(422, str(exc))
        except httpx.HTTPError:
            raise HTTPException(502, 'The AI service did not respond. No allowance was used. Try again shortly.')
        store.helper_record(user['id'], month, 'chat')
        return result

    @app.get('/api/credits')
    def credits(identity=Depends(workspace)):
        user, _ = identity
        return {'month': credit_month(), **credit_view(user['id']), 'resets': credit_resets(), 'costs': CREDIT_COSTS, 'access': access_for(user['id'])}

    @app.get('/api/admin/credit-settings')
    def admin_credit_settings(user=Depends(administrator)):
        return store.credit_config()

    @app.put('/api/admin/credit-settings')
    def save_admin_credit_settings(body: dict, user=Depends(administrator)):
        included, fee = body.get('included'), body.get('monthly_fee')
        if not whole_number(included, 0, 5000) or not whole_number(fee, 0, 10000):
            raise HTTPException(422, 'Included credits must be 0 to 5000 and the monthly fee 0 to 10000 rand.')
        before = store.credit_config()
        store.save_credit_config(included, fee)
        store.audit(user['id'], 'settings', 'platform', {'from': before, 'to': {'included': included, 'monthly_fee': fee}})
        return store.credit_config()

    @app.get('/api/admin/credits')
    def admin_credits(q: str = '', flag: str = '', user=Depends(administrator)):
        month = credit_month()
        cfg = store.credit_config()
        allowances = store.credit_allowances_map()
        everyone = []
        for row in store.credit_directory(month):
            included = allowances.get(row['id'], cfg['included'])
            left_raw = included + row['granted'] - row['used']
            status = 'zero' if left_raw <= 0 else ('low' if left_raw <= 0.2 * included else 'ok')
            lim = store.get_user_limits(row['id'])
            everyone.append({'paused': lim['paused'], 'spend_cap': lim['spend_cap'], 'subscription': store.get_subscription(row['id'])['status'], 'id': row['id'], 'name': row['name'], 'email': row['email'], 'role': row['role'], 'workspace': row['tenant_name'], 'included': included, 'granted': row['granted'], 'used': row['used'], 'left': max(left_raw, 0), 'status': status})
        needle = q.strip().lower()
        items = []
        for item in everyone:
            if needle and needle not in f"{item['name']} {item['email']} {item['workspace']}".lower():
                continue
            if flag == 'flagged' and item['status'] == 'ok':
                continue
            if flag == 'zero' and item['status'] != 'zero':
                continue
            items.append(item)
        return {'month': month, 'resets': credit_resets(), 'settings': cfg, 'items': items, 'total': len(everyone), 'flagged': sum(1 for i in everyone if i['status'] != 'ok')}

    @app.get('/api/admin/credits/{user_id}/history')
    def admin_credit_history(user_id: str, user=Depends(administrator)):
        target = store.user_by_id(user_id)
        if not target:
            raise HTTPException(404, 'That user was not found.')
        return {'user': {'name': target['name'], 'email': target['email'], 'workspace': target['tenant_name']}, 'view': credit_view(user_id), 'ledger': store.credit_history(user_id), 'audit': store.audit_list(user_id)}

    @app.put('/api/admin/credits/{user_id}/cap')
    def admin_set_cap(user_id: str, body: dict, user=Depends(administrator)):
        cap = body.get('spend_cap')
        reason = str(body.get('reason') or '').strip()
        if cap is not None and not whole_number(cap, 0, 5000):
            raise HTTPException(422, 'The spending cap must be blank (no cap) or a whole number from 0 to 5000.')
        if len(reason) < 3:
            raise HTTPException(422, 'Give a reason of at least 3 characters.')
        if not store.user_by_id(user_id):
            raise HTTPException(404, 'That user was not found.')
        before = store.get_user_limits(user_id)
        store.save_user_limits(user_id, before['paused'], before['pause_reason'], cap)
        store.audit(user['id'], 'cap', user_id, {'from': before['spend_cap'], 'to': cap, 'reason': reason})
        return {**credit_view(user_id), 'spend_cap': cap}

    @app.put('/api/admin/credits/{user_id}/pause')
    def admin_pause_user(user_id: str, body: dict, user=Depends(administrator)):
        paused = body.get('paused')
        reason = str(body.get('reason') or '').strip()
        if not isinstance(paused, bool):
            raise HTTPException(422, 'Say whether to pause or restore the account.')
        if paused and len(reason) < 3:
            raise HTTPException(422, 'Give a reason of at least 3 characters.')
        target = store.user_by_id(user_id)
        if not target:
            raise HTTPException(404, 'That user was not found.')
        if target['role'] == 'admin':
            raise HTTPException(422, 'Admin accounts cannot be paused.')
        before = store.get_user_limits(user_id)
        store.save_user_limits(user_id, paused, reason if paused else '', before['spend_cap'])
        store.audit(user['id'], 'pause' if paused else 'restore', user_id, {'reason': reason})
        return {**credit_view(user_id), 'paused': paused}

    @app.post('/api/admin/credits/{user_id}/undo/{ledger_id}')
    def admin_undo_charge(user_id: str, ledger_id: str, body: dict, user=Depends(administrator)):
        reason = str(body.get('reason') or '').strip()
        if len(reason) < 3:
            raise HTTPException(422, 'Give a reason of at least 3 characters.')
        if not store.user_by_id(user_id):
            raise HTTPException(404, 'That user was not found.')
        try:
            credits = store.undo_credit(user_id, ledger_id, user['id'], reason)
        except LookupError:
            raise HTTPException(404, 'That charge was not found for this user.')
        except ValueError:
            raise HTTPException(409, 'That charge has already been undone.')
        store.audit(user['id'], 'undo', user_id, {'ledger_id': ledger_id, 'credits': credits, 'reason': reason})
        return credit_view(user_id)

    @app.get('/api/admin/margin')
    def admin_margin(user=Depends(administrator)):
        month = credit_month()
        cfg = store.credit_config()
        people = [r for r in store.credit_directory(month) if r['role'] != 'admin']
        rows = store.credit_ledger_rows(month)
        spent = -sum(int(r['delta']) for r in rows if not r['reason'].startswith(GRANT_PREFIX))
        granted = sum(int(r['delta']) for r in rows if r['reason'].startswith(GRANT_PREFIX))
        revenue = round(cfg['monthly_fee'] * len(people) / (1 + VAT_RATE), 2)
        cost = round(spent * CREDIT_PROVIDER_COST_RAND, 2)
        margin = round((revenue - cost) / revenue * 100, 1) if revenue else None
        return {'month': month, 'users': len(people), 'fee': cfg['monthly_fee'], 'revenue_excl_vat': revenue,
                'credits_spent': spent, 'credits_granted': granted, 'estimated_cost': cost, 'margin_pct': margin,
                'assumption': 'Assumes every non-admin user pays the monthly fee. Billing is not connected yet, so top-ups are not counted as revenue. Fixed platform costs are not included.'}

    @app.post('/api/admin/credits/grant-bulk')
    def admin_grant_bulk(body: dict, user=Depends(administrator)):
        ids = body.get('user_ids')
        amount = body.get('amount')
        reason = str(body.get('reason') or '').strip()
        if not isinstance(ids, list) or not ids or len(ids) > 500 or not all(isinstance(i, str) for i in ids):
            raise HTTPException(422, 'Select between 1 and 500 users.')
        ids = list(dict.fromkeys(ids))
        if not whole_number(amount, 1, 10000):
            raise HTTPException(422, 'Enter a whole number of credits from 1 to 10000.')
        if len(reason) < 3:
            raise HTTPException(422, 'Give a reason of at least 3 characters.')
        if any(not store.user_by_id(i) for i in ids):
            raise HTTPException(404, 'Some selected users were not found. Nothing was granted.')
        month = credit_month()
        for uid in ids:
            store.credit_adjust(uid, month, amount, GRANT_PREFIX + reason)
            store.audit(user['id'], 'grant', uid, {'amount': amount, 'reason': reason, 'bulk': True})
        return {'granted_to': len(ids), 'amount': amount}

    @app.get('/api/admin/exports/balances')
    def admin_export_balances(q: str = '', flag: str = '', user=Depends(administrator)):
        data = admin_credits(q=q, flag=flag, user=user)
        header = ['Name', 'Email', 'Workspace', 'Allowance', 'Spending cap', 'Used', 'Left', 'Status']
        rows = [[i['name'], i['email'], i['workspace'], i['included'], '' if i['spend_cap'] is None else i['spend_cap'], i['used'], i['left'], i['status']] for i in data['items']]
        return {'filename': f"credit-balances-{data['month']}.csv", 'csv': csv_text(header, rows)}

    @app.get('/api/admin/exports/ledger')
    def admin_export_ledger(month: str = '', user=Depends(administrator)):
        month = month or credit_month()
        if not re.fullmatch(r'\d{4}-\d{2}', month):
            raise HTTPException(422, 'Month must look like 2026-10.')
        header = ['When', 'Month', 'Name', 'Email', 'Workspace', 'Credits', 'Reason', 'Ledger ID']
        rows = [[r['created'], r['month'], r['name'], r['email'], r['tenant_name'], r['delta'], r['reason'], r['id']] for r in store.credit_ledger_rows(month)]
        return {'filename': f'credit-ledger-{month}.csv', 'csv': csv_text(header, rows)}

    def provider_view(p):
        keys = store.provider_keys(p['id']) or {}
        return {'id': p['id'], 'name': p['name'], 'merchant_ref': p['merchant_ref'], 'settlement_last4': p['settlement_last4'], 'active': bool(p['active']), 'is_default': bool(p['is_default']),
                'kind': p.get('kind') or 'manual', 'mode': p.get('mode') or 'test', 'public_key': keys.get('public_key') or '',
                'secret_configured': bool(keys.get('secret_sealed')), 'secret_key_last4': keys.get('secret_last4') or '', 'webhook_configured': bool(keys.get('webhook_sealed'))}

    @app.get('/api/admin/payment-providers')
    def admin_providers(user=Depends(administrator)):
        return {'items': [provider_view(p) for p in store.list_providers()]}

    @app.post('/api/admin/payment-providers')
    def admin_add_provider(body: dict, user=Depends(administrator)):
        name = str(body.get('name') or '').strip()
        ref = str(body.get('merchant_ref') or '').strip()
        account = re.sub(r'\s', '', str(body.get('settlement_account') or ''))
        make_default = bool(body.get('make_default', False))
        kind = body.get('kind') or 'manual'
        if kind not in ('manual', 'yoco'):
            raise HTTPException(422, 'Choose manual recording or Yoco.')
        if not 2 <= len(name) <= 60:
            raise HTTPException(422, 'Enter the provider name.')
        if not 3 <= len(ref) <= 80:
            raise HTTPException(422, 'Enter the merchant or account reference (3 to 80 characters).')
        if not re.fullmatch(r'\d{4,20}', account):
            raise HTTPException(422, 'Enter the settlement bank account number, digits only (4 to 20).')
        provider_id = store.add_provider(name, ref, account[-4:], make_default, kind=kind)
        store.audit(user['id'], 'provider_add', 'payment-providers', {'provider': name, 'kind': kind, 'settles_to_last4': account[-4:], 'default': make_default})
        return provider_view(store.get_provider(provider_id))

    @app.put('/api/admin/payment-providers/{provider_id}/default')
    def admin_default_provider(provider_id: str, user=Depends(administrator)):
        p = store.get_provider(provider_id)
        if not p:
            raise HTTPException(404, 'That provider was not found.')
        if not p['active']:
            raise HTTPException(422, 'This provider is inactive. Add it again to use it.')
        store.set_default_provider(provider_id)
        store.audit(user['id'], 'provider_default', 'payment-providers', {'provider': p['name']})
        return {'ok': True}

    @app.put('/api/admin/payment-providers/{provider_id}/deactivate')
    def admin_deactivate_provider(provider_id: str, user=Depends(administrator)):
        p = store.get_provider(provider_id)
        if not p:
            raise HTTPException(404, 'That provider was not found.')
        store.deactivate_provider(provider_id)
        store.audit(user['id'], 'provider_deactivate', 'payment-providers', {'provider': p['name']})
        return {'ok': True}

    def public_base(request: Request):
        return (os.getenv('SHEETQMS_PUBLIC_URL') or str(request.base_url)).rstrip('/')

    @app.put('/api/admin/payment-providers/{provider_id}/keys')
    def admin_provider_keys(provider_id: str, body: dict, user=Depends(administrator)):
        """Write-only: keys are sealed before storage and never returned. Only the last 4 characters are shown."""
        p = store.get_provider(provider_id)
        if not p:
            raise HTTPException(404, 'That provider was not found.')
        if p['kind'] != 'yoco':
            raise HTTPException(422, 'Keys are only used by online providers such as Yoco.')
        if not (encryption_key or os.getenv('SHEETQMS_ENCRYPTION_KEY')):
            raise HTTPException(422, 'Configure a stable encryption key through private environment/secret manager before saving keys.')
        mode = body.get('mode')
        if mode not in ('test', 'live'):
            raise HTTPException(422, 'Choose test or live mode.')
        secret = str(body.get('secret_key') or '').strip()
        webhook = str(body.get('webhook_secret') or '').strip()
        public = str(body.get('public_key') or '').strip()
        if not (secret or webhook or public):
            raise HTTPException(422, 'Enter at least one key to save.')
        if not secret and mode != p['mode']:
            raise HTTPException(422, 'Enter the secret key for the new mode.')
        secret_sealed, last4 = None, None
        if secret:
            if not yoco.SECRET_KEY_PATTERN.fullmatch(secret) or yoco.key_mode(secret) != mode:
                raise HTTPException(422, 'The secret key must start with sk_test_ in test mode or sk_live_ in live mode.')
            secret_sealed, last4 = vault.seal(secret), secret[-4:]
        webhook_sealed = None
        if webhook:
            if not yoco.WEBHOOK_SECRET_PATTERN.fullmatch(webhook):
                raise HTTPException(422, 'The webhook signing secret must start with whsec_.')
            webhook_sealed = vault.seal(webhook)
        if public and (not yoco.PUBLIC_KEY_PATTERN.fullmatch(public) or public.split('_')[1] != mode):
            raise HTTPException(422, 'The public key must match the chosen mode (pk_test_ or pk_live_).')
        store.save_provider_keys(provider_id, secret_sealed, webhook_sealed, public or None, last4, mode)
        store.audit(user['id'], 'provider_keys', provider_id, {'provider': p['name'], 'mode': mode, 'secret_saved': bool(secret), 'webhook_saved': bool(webhook), 'public_saved': bool(public), 'secret_last4': last4})
        return provider_view(store.get_provider(provider_id))

    @app.get('/api/billing/me')
    def billing_me(user=Depends(current)):
        if user['role'] == 'admin':
            return {'access': 'full', 'can_pay': False, 'fee': None, 'subscription': None, 'provider': None}
        p = store.default_provider()
        keys = store.provider_keys(p['id']) if p else None
        ready = bool(p and p['kind'] == 'yoco' and keys and keys['secret_sealed'])
        return {'access': access_for(user['id']), 'can_pay': bool(ready), 'fee': store.credit_config()['monthly_fee'],
                'subscription': store.get_subscription(user['id'])['status'], 'provider': p['name'] if ready else None}

    @app.post('/api/billing/checkout')
    def start_checkout(request: Request, user=Depends(current)):
        """Creates a hosted Yoco checkout for the monthly fee. The amount comes from the server, never from the browser."""
        if user['role'] == 'admin':
            raise HTTPException(422, 'Admin accounts do not have payments.')
        p = store.default_provider()
        keys = store.provider_keys(p['id']) if p else None
        if not p or p['kind'] != 'yoco' or not keys or not keys['secret_sealed']:
            raise HTTPException(422, 'Online payment is not set up yet. Please contact your administrator.')
        if store.pending_checkout_count(user['id']) >= 5:
            raise HTTPException(429, 'You have several unfinished payments. Wait a few minutes or contact your administrator.')
        try:
            secret = vault.open(keys['secret_sealed'])
        except ValueError:
            raise HTTPException(422, 'Stored payment keys cannot be read. Ask the administrator to re-enter them.')
        fee = store.credit_config()['monthly_fee']
        cents = int(round(float(fee) * 100))
        checkout_id = str(uuid.uuid4())
        reference = 'SUB-' + checkout_id[:8].upper()
        store.create_checkout(checkout_id, p['id'], user['id'], 'subscription', cents, reference)
        base = public_base(request)
        try:
            created = yoco.create_checkout(secret, cents, 'ZAR', base + '/?billing=success', base + '/?billing=cancelled', base + '/?billing=failed',
                                           {'checkout_id': checkout_id, 'reference': reference}, checkout_id)
        except yoco.YocoError as exc:
            store.mark_checkout_failed(checkout_id)
            raise HTTPException(502, str(exc))
        store.set_checkout_external(checkout_id, created['id'])
        store.audit(user['id'], 'checkout_start', user['id'], {'reference': reference, 'amount_cents': cents, 'provider': p['name'], 'mode': p['mode']})
        return {'redirect_url': created['redirectUrl'], 'reference': reference, 'amount_rand': fee}

    @app.post('/api/webhooks/yoco/{provider_id}')
    async def yoco_webhook(provider_id: str, request: Request):
        """Public endpoint, protected by the signature. A payment is recorded only after Yoco confirms it and only once."""
        body = await request.body()
        p = store.get_provider(provider_id)
        keys = store.provider_keys(provider_id) if p else None
        if not p or not p['active'] or p['kind'] != 'yoco' or not keys or not keys['webhook_sealed'] or not keys['secret_sealed']:
            raise HTTPException(404, 'Not found.')
        try:
            whsec, secret = vault.open(keys['webhook_sealed']), vault.open(keys['secret_sealed'])
        except ValueError:
            raise HTTPException(500, 'Stored keys cannot be read.')
        try:
            yoco.verify_webhook(whsec, request.headers, body)
        except yoco.WebhookError:
            raise HTTPException(400, 'Signature check failed.')
        try:
            event = json.loads(body)
        except ValueError:
            raise HTTPException(400, 'Bad payload.')
        if not isinstance(event, dict) or event.get('type') != 'payment.succeeded':
            return {'ignored': True}
        data = event.get('data') or event.get('payload') or {}
        external = str(data.get('id') or '') if isinstance(data, dict) else ''
        local = store.checkout_by_external(external) if external else None
        if not local or local['provider_id'] != provider_id:
            return {'ignored': True}
        try:
            remote = yoco.fetch_checkout(secret, external)
        except yoco.YocoError:
            raise HTTPException(502, 'Could not confirm with Yoco yet. Yoco will retry.')
        if not yoco.is_paid(remote, local['amount_cents']):
            return {'ignored': True}
        if not store.mark_checkout_paid(local['id']):
            return {'already_recorded': True}
        cents = int(local['amount_cents'])
        vat = cents - int(round(cents / (1 + VAT_RATE)))
        store.add_payment(local['user_id'], local['kind'], cents, vat, 0, local['reference'], 'yoco', provider_id=provider_id)
        store.audit('system:yoco', 'payment_received', local['user_id'], {'reference': local['reference'], 'amount_cents': cents, 'vat_cents': vat, 'provider': p['name'], 'mode': p['mode'], 'event_id': request.headers.get('webhook-id', '')})
        return {'recorded': True}

    @app.get('/api/admin/billing/{user_id}')
    def admin_billing(user_id: str, user=Depends(administrator)):
        target = store.user_by_id(user_id)
        if not target:
            raise HTTPException(404, 'That user was not found.')
        return {'user': {'name': target['name'], 'email': target['email'], 'workspace': target['tenant_name'], 'role': target['role']},
                'subscription': store.get_subscription(user_id), 'access': access_for(user_id), 'fee': store.credit_config()['monthly_fee'],
                'included': credit_limit(user_id), 'payments': store.user_payments(user_id),
                'providers': [provider_view(p) for p in store.list_providers() if p['active']]}

    @app.put('/api/admin/billing/{user_id}/subscription')
    def admin_set_subscription(user_id: str, body: dict, user=Depends(administrator)):
        status = body.get('status')
        period_end = body.get('period_end') or None
        grace_until = body.get('grace_until') or None
        reason = str(body.get('reason') or '').strip()
        if status not in SUBSCRIPTION_STATUSES:
            raise HTTPException(422, 'Choose a valid subscription status.')
        if not valid_date(period_end) or not valid_date(grace_until):
            raise HTTPException(422, 'Dates must look like 2026-11-30.')
        if status == 'past_due' and not grace_until:
            raise HTTPException(422, 'Set the grace end date for a past-due account.')
        if len(reason) < 3:
            raise HTTPException(422, 'Give a reason of at least 3 characters.')
        target = store.user_by_id(user_id)
        if not target:
            raise HTTPException(404, 'That user was not found.')
        if target['role'] == 'admin':
            raise HTTPException(422, 'Admin accounts do not have a subscription.')
        before = store.get_subscription(user_id)
        store.save_subscription(user_id, status, period_end, grace_until)
        store.audit(user['id'], 'subscription', user_id, {'from': before['status'], 'to': status, 'period_end': period_end, 'grace_until': grace_until, 'reason': reason})
        return {'subscription': store.get_subscription(user_id), 'access': access_for(user_id)}

    @app.post('/api/admin/billing/{user_id}/payments')
    def admin_record_payment(user_id: str, body: dict, user=Depends(administrator)):
        kind = body.get('kind')
        amount = body.get('amount_rand')
        reference = str(body.get('reference') or '').strip()
        credits = body.get('credits', 0)
        if kind not in ('subscription', 'topup'):
            raise HTTPException(422, 'Choose subscription or top-up.')
        if not isinstance(amount, (int, float)) or isinstance(amount, bool) or not 0 < amount <= 100000:
            raise HTTPException(422, 'Enter the amount in rand, including VAT, from 0.01 to 100000.')
        if not 3 <= len(reference) <= 80:
            raise HTTPException(422, 'Enter the payment reference (3 to 80 characters).')
        if kind == 'topup':
            if not whole_number(credits, 1, 100000):
                raise HTTPException(422, 'Enter how many credits this top-up buys.')
        else:
            credits = 0
        target = store.user_by_id(user_id)
        if not target:
            raise HTTPException(404, 'That user was not found.')
        if target['role'] == 'admin':
            raise HTTPException(422, 'Admin accounts do not have payments.')
        if store.payment_reference_exists(user_id, reference):
            raise HTTPException(409, 'That payment reference is already recorded for this user.')
        provider = None
        requested = body.get('provider_id')
        if requested:
            provider = store.get_provider(str(requested))
            if not provider or not provider['active']:
                raise HTTPException(422, 'Choose an active payment provider.')
        else:
            provider = store.default_provider()
            if not provider:
                raise HTTPException(422, 'Add a payment provider in the Billing section before recording payments.')
        cents = int(round(float(amount) * 100))
        vat = cents - int(round(cents / (1 + VAT_RATE)))
        store.add_payment(user_id, kind, cents, vat, credits, reference, user['id'], provider_id=provider['id'])
        if kind == 'topup':
            store.credit_adjust(user_id, credit_month(), credits, 'Top-up payment: ' + reference)
        store.audit(user['id'], 'payment', user_id, {'kind': kind, 'amount_cents': cents, 'vat_cents': vat, 'credits': credits, 'reference': reference, 'provider': provider['name']})
        return {'recorded': True, 'excl_vat_cents': cents - vat, 'vat_cents': vat, 'credits_added': credits, 'provider': provider['name'], 'access': access_for(user_id)}

    @app.post('/api/admin/credits/{user_id}/grant')
    def admin_grant_credits(user_id: str, body: dict, user=Depends(administrator)):
        amount = body.get('amount')
        reason = str(body.get('reason') or '').strip()
        if not whole_number(amount, 1, 10000):
            raise HTTPException(422, 'Enter a whole number of credits from 1 to 10000.')
        if len(reason) < 3:
            raise HTTPException(422, 'Give a reason of at least 3 characters.')
        if not store.user_by_id(user_id):
            raise HTTPException(404, 'That user was not found.')
        store.credit_adjust(user_id, credit_month(), amount, 'Admin grant: ' + reason)
        store.audit(user['id'], 'grant', user_id, {'amount': amount, 'reason': reason})
        return credit_view(user_id)

    @app.put('/api/admin/credits/{user_id}/allowance')
    def admin_set_allowance(user_id: str, body: dict, user=Depends(administrator)):
        included = body.get('included')
        reason = str(body.get('reason') or '').strip()
        if not whole_number(included, 0, 5000):
            raise HTTPException(422, 'Monthly credits must be a whole number from 0 to 5000.')
        if len(reason) < 3:
            raise HTTPException(422, 'Give a reason of at least 3 characters.')
        if not store.user_by_id(user_id):
            raise HTTPException(404, 'That user was not found.')
        before = credit_limit(user_id)
        store.save_credit_allowance(user_id, included)
        store.audit(user['id'], 'allowance', user_id, {'from': before, 'to': included, 'reason': reason})
        return credit_view(user_id)

    @app.get('/api/overview')
    def overview(identity=Depends(workspace)):
        user, tenant = identity
        data = store.job_list(tenant)
        return {'workspace': store.tenant(tenant), 'jobs': [{'id': j['id'], 'title': j['title'], 'state': j['state'], 'created': j['created'], 'sources': len(j['profiles']['sources'])} for j in data], 'stats': {'jobs': len(data), 'released': sum(j['state'] == 'RELEASED' for j in data), 'held': sum(j['state'] == 'HELD' for j in data), 'knowledge': len([k for k in store.knowledge(tenant) if k['active']])}, 'ai': settings_public(False), 'preferences': Preferences.model_validate(store.preferences(user['id'])).model_dump()}

    @app.get('/api/preferences')
    def get_preferences(user=Depends(current)):
        return Preferences.model_validate(store.preferences(user['id']))

    @app.put('/api/preferences')
    def put_preferences(body: Preferences, user=Depends(current)):
        store.save_preferences(user['id'], body.model_dump())
        return body

    @app.post('/api/demo/jobs')
    def example(body: dict, identity=Depends(workspace)):
        if not demo:
            raise HTTPException(404, 'Synthetic intake is disabled in production.')
        _, tenant = identity
        case = body.get('case', 'pivot')
        if case not in {'pivot', 'hold', 'unpivot', 'direct', 'form', 'sasams_students'}:
            raise HTTPException(422, 'Unknown example case.')
        request_id = str(body.get('request_id', ''))
        if not 8 <= len(request_id) <= 100:
            raise HTTPException(422, 'A bounded intake request identity is required.')
        target, sources = sample_case(samples_dir, case)
        job = create_job(tenant, request_id, (target.name, target.read_bytes()), [(p.name, p.read_bytes()) for p in sources], '')
        return public(job)

    @app.post('/api/jobs')
    async def intake(sources: list[UploadFile] = File(...), target: UploadFile | None = File(None), request_id: str = Form(...), title: str = Form(''), identity=Depends(workspace)):
        _, tenant = identity
        if not 1 <= len(sources) <= 10 or not 8 <= len(request_id) <= 100:
            raise HTTPException(422, 'Use 1–10 sources and a request identity.')
        source_bytes = [(source.filename or 'source.csv', await source.read(20 * 1024 * 1024 + 1)) for source in sources]
        if target is not None and target.filename:
            target_bytes = await target.read(20 * 1024 * 1024 + 1)
            t_ext = Path(target.filename).suffix.lower()
            if t_ext in {'.csv', '.xls'}:
                from openpyxl import Workbook
                from .workbooks import book_rows
                with tempfile.TemporaryDirectory() as tmpd:
                    cp = Path(tmpd) / ('target' + t_ext)
                    cp.write_bytes(target_bytes)
                    sheets_dict = book_rows(cp, data_only=True)
                    first_sheet = next(iter(sheets_dict.values()), [])
                wb = Workbook()
                ws = wb.active
                ws.title = 'Output'
                for r in first_sheet:
                    ws.append(r)
                bio = BytesIO()
                wb.save(bio)
                target_tuple = (Path(target.filename).stem + '.xlsx', bio.getvalue())
            else:
                target_tuple = (target.filename, target_bytes)
        else:
            from openpyxl import Workbook
            from .workbooks import PERIOD_TOKENS
            first_name, first_data = source_bytes[0]
            ext = Path(first_name).suffix.lower()
            with tempfile.TemporaryDirectory() as tmpd:
                p = Path(tmpd) / ('src' + ext)
                p.write_bytes(first_data)
                src_prof = profile(p, 'source-1')
            src_headers = src_prof['sheets'][0]['headers'] if src_prof.get('sheets') and src_prof['sheets'][0].get('headers') else ['Col1']
            period_cols = [h for h in src_headers if norm(h) in PERIOD_TOKENS]
            wb = Workbook()
            ws = wb.active
            ws.title = 'Output'
            if len(period_cols) >= 2:
                key_col = next((h for h in src_headers if h not in period_cols and norm(h) not in {'total', 'subtotal'}), 'Site')
                out_headers = ['Site' if norm(key_col) in {'branch', 'location', 'site', 'store'} else key_col] + period_cols + ['Total']
                ws.append(out_headers)
            elif any('accession' in norm(h) or norm(h).startswith(('parent 1 ', 'parent 2 ')) or re.search(r'\(\s*gr(?:ade)?\.?\s*\d{1,2}\s*\)', h, re.I) for h in src_headers) or (len(source_bytes) >= 2 and {'first name', 'last name', 'grade'} <= {norm(h) for h in src_headers}):
                ws.append(['Student ID', 'First Name', 'Last Name', 'Date of Birth', 'Grade', 'Subjects', 'Parent First Name', 'Parent Last Name', 'Parent Email', 'Parent Phone'])
            else:
                ws.append(src_headers)
            bio = BytesIO()
            wb.save(bio)
            target_tuple = (Path(first_name).stem + '-output.xlsx', bio.getvalue())
        try:
            job = create_job(tenant, request_id, target_tuple, source_bytes, title[:160])
            try:
                job['chat'] = []
                job = run_job(tenant, job)
            except Exception:
                if not job.get('chat'):
                    message(job, 'qms', bot_summary(job))
            return public(job)
        except ValueError as exc:
            raise HTTPException(422, str(exc)) from exc

    @app.post('/api/jobs/{identifier}/map-column')
    @job_lease
    def map_column(identifier: str, body: dict, identity=Depends(workspace)):
        user, tenant = identity
        job = get_job(tenant, identifier)
        target_col = str(body.get('target_column', '')).strip()
        source_col = str(body.get('source_column', '')).strip()
        plan = MappingPlan.model_validate(job['plan'])
        _, target_headers, source_headers, _, _ = mapping_context(job)
        if target_col not in target_headers or not plan.sources:
            raise HTTPException(422, 'Unknown target column.')
        src_obj = plan.sources[0]
        if source_col:
            src_obj.field_map[target_col] = source_col
        else:
            src_obj.field_map.pop(target_col, None)
        all_targets_mapped = all(src_obj.field_map.get(th) for th in target_headers)
        if all_targets_mapped:
            mapped_vals = set(src_obj.field_map.values())
            src_obj.ignored_columns = {sh: 'Excluded via operator column selector' for _, sh in source_headers if sh not in mapped_vals}
            plan.questions = [q for q in plan.questions if target_col.casefold() not in q.text.casefold() and source_col.casefold() not in q.text.casefold() and not q.id.endswith(':unused')]
        else:
            plan.questions = [q for q in plan.questions if target_col.casefold() not in q.text.casefold() and (not source_col or source_col.casefold() not in q.text.casefold())]
        job['plan'] = plan.model_dump()
        job['plan_confirmation'] = f'Operator mapped {source_col} -> {target_col} ({user["id"]})'
        job['proposal'] = None
        job.pop('run_identity', None)
        message(job, 'user', f'Map {source_col or "(none)"} → {target_col}')
        job = run_job(tenant, job)
        return public(job)

    @app.get('/api/jobs/{identifier}')
    def read_job(identifier: str, identity=Depends(workspace)):
        _, tenant = identity
        return public(get_job(tenant, identifier))

    @app.post('/api/jobs/{identifier}/run')
    @job_lease
    def run(identifier: str, body: Run, identity=Depends(workspace)):
        _, tenant = identity
        job = get_job(tenant, identifier)
        try:
            return public(run_job(tenant, job, body.use_workbook_rules))
        except (ValueError, OSError) as exc:
            raise HTTPException(422, 'Transformation could not complete safely. Review the source/mapping; no new final output was released.') from exc

    @app.put('/api/jobs/{identifier}/plan')
    @job_lease
    def update_plan(identifier: str, body: PlanConfirm, identity=Depends(workspace)):
        user, tenant = identity
        job = get_job(tenant, identifier)
        job.update(plan=body.plan.model_dump(), plan_confirmation=body.confirmation, report=None, proposal=None, state='MAPPED', mapping_origin='Operator-confirmed structured mapping')
        job.pop('run_identity', None)
        message(job, 'qms', 'Your exact mapping revision is confirmed and recorded. I am running QMS against the actual inputs—not trusting the confirmation as a waiver.')
        store.save_job(tenant, job, 'operator_mapping_confirmed', {'actor': user['id']})
        return public(run_job(tenant, job))

    def save_edited_workbook(tenant, job, summary_text, quiet=False):
        from openpyxl import Workbook, load_workbook
        from openpyxl.styles import Font, PatternFill
        report = job['report']
        headers = report['headers']
        rows = report['rows']
        plan = MappingPlan.model_validate(job['plan'])
        for rule in plan.rules:
            if rule.kind == 'sum' and rule.fields:
                total_col = rule.fields[0]
                parts = [p.strip() for p in rule.value.split(',') if p.strip() in headers]
                if total_col in headers and parts:
                    for row in rows:
                        vals = [row.get(p) for p in parts]
                        if all(v is not None and str(v).strip() != '' for v in vals):
                            try:
                                total = sum(decimal_value(v) for v in vals)
                                row[total_col] = int(total) if total == int(total) else float(total)
                            except Exception:
                                pass
        header_row = plan.destination.header_row or 1
        sheet_name = plan.destination.sheet or 'Output'
        tpl_key = job.get('files', {}).get('template', {}).get('object_key')
        if tpl_key:
            wb = load_workbook(BytesIO(blobs.get(tpl_key)))
            ws = wb[sheet_name] if sheet_name in wb.sheetnames else wb.active
            for r_idx in range(header_row + 1, ws.max_row + 1):
                for c_idx in range(1, max(ws.max_column, len(headers)) + 1):
                    ws.cell(row=r_idx, column=c_idx, value=None)
            for c_idx, h in enumerate(headers, start=1):
                ws.cell(row=header_row, column=c_idx, value=h)
            for r_offset, row in enumerate(rows, start=1):
                for c_idx, h in enumerate(headers, start=1):
                    _text_safe_cell(ws.cell(row=header_row + r_offset, column=c_idx, value=row.get(h)))
        else:
            wb = Workbook()
            ws = wb.active
            ws.title = sheet_name
            ws.append(headers)
            for cell in ws[1]:
                cell.font = Font(bold=True, color='FFFFFF')
                cell.fill = PatternFill('solid', fgColor='3559E0')
            for row in rows:
                ws.append([row.get(h) for h in headers])
                _text_safe_cell(*ws[ws.max_row])
        bio = BytesIO()
        wb.save(bio)
        data = bio.getvalue()
        key = f'customers/{tenant}/jobs/{job["id"]}/output.xlsx'
        old_size = job.get('output_bytes', 0)
        blobs.put(key, data)
        job['stored_bytes'] = job.get('stored_bytes', 0) - old_size + len(data)
        job['output_bytes'] = len(data)
        job['output_object'] = key
        report['output_sha256'] = hashlib.sha256(data).hexdigest()
        report['output_rows'] = len(rows)
        has_missing = any(row.get(h) is None for row in rows for h in headers)
        if not has_missing:
            report['status'] = 'RELEASED'
            report['passed_checks'] = report['total_checks']
            report['questions'] = []
            job['state'] = 'RELEASED'
        job['mapping_origin'] = 'Client-requested chat edit' if not quiet else 'Spreadsheet grid edit'
        if not quiet:
            message(job, 'qms', summary_text)
        return job

    def released_output_bytes(job):
        if not job.get('report') or job['report']['status'] != 'RELEASED':
            raise HTTPException(409, 'QMS has not released this output.')
        for file, inspected in zip([job['files']['template']] + job['files']['sources'], [job['profiles']['template']] + job['profiles']['sources']):
            if hashlib.sha256(blobs.get(file['object_key'])).hexdigest() != inspected['sha256']:
                raise HTTPException(409, 'Original input changed; download blocked.')
        data = blobs.get(job['output_object'])
        if hashlib.sha256(data).hexdigest() != job['report']['output_sha256']:
            raise HTTPException(409, 'Final artifact hash changed; download blocked.')
        return data

    XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    @app.get('/api/jobs/{identifier}/output')
    def output(identifier: str, identity=Depends(workspace)):
        _, tenant = identity
        job = get_job(tenant, identifier)
        data = released_output_bytes(job)
        return Response(data, media_type=XLSX_TYPE, headers={'Content-Disposition': 'attachment; filename="EliteSheets-verified.xlsx"'})

    SHARE_DAYS = {1, 7, 30}

    def create_share_link(tenant, job, days):
        secret = secrets.token_urlsafe(32)
        share_id = uuid.uuid4().hex[:12]
        expires = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
        job.setdefault('shares', []).append({'id': share_id, 'hash': hashlib.sha256(secret.encode()).hexdigest(), 'expires': expires, 'created': now(), 'days': days})
        store.save_job(tenant, job, 'share_link_created', {'share_id': share_id, 'days': days})
        return {'share_id': share_id, 'url': f'/api/shared/{tenant}~{job["id"]}~{secret}', 'expires': expires, 'days': days}

    def share_email_settings():
        host = os.getenv('SHEETQMS_SMTP_HOST')
        sender = os.getenv('SHEETQMS_SMTP_FROM')
        if not host or not sender:
            return None
        return {'host': host, 'port': int(os.getenv('SHEETQMS_SMTP_PORT', '587')), 'user': os.getenv('SHEETQMS_SMTP_USER', ''), 'password': os.getenv('SHEETQMS_SMTP_PASSWORD', ''), 'sender': sender}

    @app.post('/api/jobs/{identifier}/share')
    @job_lease
    def create_share(identifier: str, body: dict, identity=Depends(workspace)):
        _, tenant = identity
        job = get_job(tenant, identifier)
        if not job.get('report') or job['report'].get('status') != 'RELEASED':
            raise HTTPException(409, 'Finish the sheet before sharing it.')
        days = body.get('days', 7)
        if not isinstance(days, int) or days not in SHARE_DAYS:
            raise HTTPException(422, 'Choose 1, 7 or 30 days.')
        return create_share_link(tenant, job, days)

    @app.delete('/api/jobs/{identifier}/shares/{share_id}')
    @job_lease
    def revoke_share(identifier: str, share_id: str, identity=Depends(workspace)):
        _, tenant = identity
        job = get_job(tenant, identifier)
        before = len(job.get('shares', []))
        job['shares'] = [x for x in job.get('shares', []) if x['id'] != share_id]
        if len(job['shares']) == before:
            raise HTTPException(404, 'That link was not found.')
        store.save_job(tenant, job, 'share_link_revoked', {'share_id': share_id})
        return {'ok': True}

    @app.get('/api/shared/{token}')
    def shared_download(token: str):
        parts = token.split('~')
        if len(parts) != 3 or not all(re.fullmatch(r'[A-Za-z0-9_-]{1,120}', x) for x in parts):
            raise HTTPException(404, 'This link is not valid.')
        tenant, identifier, secret = parts
        job = store.job(tenant, identifier)
        digest_value = hashlib.sha256(secret.encode()).hexdigest()
        match = next((x for x in (job or {}).get('shares', []) if hmac.compare_digest(x['hash'], digest_value)), None)
        if not match or datetime.fromisoformat(match['expires']) <= datetime.fromisoformat(now()):
            raise HTTPException(404, 'This link has expired or was removed.')
        data = released_output_bytes(job)
        return Response(data, media_type=XLSX_TYPE, headers={'Content-Disposition': 'attachment; filename="EliteSheets-shared.xlsx"', 'Cache-Control': 'no-store'})

    @app.get('/api/jobs/{identifier}/evidence')
    def evidence(identifier: str, identity=Depends(workspace)):
        _, tenant = identity
        job = get_job(tenant, identifier)
        result = public(job) | {'audit_events': store.events(tenant, identifier)}
        return JSONResponse(result, headers={'Content-Disposition': 'attachment; filename="EliteSheets-evidence.json"'})

    @app.delete('/api/jobs/{identifier}')
    @job_lease
    def delete(identifier: str, identity=Depends(workspace)):
        _, tenant = identity
        job = get_job(tenant, identifier)
        for file in [job['files']['template']] + job['files']['sources']:
            blobs.delete(file['object_key'])
        if job.get('output_object'):
            blobs.delete(job['output_object'])
        store.delete_job(tenant, job)
        return {'ok': True, 'note': 'Job files/history removed. Minimal audit and QMS-passed structural knowledge retained.'}

    @app.get('/api/admin/settings')
    def read_admin(user=Depends(administrator)):
        return settings_public(True)

    @app.put('/api/admin/settings')
    def write_admin(body: PlatformSettings, user=Depends(administrator)):
        # AI mapping has been removed. Only platform limits are saved here.
        clean = body.model_dump(exclude={'api_key', 'clear_key', 'enabled'})
        store.save_settings(clean, str(uuid.uuid4()), None)
        return settings_public(True)

    @app.get('/api/admin/customers')
    def customers(user=Depends(administrator)):
        return {'items': store.tenant_list()}

    @app.post('/api/admin/customers')
    def create_customer(body: CustomerCreate, user=Depends(administrator)):
        if store.user_email(body.email):
            raise HTTPException(409, 'This account email already exists.')
        tenant = str(uuid.uuid4())
        created = store.bootstrap_user(tenant, body.name, body.email, body.display_name, 'operator', password_hash(body.password))
        store.event('platform', None, str(uuid.uuid4()), 'customer_created', {'tenant_id': tenant})
        return {'tenant_id': tenant, 'user': {k: created[k] for k in ['id', 'name', 'email', 'role']}}

    BUILTIN_TEMPLATES = [
        {
            'id': 'sasams_student_import',
            'name': 'SA-SAMS Student System Import',
            'category': 'Education / SA-SAMS',
            'description': 'Exact 10-column school import template (joins Learner/Parent Bio + Subject Marks schedule into "; "-joined Subjects).',
            'sheet': 'Students',
            'headers': ['Student ID', 'First Name', 'Last Name', 'Date of Birth', 'Grade', 'Subjects', 'Parent First Name', 'Parent Last Name', 'Parent Email', 'Parent Phone'],
            'sample_rows': [
                {'Student ID': 'STU001', 'First Name': 'John', 'Last Name': 'Doe', 'Date of Birth': '2015-03-15', 'Grade': 'Grade 8', 'Subjects': 'Mathematics; English; Science', 'Parent First Name': 'Jane', 'Parent Last Name': 'Doe', 'Parent Email': 'jane.doe@example.com', 'Parent Phone': '0821234567'},
                {'Student ID': 'STU002', 'First Name': 'Sarah', 'Last Name': 'Smith', 'Date of Birth': '2014-07-22', 'Grade': 'Grade 9', 'Subjects': 'Mathematics; English; Physical Science', 'Parent First Name': 'Michael', 'Parent Last Name': 'Smith', 'Parent Email': 'michael.smith@example.com', 'Parent Phone': '0839876543'},
            ],
            'builtin': True,
        },
        {
            'id': 'monthly_sales_pivot',
            'name': 'Monthly Regional Consolidation',
            'category': 'Finance & Operations',
            'description': 'Consolidates branch/site figures across Jan, Feb, Mar with automatic Total reconciliation.',
            'sheet': 'Output',
            'headers': ['Site', 'Jan', 'Feb', 'Mar', 'Total'],
            'sample_rows': [
                {'Site': 'North', 'Jan': 12, 'Feb': 18, 'Mar': 20, 'Total': 50},
                {'Site': 'South', 'Jan': 7, 'Feb': 15, 'Mar': 13, 'Total': 35},
            ],
            'builtin': True,
        },
        {
            'id': 'inventory_stock',
            'name': 'Procurement & Inventory Stock',
            'category': 'Supply Chain & ERP',
            'description': 'Standard SKU, Product Name, Qty, and Unit Price template for messy supplier or ERP exports.',
            'sheet': 'Inventory_Report',
            'headers': ['SKU', 'Product Name', 'Qty', 'Unit Price'],
            'sample_rows': [
                {'SKU': 'SKU-901', 'Product Name': 'Stainless Flange 4in', 'Qty': 24, 'Unit Price': 45},
                {'SKU': 'SKU-902', 'Product Name': 'Hydraulic Seal Kit', 'Qty': 15, 'Unit Price': 18},
            ],
            'builtin': True,
        },
        {
            'id': 'quotation_invoice',
            'name': 'Branded Quotation / Tax Invoice',
            'category': 'Business PA & Billing',
            'description': 'Client quotation & invoice schedule with Item Code, Description, Qty, Unit Price, VAT (15%), and Line Total.',
            'sheet': 'Quote_Invoice',
            'headers': ['Item Code', 'Description', 'Qty', 'Unit Price', 'VAT 15%', 'Line Total'],
            'sample_rows': [
                {'Item Code': 'Q-001', 'Description': 'Annual School System License (Per Learner)', 'Qty': 500, 'Unit Price': 45, 'VAT 15%': 3375, 'Line Total': 25875},
                {'Item Code': 'Q-002', 'Description': 'SA-SAMS Data Migration & Onboarding', 'Qty': 1, 'Unit Price': 3500, 'VAT 15%': 525, 'Line Total': 4025},
            ],
            'builtin': True,
        },
        {
            'id': 'payroll_register',
            'name': 'Monthly Staff Payroll Register',
            'category': 'HR & Payroll',
            'description': 'Clean payroll register mapping Employee ID, Full Name, Role, Basic Salary, Allowances, Deductions, and Net Pay.',
            'sheet': 'Payroll',
            'headers': ['Employee ID', 'Full Name', 'Role', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay'],
            'sample_rows': [
                {'Employee ID': 'EMP-01', 'Full Name': 'Thabo Mokoena', 'Role': 'Operations Lead', 'Basic Salary': 28500, 'Allowances': 2500, 'Deductions': 4850, 'Net Pay': 26150},
                {'Employee ID': 'EMP-02', 'Full Name': 'Naledi Khumalo', 'Role': 'Account Coordinator', 'Basic Salary': 22000, 'Allowances': 1500, 'Deductions': 3400, 'Net Pay': 20100},
            ],
            'builtin': True,
        },
    ]

    @app.post('/api/jobs/from-builder')
    def create_job_from_builder(body: dict, identity=Depends(workspace)):
        from openpyxl import Workbook
        from .samples import style_sheet
        _, tenant = identity
        title = str(body.get('title') or 'Created-Spreadsheet.xlsx').strip()[:120]
        if not title.lower().endswith('.xlsx'):
            title += '.xlsx'
        sheet_name = str(body.get('sheet') or 'Sheet1').strip()[:31] or 'Sheet1'
        headers = [str(h).strip() for h in (body.get('headers') or []) if str(h).strip()]
        if not headers:
            headers = ['Column 1', 'Column 2', 'Column 3']
        rows = body.get('rows') or []
        request_id = str(body.get('request_id') or uuid.uuid4())

        wb_tpl = Workbook()
        ws_tpl = wb_tpl.active
        ws_tpl.title = sheet_name
        ws_tpl.append(headers)
        style_sheet(ws_tpl, 1, 20)
        bio_tpl = BytesIO()
        wb_tpl.save(bio_tpl)

        wb_src = Workbook()
        ws_src = wb_src.active
        ws_src.title = sheet_name
        ws_src.append(headers)
        for r in rows:
            ws_src.append([r.get(h) for h in headers])
        if not rows:
            ws_src.append([f'Sample {h}' for h in headers])
        style_sheet(ws_src, 1, 20)
        bio_src = BytesIO()
        wb_src.save(bio_src)

        job = create_job(tenant, request_id, (title, bio_tpl.getvalue()), [('builder-data.xlsx', bio_src.getvalue())], title)
        job['chat'] = []
        job = run_job(tenant, job)
        return public(job)

    @app.put('/api/jobs/{identifier}/rows')
    @job_lease
    def save_grid_rows(identifier: str, body: dict, identity=Depends(workspace)):
        """Save cell edits made in the Excel-style grid, rebuild the workbook and re-run the release gate."""
        _, tenant = identity
        job = get_job(tenant, identifier)
        report = job.get('report')
        if not report or report.get('rows') is None:
            raise HTTPException(409, 'Load or run a spreadsheet before editing the grid.')
        headers = [str(h) for h in (report.get('headers') or [])]
        incoming_rows = body.get('rows')
        if not isinstance(incoming_rows, list):
            raise HTTPException(422, 'rows must be a list.')
        if len(incoming_rows) > MAX_OUTPUT_ROWS:
            raise HTTPException(413, f'Too many rows for the grid (limit {MAX_OUTPUT_ROWS}).')
        cleaned = []
        for raw in incoming_rows:
            if not isinstance(raw, dict):
                raise HTTPException(422, 'Each row must be an object.')
            row = {}
            for h in headers:
                v = raw.get(h)
                if isinstance(v, str):
                    if len(v) > 5000:
                        raise HTTPException(422, 'A cell is too long (limit 5000 characters).')
                    v = v if v.strip() != '' else None
                elif isinstance(v, bool) or v is None:
                    v = None if v is None else str(v)
                elif not isinstance(v, (int, float)):
                    v = str(v)
                row[h] = v
            cleaned.append(row)
        report['rows'] = cleaned
        save_edited_workbook(tenant, job, '', quiet=True)
        store.save_job(tenant, job, 'grid_cells_edited', {'rows': len(cleaned)})
        return public(job)

    @app.post('/api/jobs/{identifier}/clean')
    @job_lease
    def clean_job_sheet(identifier: str, body: dict, identity=Depends(workspace)):
        _, tenant = identity
        job = get_job(tenant, identifier)
        report = job.get('report')
        if not report or not report.get('rows'):
            raise HTTPException(409, 'Load or run a spreadsheet before running data cleaning tools.')
        op = str(body.get('operation') or '').strip().lower()
        headers = list(report.get('headers') or [])
        rows = list(report.get('rows') or [])
        key_col = str(body.get('column') or job['plan']['destination'].get('key') or (headers[0] if headers else ''))

        if op == 'deduplicate':
            seen = set()
            deduped = []
            for r in rows:
                k = str(r.get(key_col, '')).strip().casefold()
                if k and k in seen:
                    continue
                if k:
                    seen.add(k)
                deduped.append(r)
            removed = len(rows) - len(deduped)
            report['rows'] = deduped
            return save_edited_workbook(tenant, job, f"Done! I deduplicated your spreadsheet by '{key_col}' ({removed} duplicate row(s) removed, {len(deduped)} unique rows kept).")
        if op == 'trim_text':
            for r in rows:
                for h in headers:
                    if isinstance(r.get(h), str):
                        r[h] = re.sub(r'\s+', ' ', r[h]).strip()
            return save_edited_workbook(tenant, job, 'Done! I trimmed extra spaces and cleaned text across all cells.')
        if op in {'sort_asc', 'sort_desc'}:
            rev = op == 'sort_desc'
            rows.sort(key=lambda r: (r.get(key_col) is None, r.get(key_col) if isinstance(r.get(key_col), (int, float)) else str(r.get(key_col, '')).casefold()), reverse=rev)
            report['rows'] = rows
            return save_edited_workbook(tenant, job, f"Done! I sorted your spreadsheet by '{key_col}' ({'highest to lowest' if rev else 'A to Z / lowest to highest'}).")
        if op == 'smart_fix_contacts':
            id_col = next((h for h in headers if any(w in h.casefold() for w in ('sa id', 'id number', 'identity', 'id no'))), None)
            dob_col = next((h for h in headers if any(w in h.casefold() for w in ('date of birth', 'dob', 'birth'))), None)
            gender_col = next((h for h in headers if 'gender' in h.casefold() or 'sex' in h.casefold()), None)
            status_col = 'SA ID Status' if id_col else None
            if status_col and status_col not in headers:
                headers.append(status_col)
                report['headers'] = headers
            fixed_count = 0
            luhn_valid = 0
            repaired_zeros = 0
            luhn_failed = 0
            for r in rows:
                if id_col:
                    info = validate_and_repair_sa_id(r.get(id_col))
                    if info['id_str'] and str(r.get(id_col, '')) != info['id_str']:
                        r[id_col] = info['id_str']
                        fixed_count += 1
                    if info['repaired']:
                        repaired_zeros += 1
                    if info['valid_luhn']:
                        luhn_valid += 1
                    elif info['id_str'] and 'Checksum Failed' in info['status']:
                        luhn_failed += 1
                    if dob_col and not r.get(dob_col) and info['dob']:
                        r[dob_col] = info['dob']
                        fixed_count += 1
                    if gender_col and not r.get(gender_col) and info['gender']:
                        r[gender_col] = info['gender']
                        fixed_count += 1
                    if status_col:
                        r[status_col] = info['status']
                for h in headers:
                    if h == status_col:
                        continue
                    val = r.get(h)
                    if val is None:
                        continue
                    hl = h.casefold()
                    s = str(val).strip()
                    if any(w in hl for w in ('first name', 'last name', 'surname', 'full name', 'parent first', 'parent last', 'guardian')):
                        cleaned = ' '.join(w.capitalize() for w in re.split(r'\s+', s) if w)
                        if cleaned != s:
                            r[h] = cleaned
                            fixed_count += 1
                    elif any(w in hl for w in ('phone', 'cell', 'mobile', 'tel')):
                        d = '0' + re.sub(r'\D', '', s[3:]) if s.startswith('+27') else re.sub(r'[\s()-]', '', s)
                        if re.fullmatch(r'[1-9]\d{8}', d):
                            d = '0' + d
                        if d != s:
                            r[h] = d
                            fixed_count += 1
                    elif 'email' in hl:
                        fixed_email = re.sub(r'@(gmial|gamil|gmai)\.com$', '@gmail.com', s.lower(), flags=re.I)
                        fixed_email = re.sub(r'@(yaho|yahooo)\.com$', '@yahoo.com', fixed_email, flags=re.I)
                        if fixed_email != s:
                            r[h] = fixed_email
                            fixed_count += 1
                    elif hl in {'grade', 'gr', 'learner grade', 'student grade'}:
                        m = re.fullmatch(r'(?:grade|gr\.?|g)?\s*(\d{1,2}[a-zA-Z]?)', s, re.I)
                        if m and f'Grade {m.group(1)}' != s:
                            r[h] = f'Grade {m.group(1)}'
                            fixed_count += 1
            id_note = f' (SA IDs: {luhn_valid} Luhn-valid, {repaired_zeros} leading-zero repaired, {luhn_failed} checksum warnings)' if id_col else ''
            return save_edited_workbook(tenant, job, f'Done! I ran SA ID Luhn Validation & Contact Smart Fix — {fixed_count} field(s) updated{id_note}.')
        if op == 'caps_levels':
            skip_cols = {'student id', 'learner id', 'admission no', 'first name', 'last name', 'surname', 'full name', 'date of birth', 'dob', 'gender', 'grade', 'sa id', 'sa id number', 'sa id status', 'parent phone', 'parent email', 'source file', 'duplicate status'}
            subj_cols = [h for h in headers if h.casefold() not in skip_cols and any(percentage_to_caps_level(r.get(h)) is not None for r in rows)]
            if not subj_cols:
                return save_edited_workbook(tenant, job, 'No numeric/percentage subject columns found on this sheet for CAPS Level (1–7) calculation.')
            for sc in subj_cols:
                lvl_col = f'{sc} (CAPS 1-7)'
                if lvl_col not in headers:
                    headers.append(lvl_col)
                for r in rows:
                    lvl = percentage_to_caps_level(r.get(sc))
                    r[lvl_col] = f'Level {lvl}' if lvl is not None else ''
            if 'CAPS Summary' not in headers:
                headers.append('CAPS Summary')
            for r in rows:
                lvls = [percentage_to_caps_level(r.get(sc)) for sc in subj_cols]
                valid_lvls = [x for x in lvls if x is not None]
                if valid_lvls:
                    avg_lvl = round(sum(valid_lvls) / len(valid_lvls), 1)
                    r['CAPS Summary'] = f'Avg Level {avg_lvl} ({"Pass" if min(valid_lvls) >= 3 else "At Risk"})'
                else:
                    r['CAPS Summary'] = ''
            report['headers'] = headers
            return save_edited_workbook(tenant, job, f'Done! I calculated CAPS Achievement Levels (1–7) and At-Risk status across {len(subj_cols)} subject column(s).')
        if op == 'add_total_row':
            rows = [r for r in rows if str(r.get(key_col, '')).strip().casefold() != 'total']
            tot_row: dict[str, object] = {h: '' for h in headers}
            tot_row[key_col] = 'Total'
            for h in headers:
                if h == key_col:
                    continue
                nums = [float(r[h]) for r in rows if isinstance(r.get(h), (int, float)) and not isinstance(r.get(h), bool)]
                if nums:
                    s_val = sum(nums)
                    tot_row[h] = int(s_val) if s_val.is_integer() else round(s_val, 2)
            rows.append(tot_row)
            report['rows'] = rows
            return save_edited_workbook(tenant, job, 'Done! I calculated and appended a Total summary row at the bottom of your sheet.')
        raise HTTPException(422, 'Unsupported cleaning operation.')


    return app


app = create_online_app()
