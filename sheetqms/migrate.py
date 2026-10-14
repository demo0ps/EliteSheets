"""Run against the owner-controlled TLS PostgreSQL URL before deploying instances."""
import os
from .cloud_store import CloudStore
url = os.environ.get('SHEETQMS_DATABASE_URL','')
if not url.startswith('postgresql'):
    raise SystemExit('An owner-controlled PostgreSQL connection is required.')
if url.startswith('postgresql://'):
    url=url.replace('postgresql://','postgresql+psycopg://',1)
CloudStore(url,migrate=True)
print('Schema and immutable audit/knowledge triggers applied. Connection secrets were not printed.')
