from __future__ import annotations

from contextlib import contextmanager
from datetime import datetime, timezone, timedelta
import json
import secrets
import threading
import uuid
from pathlib import Path

import sqlalchemy as sa
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.dialects.postgresql import insert as pg_insert

from .store import canonical, digest, now

M = sa.MetaData()
tenants = sa.Table('tenants', M, sa.Column('id', sa.String, primary_key=True), sa.Column('name', sa.String, nullable=False), sa.Column('active', sa.Boolean, nullable=False, default=True), sa.Column('created', sa.String, nullable=False))
users = sa.Table('users', M, sa.Column('id', sa.String, primary_key=True), sa.Column('tenant_id', sa.String, sa.ForeignKey('tenants.id'), nullable=False), sa.Column('email', sa.String, unique=True, nullable=False), sa.Column('name', sa.String, nullable=False), sa.Column('role', sa.String, nullable=False), sa.Column('password_hash', sa.String, nullable=False), sa.Column('active', sa.Boolean, nullable=False, default=True), sa.Column('created', sa.String, nullable=False))
sessions = sa.Table('sessions', M, sa.Column('id', sa.String, primary_key=True), sa.Column('user_id', sa.String, sa.ForeignKey('users.id'), nullable=False), sa.Column('csrf', sa.String, nullable=False), sa.Column('expires', sa.String, nullable=False))
config = sa.Table('platform_config', M, sa.Column('id', sa.Integer, primary_key=True), sa.Column('data', sa.Text, nullable=False), sa.Column('encrypted_key', sa.Text, nullable=False, default=''))
prefs = sa.Table('preferences', M, sa.Column('user_id', sa.String, primary_key=True), sa.Column('data', sa.Text, nullable=False))
jobs = sa.Table('jobs', M, sa.Column('id', sa.String, primary_key=True), sa.Column('tenant_id', sa.String, sa.ForeignKey('tenants.id'), nullable=False), sa.Column('request_id', sa.String, nullable=False), sa.Column('data', sa.Text, nullable=False), sa.Column('created', sa.String, nullable=False), sa.Column('stored_bytes', sa.BigInteger, nullable=False, default=0), sa.Column('lease_token', sa.String), sa.Column('lease_until', sa.String), sa.UniqueConstraint('tenant_id', 'request_id'))
events = sa.Table('events', M, sa.Column('id', sa.Integer, primary_key=True, autoincrement=True), sa.Column('tenant_id', sa.String, nullable=False), sa.Column('job_id', sa.String), sa.Column('trace_id', sa.String, nullable=False), sa.Column('kind', sa.String, nullable=False), sa.Column('data', sa.Text, nullable=False), sa.Column('created', sa.String, nullable=False))
knowledge = sa.Table('knowledge', M, sa.Column('id', sa.String, primary_key=True), sa.Column('tenant_id', sa.String, nullable=False), sa.Column('scope', sa.String, nullable=False), sa.Column('plan_hash', sa.String, nullable=False), sa.Column('data', sa.Text, nullable=False), sa.Column('created', sa.String, nullable=False), sa.UniqueConstraint('tenant_id', 'scope', 'plan_hash'))
heads = sa.Table('knowledge_heads', M, sa.Column('tenant_id', sa.String, primary_key=True), sa.Column('scope', sa.String, primary_key=True), sa.Column('knowledge_id', sa.String, nullable=False))
spend = sa.Table('spend', M, sa.Column('id', sa.String, primary_key=True), sa.Column('month', sa.String, nullable=False), sa.Column('reserved', sa.BigInteger, nullable=False), sa.Column('actual', sa.BigInteger), sa.Column('created', sa.String, nullable=False))
credit_ledger = sa.Table('credit_ledger', M, sa.Column('id', sa.String, primary_key=True), sa.Column('user_id', sa.String, nullable=False), sa.Column('month', sa.String, nullable=False), sa.Column('delta', sa.Integer, nullable=False), sa.Column('reason', sa.String, nullable=False), sa.Column('created', sa.String, nullable=False))
sa.Index('credit_user_month', credit_ledger.c.user_id, credit_ledger.c.month)
credit_settings = sa.Table('credit_settings', M, sa.Column('id', sa.Integer, primary_key=True), sa.Column('included', sa.Integer, nullable=False), sa.Column('monthly_fee', sa.Integer, nullable=False))
credit_allowances = sa.Table('credit_allowances', M, sa.Column('user_id', sa.String, primary_key=True), sa.Column('included', sa.Integer, nullable=False), sa.Column('updated', sa.String, nullable=False))
admin_audit = sa.Table('admin_audit', M, sa.Column('id', sa.String, primary_key=True), sa.Column('actor_id', sa.String, nullable=False), sa.Column('action', sa.String, nullable=False), sa.Column('target_id', sa.String, nullable=False), sa.Column('detail', sa.Text, nullable=False), sa.Column('created', sa.String, nullable=False))
sa.Index('admin_audit_target', admin_audit.c.target_id)
user_limits = sa.Table('user_limits', M, sa.Column('user_id', sa.String, primary_key=True), sa.Column('paused', sa.Boolean, nullable=False), sa.Column('pause_reason', sa.String, nullable=False), sa.Column('spend_cap', sa.Integer, nullable=True), sa.Column('updated', sa.String, nullable=False))
credit_undos = sa.Table('credit_undos', M, sa.Column('ledger_id', sa.String, primary_key=True), sa.Column('user_id', sa.String, nullable=False), sa.Column('reversal_id', sa.String, nullable=False), sa.Column('actor_id', sa.String, nullable=False), sa.Column('created', sa.String, nullable=False))
credit_alerts = sa.Table('credit_alerts', M, sa.Column('user_id', sa.String, primary_key=True), sa.Column('month', sa.String, primary_key=True), sa.Column('kind', sa.String, primary_key=True), sa.Column('created', sa.String, nullable=False))
subscriptions = sa.Table('subscriptions', M, sa.Column('user_id', sa.String, primary_key=True), sa.Column('status', sa.String, nullable=False), sa.Column('period_end', sa.String, nullable=True), sa.Column('grace_until', sa.String, nullable=True), sa.Column('updated', sa.String, nullable=False))
payments = sa.Table('payments', M, sa.Column('id', sa.String, primary_key=True), sa.Column('user_id', sa.String, nullable=False), sa.Column('kind', sa.String, nullable=False), sa.Column('amount_cents', sa.Integer, nullable=False), sa.Column('vat_cents', sa.Integer, nullable=False), sa.Column('credits', sa.Integer, nullable=False), sa.Column('reference', sa.String, nullable=False), sa.Column('created', sa.String, nullable=False), sa.Column('recorded_by', sa.String, nullable=False), sa.Column('provider_id', sa.String, nullable=True))
sa.Index('payments_user', payments.c.user_id)
payment_providers = sa.Table('payment_providers', M, sa.Column('id', sa.String, primary_key=True), sa.Column('name', sa.String, nullable=False), sa.Column('merchant_ref', sa.String, nullable=False), sa.Column('settlement_last4', sa.String, nullable=False), sa.Column('active', sa.Boolean, nullable=False), sa.Column('is_default', sa.Boolean, nullable=False), sa.Column('kind', sa.String, nullable=False, default='manual'), sa.Column('mode', sa.String, nullable=False, default='test'), sa.Column('created', sa.String, nullable=False))
provider_secrets = sa.Table('provider_secrets', M, sa.Column('provider_id', sa.String, primary_key=True), sa.Column('secret_sealed', sa.Text, nullable=False, default=''), sa.Column('webhook_sealed', sa.Text, nullable=False, default=''), sa.Column('public_key', sa.String, nullable=False, default=''), sa.Column('secret_last4', sa.String, nullable=False, default=''), sa.Column('updated', sa.String, nullable=False))
checkouts = sa.Table('checkouts', M, sa.Column('id', sa.String, primary_key=True), sa.Column('provider_id', sa.String, nullable=False), sa.Column('user_id', sa.String, nullable=False), sa.Column('kind', sa.String, nullable=False), sa.Column('amount_cents', sa.Integer, nullable=False), sa.Column('reference', sa.String, nullable=False), sa.Column('external_id', sa.String), sa.Column('status', sa.String, nullable=False), sa.Column('created', sa.String, nullable=False), sa.Column('paid', sa.String))
sa.Index('checkouts_external', checkouts.c.external_id)
rate_limits = sa.Table('rate_limits', M, sa.Column('id', sa.String, primary_key=True), sa.Column('count', sa.Integer, nullable=False), sa.Column('expires', sa.String, nullable=False))
helper_usage = sa.Table('helper_usage', M, sa.Column('id', sa.String, primary_key=True), sa.Column('user_id', sa.String, nullable=False), sa.Column('month', sa.String, nullable=False), sa.Column('kind', sa.String, nullable=False), sa.Column('created', sa.String, nullable=False))
sa.Index('helper_usage_user_month', helper_usage.c.user_id, helper_usage.c.month, helper_usage.c.kind)
sa.Index('job_workspace_created', jobs.c.tenant_id, jobs.c.created)
sa.Index('event_workspace_job', events.c.tenant_id, events.c.job_id, events.c.id)


