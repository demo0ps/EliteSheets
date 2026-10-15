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
    op = id_for(client, 'operator@demo.sheetqms')
    admin = id_for(client, 'admin@demo.sheetqms')
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


def test_spending_cap_stops_charges_and_can_be_lifted(client):
    c, _ = client
    sign(client)
    job = example(client, request='cap-job-001')
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.sheetqms')
    assert c.put(f'/api/admin/credits/{op}/cap', json={'spend_cap': 2, 'reason': 'Trial budget'}).status_code == 200
    sign(client)
    assert chat(client, job, 'cap-req-1').status_code == 200
    assert chat(client, job, 'cap-req-2').status_code == 200
    blocked = chat(client, job, 'cap-req-3')
    assert blocked.status_code == 402 and 'spending cap' in blocked.json()['detail']
    sign(client, role='admin')
    assert c.put(f'/api/admin/credits/{op}/cap', json={'spend_cap': None, 'reason': 'Trial over'}).status_code == 200
    sign(client)
    assert chat(client, job, 'cap-req-4').status_code == 200


def test_cap_validation(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.sheetqms')
    assert c.put(f'/api/admin/credits/{op}/cap', json={'spend_cap': -1, 'reason': 'Bad value'}).status_code == 422
    assert c.put(f'/api/admin/credits/{op}/cap', json={'spend_cap': 10, 'reason': 'ok'}).status_code == 422


def test_admin_undo_reverses_one_charge_once(client):
    c, _ = client
    sign(client)
    job = example(client, request='undo-job-001')
    assert chat(client, job, 'undo-req-1').status_code == 200
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.sheetqms')
    history = c.get(f'/api/admin/credits/{op}/history').json()
    before = history['view']['left']
    charge = next(r for r in history['ledger'] if r['delta'] < 0)
    assert charge['undone'] is False

    undone = c.post(f'/api/admin/credits/{op}/undo/{charge["id"]}', json={'reason': 'Duplicate charge'})
    assert undone.status_code == 200 and undone.json()['left'] == before + 1
    assert c.post(f'/api/admin/credits/{op}/undo/{charge["id"]}', json={'reason': 'Duplicate charge'}).status_code == 409

    after = c.get(f'/api/admin/credits/{op}/history').json()
    assert next(r for r in after['ledger'] if r['id'] == charge['id'])['undone'] is True
    assert any(r['reason'].startswith('Undo: ') for r in after['ledger'])


def test_undo_only_applies_to_charges_and_needs_a_reason(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.sheetqms')
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


def test_low_balance_email_is_sent_once(client, monkeypatch):
    c, _ = client
    sent = []

    class FakeSMTP:
        def __init__(self, host, port, timeout=None):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

        def starttls(self):
            pass

        def login(self, user, password):
            pass

        def send_message(self, msg):
            sent.append((msg['To'], msg['Subject']))

    monkeypatch.setattr(online_module.smtplib, 'SMTP', FakeSMTP)
    monkeypatch.setenv('SHEETQMS_SMTP_HOST', 'smtp.test.invalid')
    monkeypatch.setenv('SHEETQMS_SMTP_FROM', 'noreply@test.invalid')
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.sheetqms')
    assert c.put(f'/api/admin/credits/{op}/allowance', json={'included': 3, 'reason': 'Small trial'}).status_code == 200
    sign(client)
    job = example(client, request='email-job-001')
    assert chat(client, job, 'email-req-1').status_code == 200
    assert chat(client, job, 'email-req-2').status_code == 200
    assert sent == []
    assert chat(client, job, 'email-req-3').status_code == 200  # 0 left: alert goes out
    assert sent == [('operator@demo.sheetqms', 'Your EduSheetManager credits are running low')]
    assert chat(client, job, 'email-req-4').status_code == 402
    assert len(sent) == 1
