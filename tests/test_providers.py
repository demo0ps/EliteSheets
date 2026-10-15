from tests.test_online import client, sign  # noqa: F401  (shared fixtures and helpers)
from tests.test_billing import id_for


def add(client, name='Paystack', ref='MERCH-001', account='0123456789', default=False):
    c, _ = client
    return c.post('/api/admin/payment-providers', json={'name': name, 'merchant_ref': ref, 'settlement_account': account, 'make_default': default})


def test_first_provider_becomes_default_and_only_last_four_digits_are_kept(client):
    c, _ = client
    sign(client, role='admin')
    created = add(client, account='0123 4567 8901')
    assert created.status_code == 200, created.text
    body = created.json()
    assert body['is_default'] is True and body['settlement_last4'] == '8901' and body['active'] is True
    listing = c.get('/api/admin/payment-providers').json()['items']
    assert len(listing) == 1 and '0123456789' not in str(listing) and listing[0]['settlement_last4'] == '8901'


def test_making_another_provider_default_moves_the_default(client):
    c, _ = client
    sign(client, role='admin')
    first = add(client, name='Paystack', ref='MERCH-001').json()
    second = add(client, name='PayFast', ref='MERCH-002', default=True).json()
    assert second['is_default'] is True
    assert c.put(f'/api/admin/payment-providers/{first["id"]}/default').status_code == 200
    items = {i['name']: i for i in c.get('/api/admin/payment-providers').json()['items']}
    assert items['Paystack']['is_default'] is True and items['PayFast']['is_default'] is False


def test_payments_go_to_the_chosen_or_default_provider(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.elitesheets')
    default = add(client, name='Paystack', ref='MERCH-001').json()
    other = add(client, name='Yoco', ref='MERCH-003').json()
    r1 = c.post(f'/api/admin/billing/{op}/payments', json={'kind': 'subscription', 'amount_rand': 79, 'reference': 'PROV-REF-1'})
    assert r1.status_code == 200 and r1.json()['provider'] == 'Paystack'
    r2 = c.post(f'/api/admin/billing/{op}/payments', json={'kind': 'subscription', 'amount_rand': 79, 'reference': 'PROV-REF-2', 'provider_id': other['id']})
    assert r2.status_code == 200 and r2.json()['provider'] == 'Yoco'
    billing = c.get(f'/api/admin/billing/{op}').json()
    assert {p['name'] for p in billing['providers']} == {'Paystack', 'Yoco'}
    assert c.put(f'/api/admin/payment-providers/{other["id"]}/deactivate').status_code == 200
    r3 = c.post(f'/api/admin/billing/{op}/payments', json={'kind': 'subscription', 'amount_rand': 79, 'reference': 'PROV-REF-3', 'provider_id': other['id']})
    assert r3.status_code == 422
    assert default['is_default'] is True


def test_no_provider_means_payments_are_refused(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.elitesheets')
    r = c.post(f'/api/admin/billing/{op}/payments', json={'kind': 'subscription', 'amount_rand': 79, 'reference': 'NO-PROV-1'})
    assert r.status_code == 422 and 'payment provider' in r.json()['detail']


def test_deactivating_the_default_leaves_no_default(client):
    c, _ = client
    sign(client, role='admin')
    only = add(client).json()
    assert c.put(f'/api/admin/payment-providers/{only["id"]}/deactivate').status_code == 200
    listing = c.get('/api/admin/payment-providers').json()['items']
    assert listing[0]['active'] is False and listing[0]['is_default'] is False


def test_provider_validation_and_admin_only(client):
    c, _ = client
    sign(client, role='admin')
    assert add(client, name='P').status_code == 422
    assert add(client, ref='ab').status_code == 422
    assert add(client, account='12-34').status_code == 422
    assert c.put('/api/admin/payment-providers/nope/default').status_code == 404
    sign(client)
    assert c.get('/api/admin/payment-providers').status_code in (401, 403)
    assert add(client).status_code in (401, 403)
