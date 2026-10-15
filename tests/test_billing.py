from tests.test_online import client, sign, example  # noqa: F401  (shared fixtures and helpers)


def id_for(client, email):
    c, _ = client
    items = c.get('/api/admin/credits').json()['items']
    return next(i['id'] for i in items if i['email'] == email)


def add_provider(client):
    c, _ = client
    return c.post('/api/admin/payment-providers', json={'name': 'Paystack', 'merchant_ref': 'TEST-MERCHANT', 'settlement_account': '0123456789', 'make_default': True})


def set_sub(client, uid, status, grace=None, period=None):
    c, _ = client
    body = {'status': status, 'reason': 'Test change', 'period_end': period}
    if grace is not None:
        body['grace_until'] = grace
    return c.put(f'/api/admin/billing/{uid}/subscription', json=body)


def test_new_users_are_active_with_full_access(client):
    c, _ = client
    sign(client)
    meter = c.get('/api/credits').json()
    assert meter['access'] == 'full'




def test_past_due_keeps_access_during_grace_then_goes_read_only(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.elitesheets')
    assert set_sub(client, op, 'past_due', grace='2999-01-01').status_code == 200
    sign(client)
    assert c.get('/api/credits').json()['access'] == 'full'
    sign(client, role='admin')
    assert set_sub(client, op, 'past_due', grace='2000-01-01').status_code == 200
    sign(client)
    assert c.get('/api/credits').json()['access'] == 'read_only'


def test_paused_subscription_blocks_everything_until_active(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.elitesheets')
    set_sub(client, op, 'paused')
    sign(client)
    assert c.get('/api/credits').status_code == 403
    sign(client, role='admin')
    assert set_sub(client, op, 'active', period='2999-12-31').status_code == 200
    sign(client)
    assert c.get('/api/credits').json()['access'] == 'full'


def test_subscription_validation(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.elitesheets')
    admin = id_for(client, 'admin@demo.elitesheets')
    assert set_sub(client, op, 'nonsense').status_code == 422
    assert set_sub(client, op, 'past_due').status_code == 422  # grace date required
    assert set_sub(client, op, 'active', period='2026-13-40').status_code == 422
    assert c.put(f'/api/admin/billing/{op}/subscription', json={'status': 'active', 'reason': 'x'}).status_code == 422
    assert set_sub(client, admin, 'active').status_code == 422


def test_subscription_payment_splits_vat_and_is_not_repeatable(client):
    c, _ = client
    sign(client, role='admin')
    add_provider(client)
    op = id_for(client, 'operator@demo.elitesheets')
    body = {'kind': 'subscription', 'amount_rand': 79, 'reference': 'PAY-OCT-001'}
    recorded = c.post(f'/api/admin/billing/{op}/payments', json=body)
    assert recorded.status_code == 200, recorded.text
    result = recorded.json()
    assert result['vat_cents'] == 1030 and result['excl_vat_cents'] == 6870 and result['credits_added'] == 0
    assert c.post(f'/api/admin/billing/{op}/payments', json=body).status_code == 409
    billing = c.get(f'/api/admin/billing/{op}').json()
    assert billing['payments'][0]['reference'] == 'PAY-OCT-001'


def test_topup_payment_grants_credits(client):
    c, _ = client
    sign(client, role='admin')
    add_provider(client)
    op = id_for(client, 'operator@demo.elitesheets')
    before = c.get(f'/api/admin/billing/{op}').json()['included']
    r = c.post(f'/api/admin/billing/{op}/payments', json={'kind': 'topup', 'amount_rand': 20, 'credits': 200, 'reference': 'TOP-OCT-001'})
    assert r.status_code == 200 and r.json()['credits_added'] == 200
    history = c.get(f'/api/admin/credits/{op}/history').json()
    assert any(row['reason'] == 'Top-up payment: TOP-OCT-001' and row['delta'] == 200 for row in history['ledger'])
    assert before == 200


def test_payment_validation(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.elitesheets')
    assert c.post(f'/api/admin/billing/{op}/payments', json={'kind': 'subscription', 'amount_rand': 0, 'reference': 'PAY-1'}).status_code == 422
    assert c.post(f'/api/admin/billing/{op}/payments', json={'kind': 'subscription', 'amount_rand': 79, 'reference': 'ab'}).status_code == 422
    assert c.post(f'/api/admin/billing/{op}/payments', json={'kind': 'topup', 'amount_rand': 20, 'reference': 'TOP-NO-CREDITS'}).status_code == 422
    assert c.post(f'/api/admin/billing/{op}/payments', json={'kind': 'refund', 'amount_rand': 5, 'reference': 'REF-1'}).status_code == 422


def test_billing_is_admin_only(client):
    c, _ = client
    sign(client)
    assert c.get('/api/admin/billing/anyone').status_code in (401, 403)
