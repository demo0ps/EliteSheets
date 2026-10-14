from pathlib import Path
ROOT=Path(__file__).resolve().parent
p=ROOT/'sheetqms/cloud_store.py'
t=p.read_text()
t=t.replace("sa.Column('created', sa.String, nullable=False), sa.UniqueConstraint('tenant_id', 'request_id'))", "sa.Column('created', sa.String, nullable=False), sa.Column('stored_bytes', sa.BigInteger, nullable=False, default=0), sa.Column('lease_token', sa.String), sa.Column('lease_until', sa.String), sa.UniqueConstraint('tenant_id', 'request_id'))",1)
t=t.replace("        M.create_all(self.engine)\n        with self.engine.begin() as c:", """        M.create_all(self.engine)
        columns = {v['name'] for v in sa.inspect(self.engine).get_columns('jobs')}
        with self.engine.begin() as c:
            for name, sql in [('stored_bytes','BIGINT NOT NULL DEFAULT 0'),('lease_token','VARCHAR'),('lease_until','VARCHAR')]:
                if name not in columns:
                    c.exec_driver_sql(f'ALTER TABLE jobs ADD COLUMN {name} {sql}')""",1)
t=t.replace("def create_job(self, tenant, request, job):", "def create_job(self, tenant, request, job, max_jobs=100, max_bytes=262144000):",1)
t=t.replace("        with self.tx(serial=True) as c:\n            self.upsert(c, jobs,", """        with self.tx(serial=True) as c:
            c.execute(sa.select(tenants.c.id).where(tenants.c.id == tenant).with_for_update()).first()
            prior = c.execute(sa.select(jobs.c.data).where(jobs.c.tenant_id == tenant, jobs.c.request_id == request)).scalar()
            if prior:
                return json.loads(prior)
            count, used = c.execute(sa.select(sa.func.count(), sa.func.coalesce(sa.func.sum(jobs.c.stored_bytes), 0)).where(jobs.c.tenant_id == tenant)).one()
            if count >= max_jobs or used + job.get('stored_bytes',0) > max_bytes:
                raise ValueError('Customer job/storage quota reached. Delete job files or ask the admin.')
            self.upsert(c, jobs,""",1)
t=t.replace("'data': canonical(job), 'created': job['created']}, ['tenant_id', 'request_id']", "'data': canonical(job), 'created': job['created'], 'stored_bytes': job.get('stored_bytes',0)}, ['tenant_id', 'request_id']",1)
t=t.replace(".values(data=canonical(job)))", ".values(data=canonical(job), stored_bytes=job.get('stored_bytes',0)))",1)
extra='''
    def usage(self, tenant):
        with self.engine.connect() as c:
            count, used = c.execute(sa.select(sa.func.count(), sa.func.coalesce(sa.func.sum(jobs.c.stored_bytes),0)).where(jobs.c.tenant_id == tenant)).one()
            return int(count), int(used)

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
'''
if '    def lease(self,' not in t:t+=extra
p.write_text(t)
p=ROOT/'sheetqms/online.py'
t=p.read_text().replace('import uuid\n','import uuid\nfrom functools import wraps\n',1)
t=t.replace("        existing = store.job_list(tenant)\n        if len(existing) >= limit.max_jobs_per_customer:","        count, usage = store.usage(tenant)\n        if count >= limit.max_jobs_per_customer:",1)
t=t.replace("        usage = sum(j.get('stored_bytes', 0) for j in existing)\n",'')
t=t.replace("            saved = store.create_job(tenant, request_id, job)","""            try:
                saved = store.create_job(tenant, request_id, job, limit.max_jobs_per_customer, limit.max_storage_mib_per_customer * 1024 * 1024)
            except Exception:
                for file in originals:
                    blobs.delete(file['object_key'])
                raise""",1)
t=t.replace("                blobs.put(key, output.read_bytes())\n                job['output_object'] = key", """                data = output.read_bytes()
                _, stored = store.usage(tenant)
                old_size = job.get('output_bytes',0)
                if stored - old_size + len(data) > settings_model().max_storage_mib_per_customer * 1024 * 1024:
                    raise ValueError('Verified output exceeds this customer storage quota; delivery held.')
                blobs.put(key, data)
                job['stored_bytes'] = job.get('stored_bytes',0) - old_size + len(data)
                job['output_bytes'] = len(data)
                job['output_object'] = key""",1)
helper='''    def job_lease(function):
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

'''
if '    def job_lease(' not in t:t=t.replace('    @app.get(\'/health\')',helper+"    @app.get('/health')",1)
for name in ['run','update_plan','chat','confirm','analyse','delete']:
    t=t.replace('    def '+name+'(', '    @job_lease\n    def '+name+'(',1)
t=t.replace("            blobs.put(key, data)\n            job['profiles']['sources'].append(inspected)", """            _, used = store.usage(tenant)
            if used + len(data) > settings_model().max_storage_mib_per_customer * 1024 * 1024:
                raise HTTPException(413, 'Operator-input source would exceed the customer quota.')
            blobs.put(key, data)
            job['profiles']['sources'].append(inspected)""",1)
t=t.replace("    @app.get('/api/bootstrap')\n    def bootstrap():\n        return {'demo_mode':", "    @app.get('/api/bootstrap')\n    def bootstrap(request: Request):\n        return {'session_present': bool(store.session(token_for(request))), 'demo_mode':",1)
t=t.replace("            source_field, target_field = [part.strip(' \\\"\\\'') for part in direct.groups()]", "            source_field, target_field = [part.strip(' \\\"\\\'') for part in direct.groups()]")
# Key persistence must never silently rely on a random development encryption key.
t=t.replace("        elif body.api_key:\n            encrypted = vault.seal(body.api_key)", "        elif body.api_key:\n            if not encryption_key and not os.getenv('SHEETQMS_ENCRYPTION_KEY'):\n                raise HTTPException(422, 'Configure a stable encryption key through private environment/secret manager before saving credentials.')\n            encrypted = vault.seal(body.api_key)",1)
p.write_text(t)
print('Added cross-instance job leases, atomic quota checks and production-safe credential persistence guards.')
