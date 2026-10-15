import pytest

from sheetqms import online as online_module
from sheetqms.online import credit_month
from tests.test_online import client, sign, example  # noqa: F401  (shared fixtures and helpers)


def id_for(client, email):
    c, _ = client
    items = c.get('/api/admin/credits').json()['items']
    return next(i['id'] for i in items if i['email'] == email)


def chat(client, job, request_id):
    c, _ = client
    return c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Question', 'request_id': request_id})


def test_paused_user_is_blocked_until_restored(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.elitesheets')
    admin = id_for(client, 'admin@demo.elitesheets')
    assert c.put(f'/api/admin/credits/{op}/pause', json={'paused': True, 'reason': 'x'}).status_code == 422
    assert c.put(f'/api/admin/credits/{admin}/pause', json={'paused': True, 'reason': 'Test pause'}).status_code == 422
    paused = c.put(f'/api/admin/credits/{op}/pause', json={'paused': True, 'reason': 'Billing dispute'})
    assert paused.status_code == 200 and paused.json()['paused'] is True

    sign(client)
    blocked = c.get('/api/credits')
    assert blocked.status_code == 403 and 'paused' in blocked.json()['detail']

    sign(client, role='admin')
    assert c.put(f'/api/admin/credits/{op}/pause', json={'paused': False}).status_code == 200
    sign(client)
    assert c.get('/api/credits').status_code == 200




def test_cap_validation(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.elitesheets')
    assert c.put(f'/api/admin/credits/{op}/cap', json={'spend_cap': -1, 'reason': 'Bad value'}).status_code == 422
    assert c.put(f'/api/admin/credits/{op}/cap', json={'spend_cap': 10, 'reason': 'ok'}).status_code == 422




def test_undo_only_applies_to_charges_and_needs_a_reason(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.elitesheets')
    c.post(f'/api/admin/credits/{op}/grant', json={'amount': 5, 'reason': 'Top-up pack'})
    grant = next(r for r in c.get(f'/api/admin/credits/{op}/history').json()['ledger'] if r['delta'] > 0)
    assert c.post(f'/api/admin/credits/{op}/undo/{grant["id"]}', json={'reason': 'Wrong sign'}).status_code == 404
    assert c.post(f'/api/admin/credits/{op}/undo/{grant["id"]}', json={'reason': 'x'}).status_code == 422


def test_refund_returns_credits_to_the_balance(client):
    c, app = client
    sign(client)
    uid = c.get('/api/auth/session').json()['user']['id']
    before = c.get('/api/credits').json()['left']
    app.state.store.credit_adjust(uid, credit_month(), -3, 'sheet_job')
    assert c.get('/api/credits').json()['left'] == before - 3
    app.state.store.credit_adjust(uid, credit_month(), 3, 'Refund: sheet job failed')
    assert c.get('/api/credits').json()['left'] == before


