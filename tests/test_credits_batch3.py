import csv
import io

from sheetqms.online import csv_cell
from tests.test_online import client, sign, example  # noqa: F401  (shared fixtures and helpers)


def id_for(client, email):
    c, _ = client
    items = c.get('/api/admin/credits').json()['items']
    return next(i['id'] for i in items if i['email'] == email)


def test_margin_estimates_cost_and_revenue_excluding_vat(client):
    c, _ = client
    sign(client)
    job = example(client, request='margin-job-001')
    assert c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Q', 'request_id': 'margin-req-1'}).status_code == 200
    sign(client, role='admin')
    margin = c.get('/api/admin/margin').json()
    assert margin['users'] == 2  # operator and the second demo customer; the admin is not billed
    assert margin['fee'] == 79
    assert margin['credits_spent'] == 1
    assert margin['estimated_cost'] == 0.01
    assert margin['revenue_excl_vat'] == round(79 * 2 / 1.15, 2)
    assert margin['margin_pct'] is not None and margin['margin_pct'] > 99
    assert 'Fixed platform costs' in margin['assumption']


def test_margin_is_admin_only(client):
    c, _ = client
    sign(client)
    assert c.get('/api/admin/margin').status_code in (401, 403)
    assert c.get('/api/admin/exports/balances').status_code in (401, 403)
    assert c.get('/api/admin/exports/ledger').status_code in (401, 403)


def test_bulk_grant_to_selected_users_only(client):
    c, _ = client
    sign(client, role='admin')
    op = id_for(client, 'operator@demo.sheetqms')
    other = id_for(client, 'other@demo.sheetqms')
    assert c.post('/api/admin/credits/grant-bulk', json={'user_ids': [], 'amount': 5, 'reason': 'Term bonus'}).status_code == 422
    assert c.post('/api/admin/credits/grant-bulk', json={'user_ids': [op], 'amount': 0, 'reason': 'Term bonus'}).status_code == 422
    assert c.post('/api/admin/credits/grant-bulk', json={'user_ids': [op], 'amount': 5, 'reason': 'x'}).status_code == 422
    unknown = c.post('/api/admin/credits/grant-bulk', json={'user_ids': [op, 'no-such-user'], 'amount': 5, 'reason': 'Term bonus'})
    assert unknown.status_code == 404
    history = c.get(f'/api/admin/credits/{op}/history').json()
    assert not any(r['reason'].startswith('Admin grant') for r in history['ledger'])

    ok = c.post('/api/admin/credits/grant-bulk', json={'user_ids': [op, op, other], 'amount': 5, 'reason': 'Term bonus'})
    assert ok.status_code == 200 and ok.json() == {'granted_to': 2, 'amount': 5}
    for uid in (op, other):
        assert any(r['reason'] == 'Admin grant: Term bonus' for r in c.get(f'/api/admin/credits/{uid}/history').json()['ledger'])


def test_balances_export_has_headers_and_rows(client):
    c, _ = client
    sign(client, role='admin')
    body = c.get('/api/admin/exports/balances').json()
    assert body['filename'].startswith('credit-balances-') and body['filename'].endswith('.csv')
    text = body['csv'].lstrip('\ufeff')
    rows = list(csv.reader(io.StringIO(text)))
    assert rows[0] == ['Name', 'Email', 'Workspace', 'Allowance', 'Spending cap', 'Used', 'Left', 'Status']
    assert any(r[1] == 'operator@demo.sheetqms' for r in rows[1:])


def test_ledger_export_lists_charges_and_validates_month(client):
    c, _ = client
    sign(client)
    job = example(client, request='export-job-001')
    c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Q', 'request_id': 'export-req-1'})
    sign(client, role='admin')
    body = c.get('/api/admin/exports/ledger').json()
    rows = list(csv.reader(io.StringIO(body['csv'].lstrip('\ufeff'))))
    assert rows[0][:3] == ['When', 'Month', 'Name']
    assert any(r[5] == '-1' and r[6] == 'helper_message' for r in rows[1:])
    assert c.get('/api/admin/exports/ledger?month=October').status_code == 422


def test_csv_cells_are_safe_from_formula_injection():
    assert csv_cell('=HYPERLINK("x")') == "'=HYPERLINK(\"x\")"
    assert csv_cell('+1') == "'+1"
    assert csv_cell('-2') == "'-2"
    assert csv_cell('@cmd') == "'@cmd"
    assert csv_cell('Plain name') == 'Plain name'
    assert csv_cell(None) == ''
