import sheetqms.online as online_module
from tests.test_online import client, sign, example  # noqa: F401  (shared fixtures and helpers)


def test_meter_starts_at_200_and_lists_costs(client):
    c, _ = client
    sign(client)
    meter = c.get('/api/credits')
    assert meter.status_code == 200, meter.text
    body = meter.json()
    assert body['included'] == 200 and body['left'] == 200 and body['used'] == 0 and body['granted'] == 0
    assert body['costs'] == {'sheet_job': 3, 'helper_message': 1, 'share_email': 1}
    assert body['resets'].endswith('-01')


def test_helper_message_uses_one_credit(client):
    c, _ = client
    sign(client)
    job = example(client, request='credit-chat-001')
    r = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'What is in this sheet?', 'request_id': 'credit-chat-req-1'})
    assert r.status_code == 200, r.text
    meter = c.get('/api/credits').json()
    assert meter['used'] == 1 and meter['left'] == 199


def test_repeated_chat_request_is_not_charged_twice(client):
    c, _ = client
    sign(client)
    job = example(client, request='credit-chat-002')
    body = {'text': 'Hello there', 'request_id': 'credit-chat-req-2'}
    assert c.post(f'/api/jobs/{job["id"]}/chat', json=body).status_code == 200
    assert c.post(f'/api/jobs/{job["id"]}/chat', json=body).status_code == 200
    assert c.get('/api/credits').json()['used'] == 1


def test_out_of_credits_blocks_and_top_up_restores(client, monkeypatch):
    c, _ = client
    sign(client, role='admin')
    me = c.get('/api/auth/session').json()['user']
    monkeypatch.setattr(online_module, 'INCLUDED_CREDITS', 2)
    job = example(client, request='credit-block-001')
    assert c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'First question', 'request_id': 'credit-block-req-1'}).status_code == 200
    assert c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Second question', 'request_id': 'credit-block-req-2'}).status_code == 200
    blocked = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Third question', 'request_id': 'credit-block-req-3'})
    assert blocked.status_code == 402, blocked.text
    assert 'credits' in blocked.json()['detail'].lower()
    assert c.get('/api/credits').json()['left'] == 0
    granted = c.post(f'/api/admin/users/{me["id"]}/credits', json={'amount': 5, 'reason': 'Top-up pack'})
    assert granted.status_code == 200, granted.text
    assert granted.json()['granted'] == 5 and granted.json()['left'] == 5
    assert c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Third question', 'request_id': 'credit-block-req-4'}).status_code == 200


def test_admin_top_up_rejects_bad_amounts_and_other_workspaces(client):
    c, _ = client
    sign(client, role='admin')
    me = c.get('/api/auth/session').json()['user']
    assert c.post(f'/api/admin/users/{me["id"]}/credits', json={'amount': 0}).status_code == 422
    assert c.post(f'/api/admin/users/{me["id"]}/credits', json={'amount': True}).status_code == 422
    assert c.post(f'/api/admin/users/{me["id"]}/credits', json={'amount': 10001}).status_code == 422
    assert c.post('/api/admin/users/not-a-user/credits', json={'amount': 5}).status_code == 404


def test_operator_cannot_grant_credits(client):
    c, _ = client
    sign(client)
    me = c.get('/api/auth/session').json()['user']
    assert c.post(f'/api/admin/users/{me["id"]}/credits', json={'amount': 5}).status_code in (401, 403)
