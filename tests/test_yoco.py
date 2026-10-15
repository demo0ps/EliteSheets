import base64
import os
import hashlib
import hmac
import json
import time

import pytest
from cryptography.fernet import Fernet
from fastapi.testclient import TestClient

from sheetqms import yoco
from sheetqms.online import create_online_app
from sheetqms.security import Vault
from tests.test_online import sign
from tests.test_billing import id_for

SECRET = 'sk_test_' + 'A' * 24
PUBLIC = 'pk_test_' + 'B' * 24
WEBHOOK = 'whsec_' + base64.b64encode(b'0123456789abcdef0123456789abcdef').decode()


@pytest.fixture
def ycl(tmp_path, monkeypatch):
    monkeypatch.setenv('SHEETQMS_ENCRYPTION_KEY', Fernet.generate_key().decode())
    app = create_online_app(tmp_path / 'preview', demo=True)
    with TestClient(app) as c:
        yield c, app


@pytest.fixture
def fake_yoco(monkeypatch):
    state = {'created': [], 'fetched': [], 'fail_create': False, 'fail_fetch': False, 'remote_status': 'completed'}

    def create(secret, amount_cents, currency, success_url, cancel_url, failure_url, metadata, idempotency_key, transport=None):
        assert secret.startswith('sk_test_')  # server-side key only
        if state['fail_create']:
            raise yoco.YocoError('Yoco did not accept the payment request (500).')
        state['created'].append({'amount': amount_cents, 'currency': currency, 'idem': idempotency_key, 'success': success_url, 'metadata': metadata})
        return {'id': 'yco-' + idempotency_key, 'redirectUrl': 'https://pay.yoco.example/c/' + idempotency_key}

    def fetch(secret, checkout_id, transport=None):
        state['fetched'].append(checkout_id)
        if state['fail_fetch']:
            raise yoco.YocoError('Could not confirm the payment with Yoco.')
        amount = state['created'][-1]['amount'] if state['created'] else 7900
        return {'id': checkout_id, 'status': state['remote_status'], 'amountInCents': amount}

    monkeypatch.setattr(yoco, 'create_checkout', create)
    monkeypatch.setattr(yoco, 'fetch_checkout', fetch)
    return state


def signed_headers(secret, body, msg_id='msg_1', ts=None):
    ts = str(int(time.time()) if ts is None else ts)
    key = base64.b64decode(secret[len('whsec_'):])
    sig = base64.b64encode(hmac.new(key, f'{msg_id}.{ts}.'.encode() + body, hashlib.sha256).digest()).decode()
    return {'webhook-id': msg_id, 'webhook-timestamp': ts, 'webhook-signature': 'v1,' + sig, 'content-type': 'application/json'}


def yoco_provider(c, default=True):
    r = c.post('/api/admin/payment-providers', json={'name': 'Yoco', 'merchant_ref': 'YOCO-MERCH-1', 'settlement_account': '0123456789', 'make_default': default, 'kind': 'yoco'})
    assert r.status_code == 200, r.text
    return r.json()['id']


def save_keys(c, pid, **overrides):
    body = {'mode': 'test', 'secret_key': SECRET, 'webhook_secret': WEBHOOK, 'public_key': PUBLIC}
    body.update(overrides)
    return c.put(f'/api/admin/payment-providers/{pid}/keys', json=body)


def webhook(c, pid, checkout_id, secret=WEBHOOK, ts=None, msg_id='msg_1', event_type='payment.succeeded'):
    body = json.dumps({'type': event_type, 'data': {'id': 'yco-' + checkout_id}}).encode()
    return c.post(f'/api/webhooks/yoco/{pid}', content=body, headers=signed_headers(secret, body, msg_id=msg_id, ts=ts))


