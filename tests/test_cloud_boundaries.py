from concurrent.futures import ThreadPoolExecutor
import pytest
from cryptography.fernet import Fernet
from sheetqms.cloud_store import CloudStore
from sheetqms.security import password_hash
from sheetqms.blobs import LocalBlobs, materialise
from sheetqms.store import now


def store_at(tmp_path):
    store=CloudStore('sqlite:///'+str(tmp_path/'state.db'))
    store.bootstrap_user('workspace','Workspace','x@example.test','Test','operator',password_hash('private-test-pass'))
    return store


def job_value(identifier='first'):
    return {'id':identifier,'trace_id':'trace','created':now(),'state':'MAPPED','stored_bytes':60}


def test_atomic_customer_storage_quota_not_recent_page_count(tmp_path):
    store=store_at(tmp_path)
    store.create_job('workspace','first-request',job_value(),max_jobs=50,max_bytes=100)
    with pytest.raises(ValueError,match='quota'):
        store.create_job('workspace','second-request',job_value('second'),max_jobs=50,max_bytes=100)
    assert store.usage('workspace')==(1,60)


def test_lease_rejects_concurrent_mutation_and_releases(tmp_path):
    store=store_at(tmp_path)
    store.create_job('workspace','first-request',job_value())
    with store.lease('workspace','first'):
        with pytest.raises(ValueError,match='processing'):
            with store.lease('workspace','first'):
                pass
    with store.lease('workspace','first'):
        pass


def test_two_stores_share_durable_lease(tmp_path):
    one=store_at(tmp_path)
    two=CloudStore('sqlite:///'+str(tmp_path/'state.db'))
    one.create_job('workspace','first-request',job_value())
    with one.lease('workspace','first'):
        with pytest.raises(ValueError):
            with two.lease('workspace','first'):
                pass


def test_duplicate_creation_cannot_cross_customer_or_duplicate_state(tmp_path):
    store=store_at(tmp_path)
    one=store.create_job('workspace','same-request',job_value())
    two=store.create_job('workspace','same-request',job_value('other'))
    assert one['id']==two['id']
    assert store.job('different-workspace','first') is None
    assert store.usage('workspace')[0]==1


def test_local_blob_rejects_path_traversal_and_isolated_hydration(tmp_path):
    blobs=LocalBlobs(tmp_path/'objects')
    with pytest.raises(ValueError):
        blobs.put('../escape',b'not allowed')
    blobs.put('customers/workspace/input.csv',b'a,b\n1,2\n')
    job={'files':{'template':{'id':'template','extension':'.csv','object_key':'customers/workspace/input.csv'},'sources':[]}}
    with materialise(job,blobs) as (copy,path):
        first=copy['files']['template']['path']
        assert first not in job['files']['template']
    from pathlib import Path
    assert not Path(first).exists()


def test_rate_limits_are_durable_and_enforced(tmp_path):
    store=store_at(tmp_path)
    assert store.take_rate('login-key',maximum=2)
    assert store.take_rate('login-key',maximum=2)
    assert not store.take_rate('login-key',maximum=2)


def test_two_concurrent_reservations_do_not_exceed_global_budget(tmp_path):
    store=store_at(tmp_path)
    other=CloudStore('sqlite:///'+str(tmp_path/'state.db'))
    def reserve(args):
        instance,name=args
        try:
            instance.reserve(name,100,150)
            return True
        except ValueError:
            return False
    with ThreadPoolExecutor(max_workers=2) as pool:
        results=list(pool.map(reserve,[(store,'first'),(other,'second')]))
    assert sum(results)==1
    assert store.spent()==100
