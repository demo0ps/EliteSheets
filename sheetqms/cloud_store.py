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
rate_limits = sa.Table('rate_limits', M, sa.Column('id', sa.String, primary_key=True), sa.Column('count', sa.Integer, nullable=False), sa.Column('expires', sa.String, nullable=False))
sa.Index('job_workspace_created', jobs.c.tenant_id, jobs.c.created)
sa.Index('event_workspace_job', events.c.tenant_id, events.c.job_id, events.c.id)


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

    def credit_adjust(self, user_id, month, delta, reason, included=None):
        with self.tx(serial=True) as c:
            net = int(c.execute(sa.select(sa.func.coalesce(sa.func.sum(credit_ledger.c.delta), 0)).where(credit_ledger.c.user_id == user_id, credit_ledger.c.month == month)).scalar())
            if delta < 0 and included is not None and included + net + delta < 0:
                raise ValueError('out of credits')
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