class CreditCapReached(ValueError):
    pass


class CloudStore:
    """Shared durable state: PostgreSQL in cloud, private SQLite for development only."""
    def __init__(self, url: str, migrate=True):
        self.lock = threading.RLock()
        kwargs = {'pool_pre_ping': True}
        if url.startswith('sqlite'):
            kwargs['connect_args'] = {'check_same_thread': False, 'timeout': 30}
        else:
            kwargs.update(pool_size=3, max_overflow=0, pool_timeout=15)
        self.engine = sa.create_engine(url, **kwargs)
        self.dialect = self.engine.dialect.name
        if migrate:
            self.migrate()

    def migrate(self):
        M.create_all(self.engine)
        columns = {v['name'] for v in sa.inspect(self.engine).get_columns('jobs')}
        with self.engine.begin() as c:
            for name, sql in [('stored_bytes','BIGINT NOT NULL DEFAULT 0'),('lease_token','VARCHAR'),('lease_until','VARCHAR')]:
                if name not in columns:
                    c.exec_driver_sql(f'ALTER TABLE jobs ADD COLUMN {name} {sql}')
            if self.dialect == 'sqlite':
                for table in ['events', 'knowledge']:
                    c.exec_driver_sql(f"CREATE TRIGGER IF NOT EXISTS immutable_{table}_update BEFORE UPDATE ON {table} BEGIN SELECT RAISE(ABORT,'Append-only record'); END")
                    c.exec_driver_sql(f"CREATE TRIGGER IF NOT EXISTS immutable_{table}_delete BEFORE DELETE ON {table} BEGIN SELECT RAISE(ABORT,'Append-only record'); END")
            else:
                c.exec_driver_sql("CREATE OR REPLACE FUNCTION block_audit_mutation() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'Append-only record'; END; $$ LANGUAGE plpgsql")
                for table in ['events', 'knowledge']:
                    c.exec_driver_sql(f'DROP TRIGGER IF EXISTS immutable_{table} ON {table}')
                    c.exec_driver_sql(f'CREATE TRIGGER immutable_{table} BEFORE UPDATE OR DELETE ON {table} FOR EACH ROW EXECUTE FUNCTION block_audit_mutation()')
            pay_columns = {v['name'] for v in sa.inspect(self.engine).get_columns('payments')}
            if 'provider_id' not in pay_columns:
                c.exec_driver_sql('ALTER TABLE payments ADD COLUMN provider_id VARCHAR')
            provider_columns = {v['name'] for v in sa.inspect(self.engine).get_columns('payment_providers')}
            if 'kind' not in provider_columns:
                c.exec_driver_sql("ALTER TABLE payment_providers ADD COLUMN kind VARCHAR NOT NULL DEFAULT 'manual'")
            if 'mode' not in provider_columns:
                c.exec_driver_sql("ALTER TABLE payment_providers ADD COLUMN mode VARCHAR NOT NULL DEFAULT 'test'")
            if c.execute(sa.select(config.c.id).where(config.c.id == 1)).first() is None:
                self.upsert(c, config, {'id': 1, 'data': '{}', 'encrypted_key': ''}, ['id'], nothing=True)

    @contextmanager
    def tx(self, serial=False):
        with self.lock:
            with self.engine.connect() as c:
                if serial and self.dialect == 'sqlite':
                    c.exec_driver_sql('BEGIN IMMEDIATE')
                else:
                    c.begin()
                try:
                    yield c
                    c.commit()
                except Exception:
                    c.rollback()
                    raise

    def upsert(self, c, table, values, keys, nothing=False):
        factory = sqlite_insert if self.dialect == 'sqlite' else pg_insert
        query = factory(table).values(**values)
        if nothing:
            query = query.on_conflict_do_nothing(index_elements=keys)
        else:
            query = query.on_conflict_do_update(index_elements=keys, set_={k: query.excluded[k] for k in values if k not in keys})
        c.execute(query)

    def event_in(self, c, tenant, job_id, trace, kind, data):
        c.execute(events.insert().values(tenant_id=tenant, job_id=job_id, trace_id=trace, kind=kind, data=canonical(data), created=now()))

    def event(self, tenant, job_id, trace, kind, data):
        with self.tx() as c:
            self.event_in(c, tenant, job_id, trace, kind, data)

    def bootstrap_user(self, tenant, name, email, display, role, password_hash):
        with self.tx(serial=True) as c:
            self.upsert(c, tenants, {'id': tenant, 'name': name, 'active': True, 'created': now()}, ['id'], nothing=True)
            existing = c.execute(sa.select(users).where(users.c.email == email.lower())).mappings().first()
            if existing:
                return dict(existing)
            user = {'id': str(uuid.uuid4()), 'tenant_id': tenant, 'email': email.lower(), 'name': display, 'role': role, 'password_hash': password_hash, 'active': True, 'created': now()}
            c.execute(users.insert().values(**user))
            return user

    def user_email(self, email):
        with self.engine.connect() as c:
            row = c.execute(sa.select(users).where(users.c.email == email.lower())).mappings().first()
            return dict(row) if row else None

    def new_session(self, user):
        token, csrf = secrets.token_urlsafe(36), secrets.token_urlsafe(24)
        expiry = (datetime.now(timezone.utc) + timedelta(hours=12)).isoformat()
        with self.tx() as c:
            c.execute(sessions.insert().values(id=digest(token), user_id=user['id'], csrf=csrf, expires=expiry))
        return token, csrf

    def session(self, token):
        with self.engine.connect() as c:
            row = c.execute(sa.select(users, sessions.c.csrf, sessions.c.id.label('session_id')).join(sessions, users.c.id == sessions.c.user_id).where(sessions.c.id == digest(token), sessions.c.expires > now(), users.c.active == True)).mappings().first()
            return dict(row) if row else None

    def logout(self, token):
        with self.tx() as c:
            c.execute(sessions.delete().where(sessions.c.id == digest(token)))

    def tenant_list(self):
        with self.engine.connect() as c:
            ts = [dict(r) for r in c.execute(sa.select(tenants).where(tenants.c.id != 'platform').order_by(tenants.c.created)).mappings()]
            counts = dict(c.execute(sa.select(users.c.tenant_id, sa.func.count()).group_by(users.c.tenant_id)).all())
            for item in ts:
                item['users'] = counts.get(item['id'], 0)
            return ts

    def tenant(self, identifier):
        with self.engine.connect() as c:
            row = c.execute(sa.select(tenants).where(tenants.c.id == identifier, tenants.c.active == True)).mappings().first()
            return dict(row) if row else None

    def preferences(self, user):
        with self.engine.connect() as c:
            value = c.execute(sa.select(prefs.c.data).where(prefs.c.user_id == user)).scalar()
            return json.loads(value) if value else {}

    def save_preferences(self, user, data):
        with self.tx() as c:
            self.upsert(c, prefs, {'user_id': user, 'data': canonical(data)}, ['user_id'])

    def settings(self):
        with self.engine.connect() as c:
            value = c.execute(sa.select(config.c.data).where(config.c.id == 1)).scalar()
            return json.loads(value)

    def encrypted_key(self):
        with self.engine.connect() as c:
            return c.execute(sa.select(config.c.encrypted_key).where(config.c.id == 1)).scalar()

    def save_settings(self, settings, trace, encrypted_key=None):
        with self.tx(serial=True) as c:
            c.execute(sa.select(config.c.id).where(config.c.id == 1).with_for_update()).first()
            values = {'data': canonical(settings)}
            if encrypted_key is not None:
                values['encrypted_key'] = encrypted_key
            c.execute(config.update().where(config.c.id == 1).values(**values))
            self.event_in(c, 'platform', None, trace, 'platform_settings_updated', {'enabled': settings.get('enabled'), 'monthly_budget_usd': settings.get('monthly_budget_usd')})

    def job(self, tenant, identifier):
        with self.engine.connect() as c:
            value = c.execute(sa.select(jobs.c.data).where(jobs.c.tenant_id == tenant, jobs.c.id == identifier)).scalar()
            return json.loads(value) if value else None

    def request_job(self, tenant, request):
        with self.engine.connect() as c:
            value = c.execute(sa.select(jobs.c.data).where(jobs.c.tenant_id == tenant, jobs.c.request_id == request)).scalar()
            return json.loads(value) if value else None

    def create_job(self, tenant, request, job, max_jobs=100, max_bytes=262144000):
        with self.tx(serial=True) as c:
            c.execute(sa.select(tenants.c.id).where(tenants.c.id == tenant).with_for_update()).first()
            prior = c.execute(sa.select(jobs.c.data).where(jobs.c.tenant_id == tenant, jobs.c.request_id == request)).scalar()
            if prior:
                return json.loads(prior)
            count, used = c.execute(sa.select(sa.func.count(), sa.func.coalesce(sa.func.sum(jobs.c.stored_bytes), 0)).where(jobs.c.tenant_id == tenant)).one()
            if count >= max_jobs or used + job.get('stored_bytes',0) > max_bytes:
                raise ValueError('Customer job/storage quota reached. Delete job files or ask the admin.')
            self.upsert(c, jobs, {'id': job['id'], 'tenant_id': tenant, 'request_id': request, 'data': canonical(job), 'created': job['created'], 'stored_bytes': job.get('stored_bytes',0)}, ['tenant_id', 'request_id'], nothing=True)
            row = c.execute(sa.select(jobs).where(jobs.c.tenant_id == tenant, jobs.c.request_id == request)).mappings().first()
            if row['id'] == job['id']:
                self.event_in(c, tenant, job['id'], job['trace_id'], 'job_inspected', {'state': job['state']})
            return json.loads(row['data'])

    def save_job(self, tenant, job, kind, data=None):
        with self.tx(serial=True) as c:
            c.execute(jobs.update().where(jobs.c.tenant_id == tenant, jobs.c.id == job['id']).values(data=canonical(job), stored_bytes=job.get('stored_bytes',0)))
            self.event_in(c, tenant, job['id'], job['trace_id'], kind, data or {'state': job['state']})

    def job_list(self, tenant):
        with self.engine.connect() as c:
            rows = c.execute(sa.select(jobs.c.data).where(jobs.c.tenant_id == tenant).order_by(jobs.c.created.desc()).limit(40)).scalars()
            return [json.loads(r) for r in rows]

    def events(self, tenant, job_id):
        with self.engine.connect() as c:
            return [dict(r) | {'data': json.loads(r['data'])} for r in c.execute(sa.select(events).where(events.c.tenant_id == tenant, events.c.job_id == job_id).order_by(events.c.id)).mappings()]

    def knowledge(self, tenant):
        with self.engine.connect() as c:
            hs = dict(c.execute(sa.select(heads.c.scope, heads.c.knowledge_id).where(heads.c.tenant_id == tenant)).all())
            rows = c.execute(sa.select(knowledge).where(knowledge.c.tenant_id == tenant).order_by(knowledge.c.created.desc())).mappings()
            return [json.loads(r['data']) | {'active': hs.get(r['scope']) == r['id']} for r in rows]

    def learn(self, tenant, item):
        scope = digest([item['version'], item['input_signature']])
        plan_hash = digest({'plan': item['plan'], 'bindings': item['bindings']})
        with self.tx(serial=True) as c:
            identifier = str(uuid.uuid4())
            value = item | {'id': identifier, 'created': now()}
            self.upsert(c, knowledge, {'id': identifier, 'tenant_id': tenant, 'scope': scope, 'plan_hash': plan_hash, 'data': canonical(value), 'created': value['created']}, ['tenant_id', 'scope', 'plan_hash'], nothing=True)
            row = c.execute(sa.select(knowledge.c.id).where(knowledge.c.tenant_id == tenant, knowledge.c.scope == scope, knowledge.c.plan_hash == plan_hash)).scalar_one()
            self.upsert(c, heads, {'tenant_id': tenant, 'scope': scope, 'knowledge_id': row}, ['tenant_id', 'scope'])
            self.event_in(c, tenant, item['job_id'], item['trace_id'], 'knowledge_linked', {'knowledge_id': row})
            return row

    def delete_job(self, tenant, job):
        with self.tx() as c:
            c.execute(jobs.delete().where(jobs.c.tenant_id == tenant, jobs.c.id == job['id']))
            self.event_in(c, tenant, job['id'], job['trace_id'], 'job_files_deleted', {'note': 'Structural knowledge and minimal audit retained.'})

    def helper_count(self, user_id, month, kind):
        with self.tx() as c:
            return int(c.execute(sa.select(sa.func.count()).select_from(helper_usage).where(helper_usage.c.user_id == user_id, helper_usage.c.month == month, helper_usage.c.kind == kind)).scalar() or 0)

    def helper_record(self, user_id, month, kind):
        with self.tx() as c:
            c.execute(helper_usage.insert().values(id=str(uuid.uuid4()), user_id=user_id, month=month, kind=kind, created=now()))

    def take_rate(self, key, maximum=15, seconds=900):
        with self.tx(serial=True) as c:
            row = c.execute(sa.select(rate_limits).where(rate_limits.c.id == key).with_for_update()).mappings().first()
            count = row['count'] if row and row['expires'] > now() else 0
            if count >= maximum:
                return False
            expires = row['expires'] if row and row['expires'] > now() else (datetime.now(timezone.utc) + timedelta(seconds=seconds)).isoformat()
            self.upsert(c, rate_limits, {'id': key, 'count': count + 1, 'expires': expires}, ['id'])
            return True

    def spent(self):
        month = datetime.now(timezone.utc).strftime('%Y-%m')
        with self.engine.connect() as c:
            return int(c.execute(sa.select(sa.func.coalesce(sa.func.sum(sa.func.coalesce(spend.c.actual, spend.c.reserved)), 0)).where(spend.c.month == month)).scalar())

    def reserve(self, request_id, reserved, budget):
        month = datetime.now(timezone.utc).strftime('%Y-%m')
        with self.tx(serial=True) as c:
            c.execute(sa.select(config.c.id).where(config.c.id == 1).with_for_update()).first()
            if c.execute(sa.select(spend.c.id).where(spend.c.id == request_id)).first():
                raise ValueError('This AI request already has a reservation; do not retry automatically.')
            used = c.execute(sa.select(sa.func.coalesce(sa.func.sum(sa.func.coalesce(spend.c.actual, spend.c.reserved)), 0)).where(spend.c.month == month)).scalar()
            if budget <= 0 or used + reserved > budget:
                raise ValueError('The platform monthly AI budget would be exceeded. Ask the platform admin.')
            c.execute(spend.insert().values(id=request_id, month=month, reserved=int(reserved), created=now()))
            self.event_in(c, 'platform', None, request_id, 'budget_reserved', {'reserved_micro_usd': reserved})

    def settle(self, request_id, actual):
        with self.tx(serial=True) as c:
            c.execute(spend.update().where(spend.c.id == request_id).values(actual=int(actual)))
            self.event_in(c, 'platform', None, request_id, 'budget_settled', {'actual_micro_usd': actual})

    def usage(self, tenant):
        with self.engine.connect() as c:
            count, used = c.execute(sa.select(sa.func.count(), sa.func.coalesce(sa.func.sum(jobs.c.stored_bytes),0)).where(jobs.c.tenant_id == tenant)).one()
            return int(count), int(used)

    def credit_adjust(self, user_id, month, delta, reason, included=None, cap=None):
        with self.tx(serial=True) as c:
            net = int(c.execute(sa.select(sa.func.coalesce(sa.func.sum(credit_ledger.c.delta), 0)).where(credit_ledger.c.user_id == user_id, credit_ledger.c.month == month)).scalar())
            if delta < 0 and included is not None and included + net + delta < 0:
                raise ValueError('out of credits')
            if delta < 0 and cap is not None:
                used = -int(c.execute(sa.select(sa.func.coalesce(sa.func.sum(credit_ledger.c.delta), 0)).where(credit_ledger.c.user_id == user_id, credit_ledger.c.month == month, credit_ledger.c.delta < 0)).scalar())
                if used - delta > cap:
                    raise CreditCapReached('spending cap reached')
            c.execute(credit_ledger.insert().values(id=str(uuid.uuid4()), user_id=user_id, month=month, delta=int(delta), reason=str(reason)[:80], created=now()))
            return net + int(delta)

    def credit_summary(self, user_id, month):
        with self.engine.connect() as c:
            deltas = c.execute(sa.select(credit_ledger.c.delta).where(credit_ledger.c.user_id == user_id, credit_ledger.c.month == month)).scalars().all()
        granted = sum(d for d in deltas if d > 0)
        used = -sum(d for d in deltas if d < 0)
        return int(granted), int(used)

    def user_in_tenant(self, tenant, user_id):
        with self.engine.connect() as c:
            return c.execute(sa.select(users.c.id).where(users.c.id == user_id, users.c.tenant_id == tenant)).first() is not None

    def credit_config(self):
        with self.engine.connect() as c:
            row = c.execute(sa.select(credit_settings).where(credit_settings.c.id == 1)).mappings().first()
        if row is None:
            return {'included': 200, 'monthly_fee': 79}
        return {'included': int(row['included']), 'monthly_fee': int(row['monthly_fee'])}

    def save_credit_config(self, included, monthly_fee):
        with self.tx(serial=True) as c:
            self.upsert(c, credit_settings, {'id': 1, 'included': int(included), 'monthly_fee': int(monthly_fee)}, ['id'])

    def credit_allowances_map(self):
        with self.engine.connect() as c:
            return {r[0]: int(r[1]) for r in c.execute(sa.select(credit_allowances.c.user_id, credit_allowances.c.included)).all()}

    def credit_allowance(self, user_id):
        return self.credit_allowances_map().get(user_id)

    def save_credit_allowance(self, user_id, included):
        with self.tx(serial=True) as c:
            self.upsert(c, credit_allowances, {'user_id': user_id, 'included': int(included), 'updated': now()}, ['user_id'])

    def save_provider_keys(self, provider_id, secret_sealed=None, webhook_sealed=None, public_key=None, secret_last4=None, mode=None):
        """Store sealed keys. Only the provided fields change. Never returns key material."""
        with self.tx(serial=True) as c:
            row = c.execute(sa.select(provider_secrets).where(provider_secrets.c.provider_id == provider_id)).mappings().first()
            values = dict(row) if row else {'provider_id': provider_id, 'secret_sealed': '', 'webhook_sealed': '', 'public_key': '', 'secret_last4': ''}
            if secret_sealed is not None:
                values['secret_sealed'], values['secret_last4'] = secret_sealed, secret_last4 or ''
            if webhook_sealed is not None:
                values['webhook_sealed'] = webhook_sealed
            if public_key is not None:
                values['public_key'] = public_key
            values['updated'] = now()
            if row:
                c.execute(provider_secrets.update().where(provider_secrets.c.provider_id == provider_id).values(**{k: v for k, v in values.items() if k != 'provider_id'}))
            else:
                c.execute(provider_secrets.insert().values(**values))
            if mode is not None:
                c.execute(payment_providers.update().where(payment_providers.c.id == provider_id).values(mode=mode))

    def provider_keys(self, provider_id):
        with self.engine.connect() as c:
            row = c.execute(sa.select(provider_secrets).where(provider_secrets.c.provider_id == provider_id)).mappings().first()
        return dict(row) if row else None

    def create_checkout(self, checkout_id, provider_id, user_id, kind, amount_cents, reference):
        with self.tx(serial=True) as c:
            c.execute(checkouts.insert().values(id=checkout_id, provider_id=provider_id, user_id=user_id, kind=kind, amount_cents=int(amount_cents), reference=reference, external_id=None, status='pending', created=now(), paid=None))

    def set_checkout_external(self, checkout_id, external_id):
        with self.tx(serial=True) as c:
            c.execute(checkouts.update().where(checkouts.c.id == checkout_id).values(external_id=external_id))

    def mark_checkout_failed(self, checkout_id):
        with self.tx(serial=True) as c:
            c.execute(checkouts.update().where(checkouts.c.id == checkout_id, checkouts.c.status == 'pending').values(status='failed'))

    def checkout_by_external(self, external_id):
        with self.engine.connect() as c:
            row = c.execute(sa.select(checkouts).where(checkouts.c.external_id == external_id)).mappings().first()
        return dict(row) if row else None

    def mark_checkout_paid(self, checkout_id):
        """True only for the first caller, so a repeated webhook can never record or grant twice."""
        with self.tx(serial=True) as c:
            result = c.execute(checkouts.update().where(checkouts.c.id == checkout_id, checkouts.c.status == 'pending').values(status='paid', paid=now()))
            return result.rowcount == 1

    def pending_checkout_count(self, user_id):
        with self.engine.connect() as c:
            return len(c.execute(sa.select(checkouts.c.id).where(checkouts.c.user_id == user_id, checkouts.c.status == 'pending')).all())

    def audit(self, actor_id, action, target_id, detail):
        with self.tx(serial=True) as c:
            c.execute(admin_audit.insert().values(id=str(uuid.uuid4()), actor_id=actor_id, action=action, target_id=target_id, detail=json.dumps(detail, sort_keys=True), created=now()))

    def audit_list(self, target_id, limit=100):
        with self.engine.connect() as c:
            rows = c.execute(sa.select(admin_audit).where(admin_audit.c.target_id == target_id).order_by(admin_audit.c.created.desc()).limit(limit)).mappings().all()
        return [{'action': r['action'], 'actor_id': r['actor_id'], 'detail': json.loads(r['detail']), 'created': r['created']} for r in rows]

    def user_by_id(self, user_id):
        with self.engine.connect() as c:
            row = c.execute(sa.select(users.c.id, users.c.name, users.c.email, users.c.role, users.c.tenant_id, tenants.c.name.label('tenant_name')).select_from(users.join(tenants, tenants.c.id == users.c.tenant_id)).where(users.c.id == user_id)).mappings().first()
        return dict(row) if row else None

    def credit_directory(self, month):
        with self.engine.connect() as c:
            rows = c.execute(sa.select(users.c.id, users.c.name, users.c.email, users.c.role, users.c.tenant_id, tenants.c.name.label('tenant_name')).select_from(users.join(tenants, tenants.c.id == users.c.tenant_id)).where(users.c.active == True).order_by(users.c.name)).mappings().all()
            deltas = c.execute(sa.select(credit_ledger.c.user_id, credit_ledger.c.delta).where(credit_ledger.c.month == month)).all()
        granted, used = {}, {}
        for uid, delta in deltas:
            if delta > 0:
                granted[uid] = granted.get(uid, 0) + int(delta)
            else:
                used[uid] = used.get(uid, 0) - int(delta)
        return [dict(r) | {'granted': granted.get(r['id'], 0), 'used': used.get(r['id'], 0)} for r in rows]

    def credit_history(self, user_id, limit=200):
        with self.engine.connect() as c:
            rows = c.execute(sa.select(credit_ledger).where(credit_ledger.c.user_id == user_id).order_by(credit_ledger.c.created.desc()).limit(limit)).mappings().all()
            undone = {r[0] for r in c.execute(sa.select(credit_undos.c.ledger_id).where(credit_undos.c.user_id == user_id)).all()}
        return [{'id': r['id'], 'month': r['month'], 'delta': int(r['delta']), 'reason': r['reason'], 'created': r['created'], 'undone': r['id'] in undone} for r in rows]

    def get_user_limits(self, user_id):
        with self.engine.connect() as c:
            r = c.execute(sa.select(user_limits).where(user_limits.c.user_id == user_id)).mappings().first()
        if not r:
            return {'paused': False, 'pause_reason': '', 'spend_cap': None}
        return {'paused': bool(r['paused']), 'pause_reason': r['pause_reason'] or '', 'spend_cap': r['spend_cap']}

    def save_user_limits(self, user_id, paused, pause_reason, spend_cap):
        with self.tx() as c:
            self.upsert(c, user_limits, {'user_id': user_id, 'paused': bool(paused), 'pause_reason': str(pause_reason or '')[:200], 'spend_cap': spend_cap, 'updated': now()}, ['user_id'])

    def undo_credit(self, user_id, ledger_id, actor_id, reason):
        with self.tx(serial=True) as c:
            r = c.execute(sa.select(credit_ledger).where(credit_ledger.c.id == ledger_id, credit_ledger.c.user_id == user_id)).mappings().first()
            if not r or int(r['delta']) >= 0:
                raise LookupError('not a charge')
            if c.execute(sa.select(credit_undos.c.ledger_id).where(credit_undos.c.ledger_id == ledger_id)).first():
                raise ValueError('already undone')
            reversal = str(uuid.uuid4())
            c.execute(credit_ledger.insert().values(id=reversal, user_id=user_id, month=r['month'], delta=-int(r['delta']), reason=('Undo: ' + str(reason))[:80], created=now()))
            c.execute(credit_undos.insert().values(ledger_id=ledger_id, user_id=user_id, reversal_id=reversal, actor_id=actor_id, created=now()))
            return -int(r['delta'])

    def credit_ledger_rows(self, month):
        j = credit_ledger.join(users, users.c.id == credit_ledger.c.user_id).join(tenants, tenants.c.id == users.c.tenant_id)
        with self.engine.connect() as c:
            rows = c.execute(sa.select(credit_ledger.c.id, credit_ledger.c.created, credit_ledger.c.month, credit_ledger.c.delta, credit_ledger.c.reason, users.c.name, users.c.email, tenants.c.name.label('tenant_name')).select_from(j).where(credit_ledger.c.month == month).order_by(credit_ledger.c.created)).mappings().all()
        return [dict(r) for r in rows]

    def get_subscription(self, user_id):
        with self.engine.connect() as c:
            r = c.execute(sa.select(subscriptions).where(subscriptions.c.user_id == user_id)).mappings().first()
        if not r:
            return {'status': 'active', 'period_end': None, 'grace_until': None}
        return {'status': r['status'], 'period_end': r['period_end'], 'grace_until': r['grace_until']}

    def save_subscription(self, user_id, status, period_end, grace_until):
        with self.tx() as c:
            self.upsert(c, subscriptions, {'user_id': user_id, 'status': status, 'period_end': period_end, 'grace_until': grace_until, 'updated': now()}, ['user_id'])

    def payment_reference_exists(self, user_id, reference):
        with self.engine.connect() as c:
            return c.execute(sa.select(payments.c.id).where(payments.c.user_id == user_id, payments.c.reference == reference)).first() is not None

    def add_payment(self, user_id, kind, amount_cents, vat_cents, credits, reference, recorded_by, provider_id=None):
        with self.tx() as c:
            c.execute(payments.insert().values(id=str(uuid.uuid4()), user_id=user_id, kind=kind, amount_cents=int(amount_cents), vat_cents=int(vat_cents), credits=int(credits), reference=str(reference)[:80], created=now(), recorded_by=recorded_by, provider_id=provider_id))

    def user_payments(self, user_id, limit=100):
        with self.engine.connect() as c:
            rows = c.execute(sa.select(payments).where(payments.c.user_id == user_id).order_by(payments.c.created.desc()).limit(limit)).mappings().all()
        return [dict(r) for r in rows]

    def list_providers(self):
        with self.engine.connect() as c:
            rows = c.execute(sa.select(payment_providers).order_by(payment_providers.c.created)).mappings().all()
        return [dict(r) for r in rows]

    def get_provider(self, provider_id):
        with self.engine.connect() as c:
            r = c.execute(sa.select(payment_providers).where(payment_providers.c.id == provider_id)).mappings().first()
        return dict(r) if r else None

    def default_provider(self):
        with self.engine.connect() as c:
            r = c.execute(sa.select(payment_providers).where(payment_providers.c.active == True, payment_providers.c.is_default == True)).mappings().first()  # noqa: E712
        return dict(r) if r else None

    def add_provider(self, name, merchant_ref, settlement_last4, make_default, kind='manual'):
        with self.tx(serial=True) as c:
            existing = c.execute(sa.select(payment_providers.c.id).where(payment_providers.c.active == True)).first()  # noqa: E712
            default = bool(make_default) or existing is None
            if default:
                c.execute(payment_providers.update().values(is_default=False))
            provider_id = str(uuid.uuid4())
            c.execute(payment_providers.insert().values(id=provider_id, name=str(name)[:60], merchant_ref=str(merchant_ref)[:80], settlement_last4=str(settlement_last4)[-4:], active=True, is_default=default, kind=kind, mode='test', created=now()))
            return provider_id

    def set_default_provider(self, provider_id):
        with self.tx(serial=True) as c:
            c.execute(payment_providers.update().values(is_default=False))
            c.execute(payment_providers.update().where(payment_providers.c.id == provider_id, payment_providers.c.active == True).values(is_default=True))  # noqa: E712

    def deactivate_provider(self, provider_id):
        with self.tx(serial=True) as c:
            c.execute(payment_providers.update().where(payment_providers.c.id == provider_id).values(active=False, is_default=False))

    def credit_alert_sent(self, user_id, month, kind):
        with self.engine.connect() as c:
            return c.execute(sa.select(credit_alerts.c.kind).where(credit_alerts.c.user_id == user_id, credit_alerts.c.month == month, credit_alerts.c.kind == kind)).first() is not None

    def record_credit_alert(self, user_id, month, kind):
        with self.tx() as c:
            self.upsert(c, credit_alerts, {'user_id': user_id, 'month': month, 'kind': kind, 'created': now()}, ['user_id', 'month', 'kind'], nothing=True)

    @contextmanager
    def lease(self, tenant, identifier):
        token = str(uuid.uuid4())
        expiry = (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()
        with self.tx(serial=True) as c:
            changed = c.execute(jobs.update().where(jobs.c.tenant_id == tenant, jobs.c.id == identifier, sa.or_(jobs.c.lease_token == None, jobs.c.lease_until < now())).values(lease_token=token,lease_until=expiry)).rowcount
            if not changed:
                raise ValueError('This job is already processing; wait for the current request before changing it.')
        try:
            yield
        finally:
            with self.tx() as c:
                c.execute(jobs.update().where(jobs.c.tenant_id == tenant,jobs.c.id == identifier,jobs.c.lease_token==token).values(lease_token=None,lease_until=None))
