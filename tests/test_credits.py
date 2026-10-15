from tests.test_online import client, sign, example  # noqa: F401  (shared fixtures and helpers)


def me_id(client):
    c, _ = client
    return c.get('/api/auth/session').json()['user']['id']










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


def test_meter_starts_at_200_and_lists_costs(client):
    c, _ = client
    sign(client)
    body = c.get('/api/credits').json()
    assert body['included'] == 200 and body['left'] == 200 and body['used'] == 0 and body['granted'] == 0
    assert body['costs'] == {'sheet_job': 3}
    assert body['resets'].endswith('-01')