def test_keys_are_saved_sealed_and_never_returned(ycl):
    c, app = ycl
    sign(ycl, role='admin')
    pid = yoco_provider(c)
    r = save_keys(c, pid)
    assert r.status_code == 200, r.text
    text = r.text + c.get('/api/admin/payment-providers').text
    assert SECRET not in text and WEBHOOK not in text
    assert r.json()['secret_key_last4'] == 'AAAA' and r.json()['webhook_configured'] is True
    row = app.state.store.provider_keys(pid)
    assert SECRET not in row['secret_sealed'] and WEBHOOK not in row['webhook_sealed']
    assert Vault(os.environ['SHEETQMS_ENCRYPTION_KEY']).open(row['secret_sealed']) == SECRET
    audit = json.dumps(app.state.store.audit_list(pid))
    assert SECRET not in audit and WEBHOOK not in audit


def test_key_format_and_mode_are_enforced(ycl):
    c, _ = ycl
    sign(ycl, role='admin')
    pid = yoco_provider(c)
    assert save_keys(c, pid, secret_key='sk_live_' + 'A' * 24).status_code == 422          # live key in test mode
    assert save_keys(c, pid, secret_key='sk_test_short').status_code == 422
    assert save_keys(c, pid, webhook_secret='not-a-secret').status_code == 422
    assert save_keys(c, pid, public_key='pk_live_' + 'B' * 24).status_code == 422
    assert save_keys(c, pid, mode='sandbox').status_code == 422
    assert save_keys(c, pid, secret_key='', webhook_secret='', public_key='').status_code == 422
    assert save_keys(c, pid, mode='live', secret_key='').status_code == 422               # switching mode needs a new key


def test_keys_only_for_online_providers_and_admin_only(ycl):
    c, _ = ycl
    sign(ycl, role='admin')
    manual = c.post('/api/admin/payment-providers', json={'name': 'Bank EFT', 'merchant_ref': 'EFT-001', 'settlement_account': '0123456789'}).json()['id']
    assert save_keys(c, manual).status_code == 422
    pid = yoco_provider(c)
    sign(ycl)
    assert save_keys(c, pid).status_code in (401, 403)
    assert c.get('/api/admin/payment-providers').status_code in (401, 403)


def test_keys_refused_without_stable_encryption_key(tmp_path, monkeypatch):
    monkeypatch.delenv('SHEETQMS_ENCRYPTION_KEY', raising=False)
    app = create_online_app(tmp_path / 'preview2', demo=True)
    with TestClient(app) as c:
        sign((c, app), role='admin')
        pid = c.post('/api/admin/payment-providers', json={'name': 'Yoco', 'merchant_ref': 'YOCO-MERCH-2', 'settlement_account': '0123456789', 'kind': 'yoco'}).json()['id']
        r = save_keys(c, pid)
        assert r.status_code == 422 and 'encryption key' in r.json()['detail']


def test_signature_check_accepts_only_genuine_recent_deliveries():
    body = b'{"type":"payment.succeeded"}'
    now = int(time.time())
    yoco.verify_webhook(WEBHOOK, signed_headers(WEBHOOK, body, ts=now), body, now=now)
    with pytest.raises(yoco.WebhookError):
        yoco.verify_webhook(WEBHOOK, signed_headers(WEBHOOK, b'{"type":"x"}', ts=now), body, now=now)        # tampered body
    with pytest.raises(yoco.WebhookError):
        yoco.verify_webhook(WEBHOOK, signed_headers(WEBHOOK, body, ts=now - 3600), body, now=now)            # stale replay
    other = 'whsec_' + base64.b64encode(b'ffffffffffffffffffffffffffffffff').decode()
    with pytest.raises(yoco.WebhookError):
        yoco.verify_webhook(WEBHOOK, signed_headers(other, body, ts=now), body, now=now)                     # wrong secret
    with pytest.raises(yoco.WebhookError):
        yoco.verify_webhook(WEBHOOK, {}, body, now=now)                                                       # no headers


