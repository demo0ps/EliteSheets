from tests.test_online import client, sign, example  # noqa: F401  (shared fixtures and helpers)


def me_id(client):
    c, _ = client
    return c.get('/api/auth/session').json()['user']['id']


def test_meter_starts_at_200_and_lists_costs(client):
    c, _ = client
    sign(client)
    body = c.get('/api/credits').json()
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


def test_out_of_credits_blocks_and_admin_top_up_restores(client):
    c, _ = client
    sign(client, role='admin')
    me = me_id(client)
    assert c.put(f'/api/admin/credits/{me}/allowance', json={'included': 2, 'reason': 'Test allowance'}).status_code == 200
    job = example(client, request='credit-block-001')
    assert c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'First question', 'request_id': 'credit-block-req-1'}).status_code == 200
    assert c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Second question', 'request_id': 'credit-block-req-2'}).status_code == 200
    blocked = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Third question', 'request_id': 'credit-block-req-3'})
    assert blocked.status_code == 402, blocked.text
    assert 'credits' in blocked.json()['detail'].lower()
    assert c.get('/api/credits').json()['left'] == 0
    granted = c.post(f'/api/admin/credits/{me}/grant', json={'amount': 5, 'reason': 'Top-up pack'})
    assert granted.status_code == 200, granted.text
    assert granted.json()['granted'] == 5 and granted.json()['left'] == 5
    assert c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Third question', 'request_id': 'credit-block-req-4'}).status_code == 200


def test_grant_validation_and_unknown_user(client):
    c, _ = client
    sign(client, role='admin')
    me = me_id(client)
    assert c.post(f'/api/admin/credits/{me}/grant', json={'amount': 0, 'reason': 'Valid reason'}).status_code == 422
    assert c.post(f'/api/admin/credits/{me}/grant', json={'amount': True, 'reason': 'Valid reason'}).status_code == 422
    assert c.post(f'/api/admin/credits/{me}/grant', json={'amount': 10001, 'reason': 'Valid reason'}).status_code == 422
    assert c.post(f'/api/admin/credits/{me}/grant', json={'amount': 5}).status_code == 422
    assert c.post(f'/api/admin/credits/{me}/grant', json={'amount': 5, 'reason': 'ok'}).status_code == 422
    assert c.post('/api/admin/credits/not-a-user/grant', json={'amount': 5, 'reason': 'Valid reason'}).status_code == 404


def test_operator_cannot_use_admin_credit_endpoints(client):
    c, _ = client
    sign(client)
    me = me_id(client)
    assert c.post(f'/api/admin/credits/{me}/grant', json={'amount': 5, 'reason': 'Valid reason'}).status_code in (401, 403)
    assert c.get('/api/admin/credits').status_code in (401, 403)
    assert c.put('/api/admin/credit-settings', json={'included': 300, 'monthly_fee': 79}).status_code in (401, 403)


def test_admin_list_flags_and_history(client):
    c, _ = client
    sign(client, role='admin')
    me = me_id(client)
    listing = c.get('/api/admin/credits').json()
    assert listing['settings'] == {'included': 200, 'monthly_fee': 79}
    mine = [i for i in listing['items'] if i['id'] == me]
    assert mine and mine[0]['status'] == 'ok' and mine[0]['left'] == 200
    c.put(f'/api/admin/credits/{me}/allowance', json={'included': 2, 'reason': 'Test allowance'})
    job = example(client, request='credit-flag-001')
    c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'One', 'request_id': 'credit-flag-req-1'})
    c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Two', 'request_id': 'credit-flag-req-2'})
    flagged = c.get('/api/admin/credits?flag=flagged').json()['items']
    assert any(i['id'] == me and i['status'] == 'zero' for i in flagged)
    assert c.get('/api/admin/credits?flag=zero').json()['items'][0]['id'] == me
    assert c.get('/api/admin/credits?q=no-such-person-xyz').json()['items'] == []
    history = c.get(f'/api/admin/credits/{me}/history').json()
    assert history['view']['left'] == 0 and len(history['ledger']) == 2
    assert {a['action'] for a in history['audit']} == {'allowance'}
    assert history['audit'][0]['detail']['to'] == 2


def test_allowance_change_moves_the_meter(client):
    c, _ = client
    sign(client, role='admin')
    me = me_id(client)
    response = c.put(f'/api/admin/credits/{me}/allowance', json={'included': 400, 'reason': 'Power user'})
    assert response.status_code == 200 and response.json()['included'] == 400
    assert c.get('/api/credits').json()['left'] == 400
    assert c.put(f'/api/admin/credits/{me}/allowance', json={'included': 5001, 'reason': 'Too big'}).status_code == 422
    assert c.put(f'/api/admin/credits/{me}/allowance', json={'included': 100}).status_code == 422


def test_platform_settings_change_default_allowance(client):
    c, _ = client
    sign(client, role='admin')
    saved = c.put('/api/admin/credit-settings', json={'included': 250, 'monthly_fee': 89})
    assert saved.status_code == 200, saved.text
    assert saved.json() == {'included': 250, 'monthly_fee': 89}
    assert c.get('/api/credits').json()['included'] == 250
    assert c.put('/api/admin/credit-settings', json={'included': -1, 'monthly_fee': 79}).status_code == 422
    assert c.put('/api/admin/credit-settings', json={'included': 200, 'monthly_fee': 'R79'}).status_code == 422
    c.put('/api/admin/credit-settings', json={'included': 200, 'monthly_fee': 79})
