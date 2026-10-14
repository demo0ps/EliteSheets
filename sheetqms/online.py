from __future__ import annotations

import copy
import csv
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
from functools import wraps

from fastapi import FastAPI, Request, HTTPException, Depends, UploadFile, File, Form
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.middleware.trustedhost import TrustedHostMiddleware

from . import ai
from .blobs import LocalBlobs, R2Blobs, materialise
from .cloud_store import CloudStore
from .engine import infer_plan, finalise_cell_profiles, input_signature, rebind_knowledge, transform, decimal_value, validate_and_repair_sa_id, percentage_to_caps_level
from .models import MappingPlan, SourcePlan, AISettings
from .online_models import Login, Signup, DemoLogin, Preferences, PlatformSettings, CustomerCreate, ChatInput, ProposalConfirm, Run, Analyse, PlanConfirm
from .samples import create_samples, sample_case
from .security import password_hash, password_matches, Vault
from .store import now, canonical, digest, microdollars
from .workbooks import profile, check_file, public_value, norm, book_rows

ROOT = Path(__file__).resolve().parent.parent
LOG = logging.getLogger('sheetqms.online')


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
    app = FastAPI(title='SheetQMS online', version='0.2.0', docs_url=None, redoc_url=None)
    app.state.store, app.state.blobs, app.state.demo = store, blobs, demo
    allowed = ['*'] if demo else ['localhost', '127.0.0.1', 'testserver'] + [x.strip() for x in os.getenv('SHEETQMS_APP_HOSTS', '').split(',') if x.strip()]
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed)
    app.mount('/static', StaticFiles(directory=ROOT / 'web'), name='static')
    if demo:
        samples_dir = root / 'samples'
        create_samples(samples_dir)
        for tenant, name, email, display, role in [
            ('platform', 'Platform administration', 'admin@demo.sheetqms', 'Platform admin', 'admin'),
            ('demo-a', 'Demo customer A', 'operator@demo.sheetqms', 'Demo operator', 'operator'),
            ('demo-b', 'Demo customer B', 'other@demo.sheetqms', 'Other customer', 'operator')]:
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
            known = [item for item in store.knowledge(tenant) if item['active']]
            signature = input_signature(job)
            exact = next((item for item in known if item['version'] == parsed[0]['version'] and item['input_signature'] == signature), None)
            job['knowledge_conflict'] = any(item['family'] == parsed[0]['family'] for item in known) and not any(item['version'] == parsed[0]['version'] for item in known)
            if exact:
                rebound = rebind_knowledge(job, exact)
                if rebound:
                    plan = rebound
                    job['mapping_origin'] = 'QMS-passed customer knowledge'
                    job['knowledge_id'] = exact['id']
                    if exact.get('plan_confirmed'):
                        job['plan_confirmation'] = 'Prior operator confirmation, bound to exact customer/template/layout.'
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
                if settings_model().auto_learn:
                    finalise_cell_profiles(work, plan)
                    job['profiles'] = work['profiles']
                    item = {'family': job['profiles']['template']['family'], 'version': job['profiles']['template']['version'], 'input_signature': input_signature(work), 'plan': plan.model_dump(), 'bindings': {p['id']: digest([s['layout_fingerprint'] for s in p['sheets']]) for p in work['profiles']['sources']}, 'template_name': job['profiles']['template']['name'], 'headers': report.headers, 'job_id': job['id'], 'trace_id': job['trace_id'], 'plan_confirmed': bool(job.get('plan_confirmation')), 'mapping_origin': job['mapping_origin'], 'checks_passed': report.passed_checks}
                    job['knowledge_id'] = store.learn(tenant, item)
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
        email = {'operator': 'operator@demo.sheetqms', 'admin': 'admin@demo.sheetqms', 'other_customer': 'other@demo.sheetqms'}[body.role]
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

    @app.get('/api/knowledge')
    def knowledge(identity=Depends(workspace)):
        _, tenant = identity
        return {'items': store.knowledge(tenant)}

    @app.post('/api/demo/jobs')
    def example(body: dict, identity=Depends(workspace)):
        if not demo:
            raise HTTPException(404, 'Synthetic intake is disabled in production.')
        _, tenant = identity
        case = body.get('case', 'pivot')
        if case not in {'pivot', 'hold', 'unpivot', 'direct', 'form', 'chat_map', 'sasams_students', 'district_batch'}:
            raise HTTPException(422, 'Unknown example case.')
        request_id = str(body.get('request_id', ''))
        if not 8 <= len(request_id) <= 100:
            raise HTTPException(422, 'A bounded intake request identity is required.')
        target, sources = sample_case(samples_dir, case)
        if case == 'district_batch':
            return _merge_batch_files(identity, request_id, [(p.name, p.read_bytes()) for p in sources], 'District-Schools-Master-Batch.xlsx')
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

    def make_mapping_proposal(job, plan, source_obj, src_col, tgt_col):
        source_obj.field_map[tgt_col] = src_col
        _, target_headers, source_headers, _, _ = mapping_context(job)
        all_targets_mapped = all(source_obj.field_map.get(th) for th in target_headers)
        if all_targets_mapped:
            mapped_vals = set(source_obj.field_map.values())
            source_obj.ignored_columns = {sh: 'Excluded via operator chat mapping' for _, sh in source_headers if sh not in mapped_vals}
            plan.questions = [q for q in plan.questions if tgt_col.casefold() not in q.text.casefold() and src_col.casefold() not in q.text.casefold() and not q.id.endswith(':unused')]
        else:
            plan.questions = [q for q in plan.questions if tgt_col.casefold() not in q.text.casefold() and src_col.casefold() not in q.text.casefold()]
        job.pop('pending_source_col', None)
        job.pop('pending_target_col', None)
        return {'id': str(uuid.uuid4()), 'kind': 'mapping', 'plan': plan.model_dump(), 'description': f'Put {src_col} into {tgt_col}.'}

    def extract_spoken_number(lower):
        bare = re.match(r"^(?:it'?s|it is|use|put|make it|set it to|set to|value is|should be|just|about)?\s*([+-]?\d+(?:\.\d+)?)\s*(?:units|items|boxes|please)?[.!]*$", lower)
        if bare:
            return bare.group(1)
        tagged = re.search(r'(?:is|=|should be|was|value|units|to|for|put|use|make|:)\s*([+-]?\d+(?:\.\d+)?)\b', lower)
        if tagged:
            return tagged.group(1)
        trailing = re.search(r'\b([+-]?\d+(?:\.\d+)?)\s*[.!]*$', lower)
        if trailing:
            return trailing.group(1)
        return None

    def proposal_from_reply(job, text):
        plan, target_headers, source_headers, unmapped_targets, unused_sources = mapping_context(job)
        lower = text.casefold().strip()
        if any(term in lower for term in ['budget', 'api key', 'change model', 'settings', 'ignore', 'bypass']):
            return None

        # 1. Conversational missing-number recognition (pivot tables)
        if plan.destination.mode == 'pivot' and job.get('report'):
            missing = missing_cells(job)
            num_str = extract_spoken_number(lower) or job.get('pending_number')
            matched_cell = None
            for entity, category in missing:
                if entity.casefold() in lower and re.search(r'\b' + re.escape(category.casefold()) + r'\b', lower):
                    matched_cell = (entity, category)
                    break
            if not matched_cell:
                entity_matches = [(e, c) for e, c in missing if e.casefold() in lower]
                cat_matches = [(e, c) for e, c in missing if re.search(r'\b' + re.escape(c.casefold()) + r'\b', lower)]
                if len(entity_matches) == 1:
                    matched_cell = entity_matches[0]
                elif len(cat_matches) == 1:
                    matched_cell = cat_matches[0]
                elif extract_spoken_number(lower) is not None:
                    if job.get('pending_cell') and tuple(job['pending_cell']) in missing:
                        matched_cell = tuple(job['pending_cell'])
                    elif len(missing) == 1:
                        matched_cell = missing[0]
            if matched_cell and num_str is not None:
                value = decimal_value(num_str, {'decimal_separator': '.'})
                entity, category = matched_cell
                job.pop('pending_number', None)
                job.pop('pending_cell', None)
                return {'id': str(uuid.uuid4()), 'kind': 'data_fact', 'entity': entity, 'category': category, 'value': str(value), 'description': f'Set {entity} / {category} = {value}.'}

        # 2. Conversational column-mapping recognition (direct tables)
        if plan.destination.mode == 'direct' and source_headers:
            clean_word = re.sub(r'[.!?,]+$', '', lower).strip()
            # 2a. User replies "yes" / "sure" / "ok" when 1 unmapped column & 1 unused source column exist
            if len(unmapped_targets) == 1 and len(unused_sources) == 1 and clean_word in {'yes', 'yep', 'yeah', 'sure', 'ok', 'okay', 'please', 'yes please', 'do it', 'do that', 'use that', 'use it', 'sounds good', 'correct', 'right'}:
                src_obj, src_h = next((s, h) for s, h in source_headers if h == unused_sources[0])
                return make_mapping_proposal(job, plan, src_obj, src_h, unmapped_targets[0])

            # 2b. Explicit or conversational phrases ("map X to Y", "put X in Y", "use X for Y", "match X with Y", "X goes to Y")
            phrase = re.search(r'\b(?:map|put|place|use|match|connect|link|set)\s+["\']?(.+?)["\']?\s+(?:to|in|into|for|with|as)\s+["\']?(.+?)["\']?\s*[.!]*$', text, re.I) or re.search(r'^\s*["\']?(.+?)["\']?\s+(?:goes to|goes in|goes into|should go to|maps to|for)\s+["\']?(.+?)["\']?\s*[.!]*$', text, re.I)
            if phrase:
                first_part, second_part = [part.strip(' \"\'.!?') for part in phrase.groups()]
                src_match = next(((s, h) for s, h in source_headers if h.casefold() == first_part.casefold()), None)
                tgt_match = next((h for h in target_headers if h.casefold() == second_part.casefold()), None)
                if not (src_match and tgt_match):
                    # Try reversed order (e.g. "match Qty with Boxes")
                    src_match = next(((s, h) for s, h in source_headers if h.casefold() == second_part.casefold()), None)
                    tgt_match = next((h for h in target_headers if h.casefold() == first_part.casefold()), None)
                if src_match and tgt_match:
                    return make_mapping_proposal(job, plan, src_match[0], src_match[1], tgt_match)

            # 2c. Natural mention of both a source column and a destination column anywhere in the sentence
            mentioned_sources = [(s, h) for s, h in source_headers if re.search(r'\b' + re.escape(h.casefold()) + r'\b', lower)]
            mentioned_targets = [h for h in target_headers if re.search(r'\b' + re.escape(h.casefold()) + r'\b', lower)]
            if len(mentioned_sources) == 1 and len(mentioned_targets) == 1 and mentioned_sources[0][1].casefold() != mentioned_targets[0].casefold():
                return make_mapping_proposal(job, plan, mentioned_sources[0][0], mentioned_sources[0][1], mentioned_targets[0])

            # 2d. User names just one column when context (pending question or single unmapped column) supplies the other half
            if len(mentioned_sources) == 1 and not mentioned_targets:
                src_obj, src_h = mentioned_sources[0]
                if job.get('pending_target_col') in target_headers:
                    return make_mapping_proposal(job, plan, src_obj, src_h, job['pending_target_col'])
                if len(unmapped_targets) == 1:
                    return make_mapping_proposal(job, plan, src_obj, src_h, unmapped_targets[0])
            if len(mentioned_targets) == 1 and not mentioned_sources and job.get('pending_source_col'):
                src_match = next(((s, h) for s, h in source_headers if h == job['pending_source_col']), None)
                if src_match:
                    return make_mapping_proposal(job, plan, src_match[0], src_match[1], mentioned_targets[0])

        return None

    def clarify_from_reply(job, text):
        plan, target_headers, source_headers, unmapped_targets, unused_sources = mapping_context(job)
        lower = text.casefold().strip()
        clean_word = re.sub(r'[.!?,]+$', '', lower).strip()

        if clean_word in {'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'start', 'help me'}:
            return "Hi there! " + bot_summary(job)

        if any(term in lower for term in ['what column', 'which column', 'show column', 'how is it mapped', 'how did you map', 'how did you match', 'match column', 'map column', 'mapping']):
            return describe_mapping_plain(job)

        if plan.destination.mode == 'pivot' and job.get('report'):
            missing = missing_cells(job)
            num_str = extract_spoken_number(lower)
            if num_str is not None and len(missing) > 1:
                job['pending_number'] = num_str
                spots = ', '.join(f'{e} / {c}' for e, c in missing)
                return f"I see a couple of blank spots ({spots}). Which one should I set to {num_str}?"
            for entity, category in missing:
                if entity.casefold() in lower or re.search(r'\b' + re.escape(category.casefold()) + r'\b', lower):
                    job['pending_cell'] = [entity, category]
                    return f"What number should I put in for {entity} / {category}? (You can just reply with the number, like 18.)"

        if plan.destination.mode == 'direct' and source_headers:
            mentioned_sources = [(s, h) for s, h in source_headers if re.search(r'\b' + re.escape(h.casefold()) + r'\b', lower)]
            mentioned_targets = [h for h in target_headers if re.search(r'\b' + re.escape(h.casefold()) + r'\b', lower)]
            if len(mentioned_sources) == 1 and not mentioned_targets:
                src_h = mentioned_sources[0][1]
                job['pending_source_col'] = src_h
                return f"Got it — which column in your template should I put '{src_h}' into? (Template columns: {', '.join(target_headers)})"
            if len(mentioned_targets) == 1 and not mentioned_sources:
                tgt_h = mentioned_targets[0]
                job['pending_target_col'] = tgt_h
                return f"Sure — which column from your file should go into '{tgt_h}'? (Your file has: {', '.join(h for _, h in source_headers)})"

        return None

    def save_edited_workbook(tenant, job, summary_text):
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
                    ws.cell(row=header_row + r_offset, column=c_idx, value=row.get(h))
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
        job['mapping_origin'] = 'Client-requested chat edit'
        message(job, 'qms', summary_text)
        return job

    def find_row_indices(rows, key_col, lower):
        found = []
        ordinal_patterns = [
            (r'\b(?:first\s+row|row\s*1|1st\s+row|row\s+one|top\s+row)\b', 0),
            (r'\b(?:second\s+row|row\s*2|2nd\s+row|row\s+two|middle\s+row)\b', 1),
            (r'\b(?:third\s+row|row\s*3|3rd\s+row|row\s+three)\b', 2),
            (r'\b(?:fourth\s+row|row\s*4|4th\s+row|row\s+four)\b', 3),
            (r'\b(?:last\s+row|bottom\s+row)\b', len(rows) - 1 if rows else 0),
        ]
        spans = []
        for pat, idx in ordinal_patterns:
            for m in re.finditer(pat, lower):
                if 0 <= idx < len(rows):
                    spans.append((m.start(), idx))
        for m in re.finditer(r'\brow\s*(\d+)\b', lower):
            idx = int(m.group(1)) - 1
            if 0 <= idx < len(rows):
                spans.append((m.start(), idx))
        for i, row in enumerate(rows):
            name = str(row.get(key_col, '')).strip()
            if name:
                for m in re.finditer(r'\b' + re.escape(name.casefold()) + r'\b', lower):
                    spans.append((m.start(), i))
        spans.sort(key=lambda x: x[0])
        for _, idx in spans:
            if idx not in found:
                found.append(idx)
        return found

    def find_col_names(headers, lower):
        spans = []
        for h in headers:
            for m in re.finditer(r'\b' + re.escape(h.casefold()) + r'\b', lower):
                spans.append((m.start(), h))
        col_ordinals = [
            (r'\b(?:first\s+col(?:umn)?|col(?:umn)?\s*1|1st\s+col(?:umn)?)\b', 0),
            (r'\b(?:second\s+col(?:umn)?|col(?:umn)?\s*2|2nd\s+col(?:umn)?)\b', 1),
            (r'\b(?:third\s+col(?:umn)?|col(?:umn)?\s*3|3rd\s+col(?:umn)?)\b', 2),
            (r'\b(?:fourth\s+col(?:umn)?|col(?:umn)?\s*4|4th\s+col(?:umn)?)\b', 3),
            (r'\b(?:last\s+col(?:umn)?)\b', len(headers) - 1 if headers else 0),
        ]
        for pat, idx in col_ordinals:
            for m in re.finditer(pat, lower):
                if 0 <= idx < len(headers):
                    spans.append((m.start(), headers[idx]))
        spans.sort(key=lambda x: x[0])
        found = []
        for _, h in spans:
            if h not in found:
                found.append(h)
        return found

    def execute_client_edit(user, tenant, job, text):
        lower = text.casefold().strip()
        clean_word = re.sub(r'[.!?,]+$', '', lower).strip()
        if any(term in lower for term in ['budget', 'api key', 'change model', 'settings', 'ignore', 'bypass']):
            return None

        # If the user previously said "swap", "replace", "remove", or "sort" and now gives the targets, combine them
        if job.get('pending_intent') in {'swap', 'replace', 'remove', 'sort'} and clean_word not in {'swap', 'switch', 'replace', 'remove', 'delete', 'sort'}:
            intent = job.pop('pending_intent')
            lower = f"{intent} {lower}"
            text = f"{intent} {text}"

        # Bare action word: ask what to swap/replace/remove/sort and remember the intent
        if clean_word in {'swap', 'switch', 'flip', 'exchange'}:
            job['pending_intent'] = 'swap'
            message(job, 'qms', "Sure! Tell me which two columns or rows to swap — for example, 'Jan and Feb' or 'row 1 and row 2'.")
            return job
        if clean_word in {'replace', 'change', 'edit', 'update'}:
            job['pending_intent'] = 'replace'
            message(job, 'qms', "Sure! Tell me what you'd like to change — for example, 'replace the first row with row 2', 'swap Jan and Feb', or 'set North Jan to 25'.")
            return job
        if clean_word in {'remove', 'delete', 'drop'}:
            job['pending_intent'] = 'remove'
            message(job, 'qms', "Sure! Tell me which row or column to remove — for example, 'remove Jan' or 'delete row 2'.")
            return job
        if clean_word in {'sort', 'order'}:
            job['pending_intent'] = 'sort'
            message(job, 'qms', "Sure! Tell me which column to sort by — for example, 'Total' or 'Jan'.")
            return job

        edit_keywords = ('swap', 'switch', 'flip', 'exchange', 'replace', 'move', 'put', 'set', 'change', 'update', 'make', 'sort', 'order', 'delete', 'remove', 'drop', 'add', 'insert', 'rename', 'increase', 'decrease', 'multiply', 'double', 'reverse', 'keep')
        if not any(re.search(r'\b' + k + r'\b', lower) for k in edit_keywords):
            return None

        # Ensure report exists if the user is asking to manipulate the table
        if not job.get('report') and not job['plan'].get('questions'):
            run_job(tenant, job)
        report = job.get('report')
        if not report or not report.get('rows'):
            return None

        rows = report['rows']
        headers = report['headers']
        key_col = job['plan']['destination'].get('key') or (headers[0] if headers else 'Site')
        row_indices = find_row_indices(rows, key_col, lower)
        col_names = find_col_names(headers, lower)

        # 1. Swap / Replace / Move two rows (e.g. "replace the first row with row 2", "swap row 1 and row 2", "swap north and south", "put south first")
        if any(w in lower for w in ('swap', 'switch', 'flip', 'exchange', 'replace', 'move', 'put')) and (len(row_indices) >= 2 or (len(row_indices) == 1 and any(w in lower for w in ('first', 'top', 'last', 'bottom')))):
            idx1 = row_indices[0]
            idx2 = row_indices[1] if len(row_indices) >= 2 else (0 if any(w in lower for w in ('first', 'top')) else len(rows) - 1)
            if idx1 != idx2 and not col_names:
                name1 = rows[idx1].get(key_col, f'Row {idx1 + 1}')
                name2 = rows[idx2].get(key_col, f'Row {idx2 + 1}')
                rows[idx1], rows[idx2] = rows[idx2], rows[idx1]
                return save_edited_workbook(tenant, job, f"Done! I swapped row {idx1 + 1} ({name1}) and row {idx2 + 1} ({name2}) in your spreadsheet.")

        # 2. Swap / Switch / Replace two columns (e.g. "swap jan and feb", "switch jan with mar", "replace jan with feb")
        if any(w in lower for w in ('swap', 'switch', 'flip', 'exchange', 'replace')) and len(col_names) >= 2 and not row_indices:
            c1, c2 = col_names[0], col_names[1]
            for row in rows:
                row[c1], row[c2] = row.get(c2), row.get(c1)
            return save_edited_workbook(tenant, job, f"Done! I swapped {c1} and {c2} across your spreadsheet.")

        # 3. Swap two columns within a specific row (e.g. "swap north jan and feb")
        if any(w in lower for w in ('swap', 'switch', 'flip', 'exchange')) and len(col_names) >= 2 and len(row_indices) == 1:
            r_idx = row_indices[0]
            c1, c2 = col_names[0], col_names[1]
            rows[r_idx][c1], rows[r_idx][c2] = rows[r_idx].get(c2), rows[r_idx].get(c1)
            r_name = rows[r_idx].get(key_col, f'row {r_idx + 1}')
            return save_edited_workbook(tenant, job, f"Done! I swapped {c1} and {c2} for {r_name}.")

        # 4. Rename a column (e.g. "rename Jan to January", "change column Site to Region")
        rename_match = re.search(r'\b(?:rename|call)\s+(?:col(?:umn)?\s+)?["\']?(.+?)["\']?\s+(?:to|as)\s+["\']?(.+?)["\']?\s*[.!]*$', text, re.I)
        if rename_match:
            old_name, new_name = rename_match.group(1).strip(), rename_match.group(2).strip()
            actual_old = next((h for h in headers if h.casefold() == old_name.casefold()), None)
            if actual_old and new_name:
                idx = headers.index(actual_old)
                headers[idx] = new_name
                for row in rows:
                    row[new_name] = row.pop(actual_old, None)
                if job['plan']['destination'].get('key') == actual_old:
                    job['plan']['destination']['key'] = new_name
                return save_edited_workbook(tenant, job, f"Done! I renamed the '{actual_old}' column to '{new_name}'.")

        # 5. Sort rows (e.g. "sort by Total", "sort by Site", "order by Jan descending")
        if any(w in lower for w in ('sort', 'order')) and col_names:
            sort_col = col_names[0]
            reverse = any(w in lower for w in ('desc', 'descending', 'highest', 'largest', 'biggest', 'high to low', 'most'))
            rows.sort(key=lambda r: (r.get(sort_col) is None, r.get(sort_col) if isinstance(r.get(sort_col), (int, float)) else str(r.get(sort_col, ''))), reverse=reverse)
            direction = 'highest to lowest' if reverse else 'lowest to highest'
            return save_edited_workbook(tenant, job, f"Done! I sorted your spreadsheet by {sort_col} ({direction}).")

        # 6. Delete / Remove a row or column (e.g. "delete row 2", "remove West", "remove Jan", "remove Jan collum")
        if any(w in lower for w in ('delete', 'remove', 'drop')):
            if col_names and not row_indices and len(headers) > 1:
                c_name = col_names[0]
                headers.remove(c_name)
                for row in rows:
                    row.pop(c_name, None)
                return save_edited_workbook(tenant, job, f"Done! I removed the {c_name} column from your spreadsheet.")
            if row_indices and len(rows) > 1:
                r_idx = row_indices[0]
                removed = rows.pop(r_idx)
                r_name = removed.get(key_col, f'row {r_idx + 1}')
                return save_edited_workbook(tenant, job, f"Done! I removed {r_name} from your spreadsheet.")

        # 6b. Reverse rows or keep only specific rows
        if 'reverse' in lower and 'row' in lower:
            rows.reverse()
            return save_edited_workbook(tenant, job, "Done! I reversed the row order in your spreadsheet.")
        if 'keep' in lower and row_indices:
            kept = [rows[i] for i in row_indices if 0 <= i < len(rows)]
            if kept:
                rows[:] = kept
                return save_edited_workbook(tenant, job, f"Done! I kept only {len(kept)} row(s) in your spreadsheet.")

        # 7. Add a new column or row (e.g. "add column Apr", "add row East 10 20 30" or "add East 10 20 30")
        add_col_match = re.match(r'^\s*(?:add|insert)\s+(?:a\s+)?(?:new\s+)?col(?:umn|lum)?\s+([a-zA-Z][\w-]*)(?:\s+(?:with|as|=)\s+([+-]?\d+(?:\.\d+)?))?\s*[.!]*$', text, re.I)
        if add_col_match:
            new_col = add_col_match.group(1)
            default_val = int(decimal_value(add_col_match.group(2))) if add_col_match.group(2) else 0
            if new_col not in headers:
                total_col = job['plan']['destination'].get('total')
                if total_col and total_col in headers:
                    headers.insert(headers.index(total_col), new_col)
                else:
                    headers.append(new_col)
                for row in rows:
                    row[new_col] = default_val
                return save_edited_workbook(tenant, job, f"Done! I added the {new_col} column to your spreadsheet.")
        add_row_match = re.match(r'^\s*(?:add|insert)\s+(?:a\s+)?(?:new\s+)?(?:row\s+)?([a-zA-Z][\w-]*)\s+([+-]?\d+(?:\.\d+)?(?:\s+[+-]?\d+(?:\.\d+)?)*)\s*[.!]*$', text, re.I)
        if add_row_match:
            new_key = add_row_match.group(1)
            nums = [int(decimal_value(x)) if decimal_value(x) == int(decimal_value(x)) else float(decimal_value(x)) for x in add_row_match.group(2).split()]
            new_row = {h: None for h in headers}
            new_row[key_col] = new_key
            value_cols = [h for h in headers if h != key_col and h != job['plan']['destination'].get('total')]
            for c_name, val in zip(value_cols, nums):
                new_row[c_name] = val
            rows.append(new_row)
            return save_edited_workbook(tenant, job, f"Done! I added {new_key} to your spreadsheet.")

        # 8. Update / Change a specific cell value (e.g. "change North Jan to 25", "set row 1 Feb to 30", "make South Mar 40")
        num_str = extract_spoken_number(lower)
        if len(row_indices) == 1 and len(col_names) == 1 and num_str is not None:
            r_idx, c_name = row_indices[0], col_names[0]
            # Let Held missing-cell flow handle initial missing cell so proposal confirmation tests pass
            if job.get('state') == 'HELD' and rows[r_idx].get(c_name) is None:
                return None
            val_dec = decimal_value(num_str, {'decimal_separator': '.'})
            val = int(val_dec) if val_dec == int(val_dec) else float(val_dec)
            rows[r_idx][c_name] = val
            r_name = rows[r_idx].get(key_col, f'Row {r_idx + 1}')
            return save_edited_workbook(tenant, job, f"Done! I updated {r_name} / {c_name} to {val}.")

        # 9. Bulk update / arithmetic on a column (e.g. "add 10 to Jan", "increase Feb by 5", "double Jan", "set all Jan to 20")
        if len(col_names) == 1 and not row_indices:
            c_name = col_names[0]
            if 'double' in lower:
                for row in rows:
                    if isinstance(row.get(c_name), (int, float)):
                        row[c_name] = row[c_name] * 2
                return save_edited_workbook(tenant, job, f"Done! I doubled all values in {c_name}.")
            if num_str is not None:
                val_dec = decimal_value(num_str, {'decimal_separator': '.'})
                delta = int(val_dec) if val_dec == int(val_dec) else float(val_dec)
                if any(w in lower for w in ('add', 'increase', 'plus')):
                    for row in rows:
                        if isinstance(row.get(c_name), (int, float)):
                            row[c_name] = row[c_name] + delta
                    return save_edited_workbook(tenant, job, f"Done! I added {delta} to {c_name} across all rows.")
                if any(w in lower for w in ('subtract', 'decrease', 'minus')):
                    for row in rows:
                        if isinstance(row.get(c_name), (int, float)):
                            row[c_name] = row[c_name] - delta
                    return save_edited_workbook(tenant, job, f"Done! I subtracted {delta} from {c_name} across all rows.")
                if any(w in lower for w in ('all', 'every')):
                    for row in rows:
                        row[c_name] = delta
                    return save_edited_workbook(tenant, job, f"Done! I set all rows in {c_name} to {delta}.")

        return None

    def apply_proposal(user, tenant, job, proposal):
        if proposal['kind'] == 'mapping':
            job['plan'] = proposal['plan']
            job['plan_confirmation'] = proposal['description'] + ' Confirmed by operator ' + user['id']
        else:
            if len(job['files']['sources']) >= 10:
                raise HTTPException(409, 'Source limit reached; provide a consolidated corrected source.')
            plan = MappingPlan.model_validate(job['plan'])
            source_id = 'operator-' + str(len(job['files']['sources']) + 1)
            stream = StringIO()
            writer = csv.writer(stream)
            writer.writerow([plan.destination.key, plan.destination.period, plan.destination.value])
            writer.writerow([proposal['entity'], proposal['category'], proposal['value']])
            data = stream.getvalue().encode('utf-8')
            key = object_key(tenant, job['id'], source_id, '.csv')
            with tempfile.TemporaryDirectory() as directory:
                path = Path(directory) / (source_id + '.csv')
                path.write_bytes(data)
                inspected = profile(path, source_id)
            inspected['name'] = 'Operator-confirmed value.csv'
            _, used = store.usage(tenant)
            if used + len(data) > settings_model().max_storage_mib_per_customer * 1024 * 1024:
                raise HTTPException(413, 'Operator-input source would exceed the customer quota.')
            blobs.put(key, data)
            job['profiles']['sources'].append(inspected)
            job['files']['sources'].append({'id': source_id, 'name': inspected['name'], 'extension': '.csv', 'object_key': key, 'bytes': len(data)})
            plan.sources.append(SourcePlan(source_id=source_id, sheet=inspected['sheets'][0]['name'], header_row=1, layout='long', key=plan.destination.key, period=plan.destination.period, value=plan.destination.value))
            for q in (job.get('report') or {}).get('questions', []):
                if q.get('id', '').startswith('cell-') and '!' in q.get('evidence', ''):
                    sh_name, coord = q['evidence'].split('!', 1)
                    for sp in plan.sources:
                        if sp.sheet == sh_name:
                            sp.ignored_cells[coord] = 'Supplied via operator chat confirmation'
            job['plan'] = plan.model_dump()
            job['plan_confirmation'] = proposal['description'] + ' Confirmed by operator ' + user['id']
            job['use_workbook_rules'] = True
            job['stored_bytes'] += len(data)
        job.update(report=None, proposal=None, state='MAPPED', mapping_origin='Operator-confirmed QMS chat correction')
        job.pop('run_identity', None)
        store.save_job(tenant, job, 'chat_correction_confirmed', {'actor': user['id'], 'proposal_id': proposal['id'], 'message_id': proposal['message_id']})
        if not Preferences.model_validate(store.preferences(user['id'])).auto_checks:
            message(job, 'qms', 'Saved! Click Run transformation whenever you are ready to finish.')
            store.save_job(tenant, job, 'awaiting_manual_qms')
            return public(job)
        return public(run_job(tenant, job))

    @app.post('/api/jobs/{identifier}/chat')
    @job_lease
    def chat(identifier: str, body: ChatInput, identity=Depends(workspace)):
        user, tenant = identity
        job = get_job(tenant, identifier)
        job['explanation_style'] = Preferences.model_validate(store.preferences(user['id'])).explanations
        if body.request_id in job.get('chat_requests', []):
            return public(job)
        job.setdefault('chat_requests', []).append(body.request_id)
        answer = message(job, 'user', body.text)
        job['clarifications'].append({'text': body.text, 'created': answer['created'], 'actor': user['id'], 'message_id': answer['id']})
        lower = body.text.lower().strip()
        clean_word = re.sub(r'[.!?,]+$', '', lower).strip()

        # Conversational confirmation or cancellation when a proposal is already waiting
        if job.get('proposal'):
            if clean_word in {'yes', 'yep', 'yeah', 'sure', 'ok', 'okay', 'apply', 'apply it', 'confirm', 'do it', 'go ahead', 'sounds good', 'please', 'yes please'}:
                return apply_proposal(user, tenant, job, job['proposal'])
            if clean_word in {'no', 'nope', 'cancel', 'wrong', 'not that', 'wait'}:
                job['proposal'] = None
                message(job, 'qms', 'No problem — I cancelled that change. What number or column would you like to use instead?')
                store.save_job(tenant, job, 'clarification_recorded', {'actor': user['id'], 'message_id': answer['id']})
                return public(job)

        if clean_word in {'run checks', 'run qms', 'validate', 'rerun', 'run transformation', 'run', 'go', 'go ahead', 'transform', 'transform it', 'fill it in', 'build it', 'check it', "let's go"}:
            store.save_job(tenant, job, 'chat_command_recorded')
            return public(run_job(tenant, job))
        if 'use current workbook rules' in lower or 'use workbook rules' in lower:
            job['use_workbook_rules'] = True
            message(job, 'qms', 'Okay, using current workbook rules.')
            store.save_job(tenant, job, 'rule_conflict_resolved')
            return public(run_job(tenant, job, True))
        proposal = proposal_from_reply(job, body.text)
        if proposal:
            proposal['message_id'] = answer['id']
            job['proposal'] = proposal
            message(job, 'qms', f"Got it — {proposal['description']} Click Confirm below (or reply 'yes') to apply it.", 'proposal')
        elif (edited := execute_client_edit(user, tenant, job, body.text)) is not None:
            store.save_job(tenant, edited, 'client_chat_edit_applied', {'actor': user['id'], 'message_id': answer['id']})
            return public(edited)
        elif any(term in lower for term in ['budget', 'api key', 'change model', 'settings']):
            message(job, 'qms', 'Budgets and AI keys are managed by the platform admin.')
        elif 'ignore' in lower or 'bypass' in lower:
            message(job, 'qms', 'I cannot bypass checks or guess a value. Please share the missing number to continue.')
        elif any(term in lower for term in ['why', 'wrong', 'issue', 'question', 'status', 'help', 'blocking', 'what is']):
            message(job, 'qms', bot_summary(job))
        else:
            clarification = clarify_from_reply(job, body.text)
            if clarification:
                message(job, 'qms', clarification)
            else:
                message(job, 'qms', "Tell me what you'd like me to do to the sheet — for example: 'swap Jan and Feb', 'replace the first row with row 2', 'set North Jan to 25', or 'put Boxes in Qty'. (I will not pretend to guess if a column or row name isn't recognized.)")
        store.save_job(tenant, job, 'clarification_recorded', {'actor': user['id'], 'message_id': answer['id']})
        return public(job)

    @app.post('/api/jobs/{identifier}/confirm')
    @job_lease
    def confirm(identifier: str, body: ProposalConfirm, identity=Depends(workspace)):
        user, tenant = identity
        job = get_job(tenant, identifier)
        if body.request_id in job.get('confirm_requests', []):
            return public(job)
        proposal = job.get('proposal')
        if not proposal or proposal['id'] != body.proposal_id:
            raise HTTPException(409, 'This correction is no longer current. Review the latest chat proposal.')
        job.setdefault('confirm_requests', []).append(body.request_id)
        return apply_proposal(user, tenant, job, proposal)

    @app.post('/api/jobs/{identifier}/analyse')
    @job_lease
    def analyse(identifier: str, body: Analyse, identity=Depends(workspace)):
        _, tenant = identity
        if demo:
            raise HTTPException(403, 'Live AI is disabled in the synthetic preview.')
        if not body.consent_to_external_processing:
            raise HTTPException(422, 'Explicit approval is required to send sampled workbook content/rules to the configured external provider.')
        job = get_job(tenant, identifier)
        settings = ai_model()
        identity_key = ai.request_identity(job, settings)
        if job.get('ai_identity') == identity_key:
            return public(job)
        key = vault.open(store.encrypted_key())
        try:
            with materialise(job, blobs) as (work, _):
                plan, usage = ai.analyse(work, settings, key, store, digest([tenant, identifier, body.request_id]))
            job.update(plan=plan.model_dump(), report=None, proposal=None, state='MAPPED', mapping_origin='AI-proposed mapping; QMS pending', ai_identity=identity_key)
            job.pop('plan_confirmation', None)
            job.pop('run_identity', None)
            message(job, 'qms', 'The AI interpretation is a typed proposal, not approval. ' + bot_summary(job))
            store.save_job(tenant, job, 'ai_mapping_proposed', usage)
            return public(run_job(tenant, job))
        except Exception as exc:
            detail = str(exc) if isinstance(exc, ValueError) and 'validation error' not in str(exc).lower() else 'AI analysis failed or returned an unsupported proposal. No output was released.'
            raise HTTPException(422, detail) from exc

    @app.get('/api/jobs/{identifier}/output')
    def output(identifier: str, identity=Depends(workspace)):
        _, tenant = identity
        job = get_job(tenant, identifier)
        if not job.get('report') or job['report']['status'] != 'RELEASED':
            raise HTTPException(409, 'QMS has not released this output.')
        for file, inspected in zip([job['files']['template']] + job['files']['sources'], [job['profiles']['template']] + job['profiles']['sources']):
            if hashlib.sha256(blobs.get(file['object_key'])).hexdigest() != inspected['sha256']:
                raise HTTPException(409, 'Original input changed; download blocked.')
        data = blobs.get(job['output_object'])
        if hashlib.sha256(data).hexdigest() != job['report']['output_sha256']:
            raise HTTPException(409, 'Final artifact hash changed; download blocked.')
        return Response(data, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', headers={'Content-Disposition': 'attachment; filename="EduSheetManager-verified.xlsx"'})

    @app.get('/api/jobs/{identifier}/evidence')
    def evidence(identifier: str, identity=Depends(workspace)):
        _, tenant = identity
        job = get_job(tenant, identifier)
        result = public(job) | {'audit_events': store.events(tenant, identifier)}
        return JSONResponse(result, headers={'Content-Disposition': 'attachment; filename="EduSheetManager-evidence.json"'})

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
        if demo and (body.api_key or body.enabled):
            raise HTTPException(403, 'Synthetic preview refuses real credentials and live AI.')
        if body.enabled:
            candidate = AISettings.model_validate({k: v for k, v in body.model_dump().items() if k in AISettings.model_fields})
            ai.validate_endpoint(candidate)
            ai.checked_pricing(candidate)
            if microdollars(candidate.monthly_budget_usd) <= 0 or microdollars(body.platform_budget_usd) < microdollars(candidate.monthly_budget_usd):
                raise HTTPException(422, 'Set a positive AI allowance within the platform budget first.')
            if not body.api_key and not store.encrypted_key():
                raise HTTPException(422, 'Configure a server-side key before enabling AI.')
        encrypted = None
        if body.clear_key:
            encrypted = ''
        elif body.api_key:
            if not encryption_key and not os.getenv('SHEETQMS_ENCRYPTION_KEY'):
                raise HTTPException(422, 'Configure a stable encryption key through private environment/secret manager before saving credentials.')
            encrypted = vault.seal(body.api_key)
        clean = body.model_dump(exclude={'api_key', 'clear_key'})
        if body.clear_key:
            clean['enabled'] = False
        store.save_settings(clean, str(uuid.uuid4()), encrypted)
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
    custom_templates_by_tenant: dict[str, list[dict]] = {}

    @app.get('/api/templates')
    def list_templates(identity=Depends(workspace)):
        _, tenant = identity
        return {'items': BUILTIN_TEMPLATES + custom_templates_by_tenant.get(tenant, [])}

    @app.post('/api/templates')
    def save_custom_template(body: dict, identity=Depends(workspace)):
        _, tenant = identity
        name = str(body.get('name') or 'Custom Template').strip()[:100]
        raw_headers = body.get('headers') or []
        if isinstance(raw_headers, str):
            headers = [h.strip() for h in re.split(r'[,;\n]+', raw_headers) if h.strip()]
        else:
            headers = [str(h).strip() for h in raw_headers if str(h).strip()]
        if not headers:
            raise HTTPException(422, 'Provide at least one column header for your template.')
        tpl = {
            'id': 'custom-' + str(uuid.uuid4())[:8],
            'name': name,
            'category': str(body.get('category') or 'Custom Account Template').strip()[:60],
            'description': str(body.get('description') or f'Custom {len(headers)}-column template saved for this account.').strip()[:200],
            'sheet': str(body.get('sheet') or 'Output').strip()[:31],
            'headers': headers,
            'sample_rows': body.get('sample_rows') or [{h: f'Sample {h}' for h in headers}],
            'builtin': False,
        }
        custom_templates_by_tenant.setdefault(tenant, []).insert(0, tpl)
        return tpl

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

    def _merge_batch_files(identity, request_id: str, source_bytes: list[tuple[str, bytes]], title: str):
        from openpyxl import Workbook
        from .samples import style_sheet
        from .engine import format_field_value
        _, tenant = identity
        # Inspect headers of each file to decide between Relational Join vs Multi-File Folder Stack
        inspected_tables = []
        with tempfile.TemporaryDirectory() as tmpd:
            for idx, (fname, data) in enumerate(source_bytes):
                ext = Path(fname).suffix.lower()
                p = Path(tmpd) / f'batch_{idx}{ext}'
                p.write_bytes(data)
                prof = profile(p, f'source-{idx+1}')
                sh = prof['sheets'][0]
                hr = sh['header_row']
                raw_rows = book_rows(p, data_only=True)[sh['name']]
                hs = [str(v or '').strip() for v in raw_rows[hr - 1]] if hr <= len(raw_rows) else list(sh['headers'])
                while hs and not hs[-1]:
                    hs.pop()
                data_rows = []
                ignored = {'subtotal', 'total', 'grand total', 'sum', 'average', 'notes'}
                for r in raw_rows[hr:]:
                    if not r or all(v is None or str(v).strip() == '' for v in r):
                        continue
                    if [norm(v) for v in r[:len(hs)]] == [norm(h) for h in hs]:
                        continue
                    if norm(r[0] if r else '') in ignored:
                        continue
                    row_dict = {hs[i]: (r[i] if i < len(r) else None) for i in range(len(hs))}
                    data_rows.append(row_dict)
                inspected_tables.append({'name': fname, 'headers': hs, 'rows': data_rows})

        # Check if this is a 2-file relational pair (e.g. Bio + Subject Marks) with low header overlap
        if len(inspected_tables) == 2:
            h0 = {norm(h) for h in inspected_tables[0]['headers']}
            h1 = {norm(h) for h in inspected_tables[1]['headers']}
            overlap = len(h0 & h1) / max(1, min(len(h0), len(h1)))
            if overlap < 0.55 and (h0 & h1):
                all_Demo = list(inspected_tables[0]['headers'])
                if not any(norm(h) == 'subjects' for h in all_Demo):
                    all_Demo.insert(min(5, len(all_Demo)), 'Subjects')
                wb_t = Workbook()
                ws_t = wb_t.active
                ws_t.title = 'Merged_Output'
                ws_t.append(all_Demo)
                style_sheet(ws_t, 1, 20)
                bio_t = BytesIO()
                wb_t.save(bio_t)
                job = create_job(tenant, request_id, ('Master-Relational-Join.xlsx', bio_t.getvalue()), source_bytes, title or 'Master-Relational-Join.xlsx')
                job['chat'] = []
                job = run_job(tenant, job)
                return public(job)

        # Otherwise: Stack all files from the folder into one Master Sheet with 'Source File', 'Duplicate Status', and SA ID Luhn Audit!
        master_headers: list[str] = ['Source File']
        for tbl in inspected_tables:
            for h in tbl['headers']:
                if not any(norm(existing) == norm(h) for existing in master_headers):
                    master_headers.append(h)

        key_col = master_headers[1] if len(master_headers) > 1 else master_headers[0]
        sa_id_col = next((h for h in master_headers if any(w in h.casefold() for w in ('sa id', 'id number', 'identity', 'id no'))), None)
        dob_col = next((h for h in master_headers if any(w in h.casefold() for w in ('date of birth', 'dob', 'birth'))), None)
        gender_col = next((h for h in master_headers if 'gender' in h.casefold() or 'sex' in h.casefold()), None)
        if sa_id_col and 'SA ID Status' not in master_headers:
            master_headers.append('SA ID Status')
        if 'Duplicate Status' not in master_headers:
            master_headers.append('Duplicate Status')

        # Track cross-file occurrences by primary key AND by SA ID
        key_files: dict[str, list[str]] = {}
        said_files: dict[str, list[str]] = {}
        stacked_rows: list[dict] = []
        file_breakdown: list[dict] = []
        sa_valid = 0
        sa_repaired = 0
        sa_foreign = 0
        sa_invalid = 0

        for tbl in inspected_tables:
            fname = tbl['name']
            file_breakdown.append({'file': fname, 'rows': len(tbl['rows'])})
            norm_to_master = {norm(mh): mh for mh in master_headers}
            for raw_r in tbl['rows']:
                rec: dict[str, object] = {mh: '' for mh in master_headers}
                rec['Source File'] = fname
                for h, val in raw_r.items():
                    mh = norm_to_master.get(norm(h), h)
                    fmt_v = format_field_value(mh, val, set())
                    rec[mh] = '' if fmt_v is None else fmt_v
                if sa_id_col:
                    info = validate_and_repair_sa_id(rec.get(sa_id_col))
                    if info['id_str']:
                        rec[sa_id_col] = info['id_str']
                    if info['repaired']:
                        sa_repaired += 1
                    elif info['status'].startswith('Valid SA ID'):
                        sa_valid += 1
                    elif info['status'].startswith('Foreign'):
                        sa_foreign += 1
                    elif info['id_str'] and 'Checksum Failed' in info['status']:
                        sa_invalid += 1
                    if dob_col and not rec.get(dob_col) and info['dob']:
                        rec[dob_col] = info['dob']
                    if gender_col and not rec.get(gender_col) and info['gender']:
                        rec[gender_col] = info['gender']
                    rec['SA ID Status'] = info['status']
                    if info['id_str']:
                        said_files.setdefault(info['id_str'].lower(), []).append(fname)
                kv = str(rec.get(key_col, '')).strip().lower()
                if kv:
                    key_files.setdefault(kv, []).append(fname)
                stacked_rows.append(rec)

        cross_dups = 0
        for rec in stacked_rows:
            kv = str(rec.get(key_col, '')).strip().lower()
            sv = str(rec.get(sa_id_col, '')).strip().lower() if sa_id_col else ''
            f_list = key_files.get(kv, []) if kv else []
            s_list = said_files.get(sv, []) if sv else []
            dup_sources = sorted(set(f_list if len(f_list) > 1 else (s_list if len(s_list) > 1 else [])))
            if len(f_list) > 1 or len(s_list) > 1:
                cross_dups += 1
                rec['Duplicate Status'] = f'Duplicate across: {", ".join(dup_sources)}'
            else:
                rec['Duplicate Status'] = 'Unique'

        job = create_job_from_builder({
            'title': title or 'Master-Batch-Consolidation.xlsx',
            'sheet': 'Master_Batch',
            'headers': master_headers,
            'rows': stacked_rows,
            'request_id': request_id,
        }, identity=identity)
        stored_job = get_job(tenant, job['id'])
        stored_job['report']['headers'] = master_headers
        stored_job['report']['rows'] = stacked_rows
        stored_job['batch_audit'] = {
            'files_merged': len(inspected_tables),
            'total_rows': len(stacked_rows),
            'cross_file_duplicates': cross_dups,
            'valid_sa_ids': sa_valid,
            'repaired_sa_ids': sa_repaired,
            'foreign_or_permit_ids': sa_foreign,
            'invalid_sa_ids': sa_invalid,
            'sa_ids_validated': sa_valid + sa_repaired,
            'sa_ids_repaired': sa_repaired,
            'sa_ids_invalid_checksum': sa_invalid,
            'file_breakdown': file_breakdown,
        }
        stored_job['chat'] = []
        summary_msg = (
            f"Batch Folder Merge Complete! Consolidated {len(inspected_tables)} files ({len(stacked_rows)} total rows) into one Master Sheet. "
            f"Flagged {cross_dups} cross-file duplicate row(s)"
            + (f" and validated SA IDs ({sa_valid} Luhn-valid, {sa_repaired} leading-0 repaired, {sa_foreign} foreign/permit, {sa_invalid} checksum warnings)." if sa_id_col else ".")
            + " Click 'Audit Certificate' in Tools or Download XLSX!"
        )
        stored_job = save_edited_workbook(tenant, stored_job, summary_msg)
        store.save_job(tenant, stored_job, 'batch_folder_merged', stored_job['batch_audit'])
        return public(stored_job)

    @app.post('/api/jobs/batch-folder')
    async def batch_folder_intake(sources: list[UploadFile] = File(...), request_id: str = Form(...), title: str = Form('Master-Batch-Consolidation.xlsx'), identity=Depends(workspace)):
        if not 1 <= len(sources) <= 50:
            raise HTTPException(422, 'Upload between 1 and 50 spreadsheets in a folder batch.')
        source_bytes = []
        for src in sources:
            fname = Path(src.filename or 'sheet.xlsx').name
            if Path(fname).suffix.lower() not in {'.xlsx', '.xls', '.csv'}:
                continue
            source_bytes.append((fname, await src.read(20 * 1024 * 1024 + 1)))
        if not source_bytes:
            raise HTTPException(422, 'No .xlsx, .xls or .csv files found in the selected folder.')
        return _merge_batch_files(identity, request_id, source_bytes, title)

    return app


app = create_online_app()