def test_full_subscription_payment_is_recorded_once(ycl, fake_yoco):
    c, _ = ycl
    sign(ycl, role='admin')
    pid = yoco_provider(c)
    assert save_keys(c, pid).status_code == 200
    op = id_for(ycl, 'operator@demo.elitesheets')
    sign(ycl)
    me = c.get('/api/billing/me').json()
    assert me['can_pay'] is True and me['provider'] == 'Yoco' and me['fee'] == 79
    r = c.post('/api/billing/checkout')
    assert r.status_code == 200, r.text
    checkout = r.json()
    assert checkout['redirect_url'].startswith('https://pay.yoco.example/')
    created = fake_yoco['created'][-1]
    assert created['amount'] == 7900 and created['currency'] == 'ZAR'          # amount set by server
    assert created['success'].endswith('/?billing=success')
    sign(ycl, role='admin')
    assert c.get(f'/api/admin/billing/{op}').json()['payments'] == []
    sign(ycl)
    assert webhook(c, pid, created['idem']).json() == {'recorded': True}
    assert webhook(c, pid, created['idem'], msg_id='msg_2').json() == {'already_recorded': True}   # repeat does nothing
    sign(ycl, role='admin')
    payments = [p for p in c.get(f'/api/admin/billing/{op}').json()['payments'] if p['reference'] == checkout['reference']]
    assert len(payments) == 1 and payments[0]['amount_cents'] == 7900 and payments[0]['vat_cents'] == 1030


def test_unsigned_or_unconfirmed_events_record_nothing(ycl, fake_yoco):
    c, _ = ycl
    sign(ycl, role='admin')
    pid = yoco_provider(c)
    save_keys(c, pid)
    op = id_for(ycl, 'operator@demo.elitesheets')
    sign(ycl)
    checkout = c.post('/api/billing/checkout').json()
    cid = fake_yoco['created'][-1]['idem']
    assert webhook(c, pid, cid, secret='whsec_' + base64.b64encode(b'x' * 32).decode()).status_code == 400
    fake_yoco['remote_status'] = 'pending'
    assert webhook(c, pid, cid, msg_id='msg_p').json() == {'ignored': True}
    fake_yoco['remote_status'] = 'completed'
    fake_yoco['fail_fetch'] = True
    assert webhook(c, pid, cid, msg_id='msg_f').status_code == 502
    fake_yoco['fail_fetch'] = False
    assert webhook(c, pid, 'unknown-checkout', msg_id='msg_u').json() == {'ignored': True}
    assert webhook(c, pid, cid, event_type='refund.succeeded', msg_id='msg_r').json() == {'ignored': True}
    sign(ycl, role='admin')
    assert [p for p in c.get(f'/api/admin/billing/{op}').json()['payments'] if p['reference'] == checkout['reference']] == []


def test_checkout_needs_a_configured_online_provider(ycl, fake_yoco):
    c, _ = ycl
    sign(ycl)
    assert c.get('/api/billing/me').json()['can_pay'] is False
    assert c.post('/api/billing/checkout').status_code == 422
    sign(ycl, role='admin')
    pid = yoco_provider(c)                       # no keys yet
    sign(ycl)
    assert c.post('/api/billing/checkout').status_code == 422
    assert fake_yoco['created'] == []


def test_failed_checkout_is_marked_and_not_payable(ycl, fake_yoco):
    c, app = ycl
    sign(ycl, role='admin')
    pid = yoco_provider(c)
    save_keys(c, pid)
    op = id_for(ycl, 'operator@demo.elitesheets')
    sign(ycl)
    fake_yoco['fail_create'] = True
    r = c.post('/api/billing/checkout')
    assert r.status_code == 502 and 'sk_test' not in r.text
    assert app.state.store.pending_checkout_count(op) == 0


def test_secrets_are_not_in_the_browser_bundle():
    from pathlib import Path
    root = Path(__file__).resolve().parents[1]
    for name in ['web/app.js', 'web/app.ts', 'web/styles.css', 'index.html']:
        text = (root / name).read_text()
        assert 'sk_test_' not in text and 'sk_live_' not in text and 'whsec_' not in text, name
