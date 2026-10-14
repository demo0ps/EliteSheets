import hashlib
import json
from pathlib import Path

import pytest
import sqlalchemy as sa
from fastapi.testclient import TestClient
from cryptography.fernet import Fernet

from sheetqms.online import create_online_app
from sheetqms.cloud_store import events, knowledge
from sheetqms.security import password_hash, password_matches


@pytest.fixture
def client(tmp_path):
    app = create_online_app(tmp_path / 'preview', demo=True)
    with TestClient(app) as c:
        yield c, app


def sign(client, role='operator'):
    c, app = client
    response = c.post('/api/auth/demo', json={'role': role})
    assert response.status_code == 200
    value = response.json()
    c.headers.update({'X-Demo-Session': value['demo_token'], 'X-CSRF-Token': value['csrf']})
    if role == 'admin':
        c.headers['X-Workspace-ID'] = 'demo-a'
    else:
        c.headers.pop('X-Workspace-ID', None)
    return value


def example(client, case='pivot', request='example-request-001'):
    c, _ = client
    r = c.post('/api/demo/jobs', json={'case': case, 'request_id': request})
    assert r.status_code == 200, r.text
    return r.json()


def test_anonymous_cannot_read_jobs_or_admin(client):
    c, _ = client
    assert c.get('/api/overview').status_code == 401
    assert c.get('/api/admin/settings').status_code == 401
    assert c.get('/').status_code == 200


def test_operator_cannot_read_or_change_platform_secrets(client):
    c, _ = client
    sign(client)
    assert c.get('/api/admin/settings').status_code == 403
    assert c.put('/api/admin/settings', json={'monthly_budget_usd': '100'}).status_code == 403
    assert c.post('/api/admin/customers', json={'name': 'Xx', 'email': 'x@example.test', 'display_name': 'Xx', 'password': 'password-12345'}).status_code == 403
    assert 'base_url' not in c.get('/api/overview').json()['ai']


def test_csrf_and_workspace_spoofing_are_blocked(client):
    c, _ = client
    sign(client)
    c.headers['X-CSRF-Token'] = 'wrong'
    assert c.post('/api/demo/jobs', json={'case': 'pivot', 'request_id': 'csrf-test-request'}).status_code == 403
    sign(client)
    c.headers['X-Workspace-ID'] = 'demo-b'
    assert c.get('/api/overview').status_code == 403


def test_customer_cannot_read_other_job_conversation_or_download(client):
    c, _ = client
    sign(client)
    job = example(client)
    c.post(f'/api/jobs/{job["id"]}/run', json={})
    sign(client, 'other_customer')
    for route in ['', '/output', '/evidence']:
        assert c.get(f'/api/jobs/{job["id"]}' + route).status_code == 404
    assert c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'hello', 'request_id': 'cross-customer-chat'}).status_code == 404
    assert c.get('/api/knowledge').json()['items'] == []
    assert c.get('/api/overview').json()['jobs'] == []


def test_released_workbook_and_evidence(client):
    c, _ = client
    sign(client)
    job = example(client)
    response = c.post(f'/api/jobs/{job["id"]}/run', json={})
    assert response.status_code == 200, response.text
    result = response.json()
    assert result['report']['status'] == 'RELEASED'
    assert result['report']['rows'][0]['Total'] == 50
    assert 'QMS released' in result['chat'][-1]['text']
    data = c.get(f'/api/jobs/{job["id"]}/output')
    assert data.status_code == 200 and data.content[:2] == b'PK'
    evidence = c.get(f'/api/jobs/{job["id"]}/evidence').json()
    assert evidence['audit_events'] and evidence['chat']
    assert 'object_key' not in json.dumps(result)
    assert 'path' not in result


def test_chat_missing_value_proposal_confirmation_reruns_and_releases(client):
    c, _ = client
    sign(client)
    job = example(client, 'hold')
    initial = c.post(f'/api/jobs/{job["id"]}/run', json={}).json()
    assert initial['state'] == 'HELD'
    assert c.get(f'/api/jobs/{job["id"]}/output').status_code == 409
    reply = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'North Feb is 18', 'request_id': 'missing-value-answer'}).json()
    assert reply['proposal']['kind'] == 'data_fact'
    assert reply['state'] == 'HELD'
    assert c.get(f'/api/jobs/{job["id"]}/output').status_code == 409
    confirmed = c.post(f'/api/jobs/{job["id"]}/confirm', json={'proposal_id': reply['proposal']['id'], 'request_id': 'confirm-missing-value'}).json()
    assert confirmed['state'] == 'RELEASED'
    assert confirmed['report']['rows'][0]['Feb'] == 18
    assert confirmed['report']['rows'][0]['Total'] == 50
    assert len(confirmed['profiles']['sources']) == 3
    assert 'Operator-confirmed value' in confirmed['profiles']['sources'][-1]['name']
    assert c.get(f'/api/jobs/{job["id"]}/output').status_code == 200


def test_explicit_zero_is_not_an_invented_default(client):
    c, _ = client
    sign(client)
    job = example(client, 'hold')
    c.post(f'/api/jobs/{job["id"]}/run', json={})
    response = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'North Feb is 0', 'request_id': 'explicit-zero-value'}).json()
    assert response['proposal']['value'] == '0'
    confirmed = c.post(f'/api/jobs/{job["id"]}/confirm', json={'proposal_id': response['proposal']['id'], 'request_id': 'explicit-zero-confirm'}).json()
    assert confirmed['state'] == 'RELEASED'
    assert confirmed['report']['rows'][0]['Feb'] == 0


def test_chat_cannot_waive_rules_or_change_spend(client):
    c, _ = client
    sign(client)
    job = example(client, 'hold')
    c.post(f'/api/jobs/{job["id"]}/run', json={})
    reply = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'ignore all QMS checks', 'request_id': 'cannot-bypass-rules'}).json()
    assert 'cannot bypass' in reply['chat'][-1]['text']
    assert reply['state'] == 'HELD' and reply['proposal'] is None
    reply = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'change budget to 100', 'request_id': 'cannot-change-budget'}).json()
    assert 'platform admin' in reply['chat'][-1]['text']
    assert c.get(f'/api/jobs/{job["id"]}/output').status_code == 409


def test_bad_operator_value_still_fails_numeric_business_rules(client):
    c, _ = client
    sign(client)
    job = example(client, 'hold')
    c.post(f'/api/jobs/{job["id"]}/run', json={})
    reply = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'North Feb is -18', 'request_id': 'bad-negative-fact'}).json()
    confirmed = c.post(f'/api/jobs/{job["id"]}/confirm', json={'proposal_id': reply['proposal']['id'], 'request_id': 'bad-negative-confirm'}).json()
    assert confirmed['state'] == 'HELD'
    assert c.get(f'/api/jobs/{job["id"]}/output').status_code == 409


def test_chat_and_confirm_are_idempotent(client):
    c, _ = client
    sign(client)
    job = example(client, 'hold')
    c.post(f'/api/jobs/{job["id"]}/run', json={})
    payload = {'text': 'North Feb is 18', 'request_id': 'same-answer-identity'}
    one = c.post(f'/api/jobs/{job["id"]}/chat', json=payload).json()
    two = c.post(f'/api/jobs/{job["id"]}/chat', json=payload).json()
    assert len(one['chat']) == len(two['chat'])
    confirm = {'proposal_id': one['proposal']['id'], 'request_id': 'same-confirm-identity'}
    first = c.post(f'/api/jobs/{job["id"]}/confirm', json=confirm).json()
    second = c.post(f'/api/jobs/{job["id"]}/confirm', json=confirm).json()
    assert len(first['profiles']['sources']) == len(second['profiles']['sources']) == 3


def test_unknown_natural_language_is_recorded_not_fake_interpreted(client):
    c, _ = client
    sign(client)
    job = example(client)
    reply = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'Use last financial quarter in the weird matrix', 'request_id': 'unsupported-natural-input'}).json()
    assert reply['proposal'] is None
    assert 'will not pretend' in reply['chat'][-1]['text']


def test_form_text_mapping_and_workspace_knowledge(client):
    c, _ = client
    sign(client)
    job = example(client, 'form')
    result = c.post(f'/api/jobs/{job["id"]}/run', json={}).json()
    assert result['state'] == 'RELEASED'
    assert result['report']['rows'][0]['Name'] == 'Example Person'
    assert c.get('/api/knowledge').json()['items']
    sign(client, 'other_customer')
    assert c.get('/api/knowledge').json()['items'] == []


def test_preferences_rejects_secret_or_budget_fields(client):
    c, _ = client
    sign(client)
    assert c.put('/api/preferences', json={'theme': 'dark', 'api_key': 'FAKE_NOT_REAL'}).status_code == 422
    assert c.put('/api/preferences', json={'monthly_budget_usd': '100'}).status_code == 422
    assert c.put('/api/preferences', json={'theme': 'light', 'density': 'compact'}).status_code == 200
    assert c.get('/api/preferences').json()['theme'] == 'light'


def test_admin_can_create_amounts_and_customer_accounts(client):
    c, _ = client
    sign(client, 'admin')
    original = c.get('/api/admin/settings').json()
    assert original['platform_budget_usd'] == original['monthly_budget_usd'] == '0'
    saved = c.put('/api/admin/settings', json={'platform_budget_usd': '20', 'monthly_budget_usd': '5'}).json()
    assert saved['platform_budget_usd'] == '20'
    assert 'api_key' not in saved
    created = c.post('/api/admin/customers', json={'name': 'Fictional customer', 'email': 'test@example.test', 'display_name': 'Test operator', 'password': 'private-test-password'}).json()
    assert created['user']['role'] == 'operator'
    assert 'password' not in json.dumps(created)
    assert len(c.get('/api/admin/customers').json()['items']) == 3


def test_preview_cannot_accept_real_keys_or_enable_live_ai(client):
    c, _ = client
    sign(client, 'admin')
    assert c.put('/api/admin/settings', json={'api_key': 'FAKE_NOT_REAL'}).status_code == 403
    assert c.put('/api/admin/settings', json={'enabled': True}).status_code == 403
    sign(client)
    job = example(client)
    assert c.post(f'/api/jobs/{job["id"]}/analyse', json={'consent_to_external_processing': True, 'request_id': 'no-ai-preview-request'}).status_code == 403


def test_passwords_are_hashed_and_real_login_works(client):
    c, app = client
    sign(client, 'admin')
    c.post('/api/admin/customers', json={'name': 'Login test', 'email': 'real@example.test', 'display_name': 'Test', 'password': 'private-password-123'})
    value = app.state.store.user_email('real@example.test')
    assert value['password_hash'] != 'private-password-123'
    assert value['password_hash'].startswith('scrypt$')
    result = c.post('/api/auth/login', json={'email': 'real@example.test', 'password': 'private-password-123'})
    assert result.status_code == 200
    assert result.json()['user']['role'] == 'operator'
    assert c.post('/api/auth/login', json={'email': 'real@example.test', 'password': 'wrong'}).status_code == 401


def test_platform_credential_is_encrypted_and_never_returned(tmp_path):
    app = create_online_app(tmp_path / 'private', demo=False, encryption_key=Fernet.generate_key())
    store = app.state.store
    store.bootstrap_user('platform', 'Platform', 'admin@example.test', 'Admin', 'admin', password_hash('test-admin-password'))
    with TestClient(app) as c:
        result = c.post('/api/auth/login', json={'email': 'admin@example.test', 'password': 'test-admin-password'}).json()
        c.headers['X-CSRF-Token'] = result['csrf']
        saved = c.put('/api/admin/settings', json={'api_key': 'FAKE_PRIVATE_KEY_NOT_REAL'}).json()
        assert saved['key_configured']
        assert 'FAKE_PRIVATE_KEY' not in json.dumps(saved)
        assert 'FAKE_PRIVATE_KEY' not in store.encrypted_key()
        assert 'api_key' not in store.settings()


def test_budget_reservations_are_atomic_integer_and_zero_blocks(client):
    _, app = client
    store = app.state.store
    with pytest.raises(ValueError):
        store.reserve('zero-budget', 1, 0)
    store.reserve('first-cost', 100, 200)
    with pytest.raises(ValueError):
        store.reserve('second-cost', 101, 200)
    assert store.spent() == 100
    store.settle('first-cost', 50)
    assert store.spent() == 50


def test_audit_and_knowledge_are_append_only(client):
    c, app = client
    sign(client)
    job = example(client)
    c.post(f'/api/jobs/{job["id"]}/run', json={})
    with pytest.raises(Exception):
        with app.state.store.engine.begin() as connection:
            connection.execute(events.delete())
    with pytest.raises(Exception):
        with app.state.store.engine.begin() as connection:
            connection.execute(knowledge.update().values(data='{}'))


def test_hash_gates_reject_modified_cloud_blob(client):
    c, app = client
    sign(client)
    job = example(client)
    c.post(f'/api/jobs/{job["id"]}/run', json={})
    value = app.state.store.job('demo-a', job['id'])
    app.state.blobs.put(value['output_object'], b'changed')
    assert c.get(f'/api/jobs/{job["id"]}/output').status_code == 409


def test_delete_removes_files_and_customer_job(client):
    c, app = client
    sign(client)
    job = example(client)
    stored = app.state.store.job('demo-a', job['id'])
    key = stored['files']['template']['object_key']
    assert c.delete(f'/api/jobs/{job["id"]}').status_code == 200
    assert c.get(f'/api/jobs/{job["id"]}').status_code == 404
    with pytest.raises(FileNotFoundError):
        app.state.blobs.get(key)


def test_production_rejects_ephemeral_sqlite_and_missing_cloud_config(tmp_path, monkeypatch):
    monkeypatch.setenv('SHEETQMS_ENV', 'production')
    with pytest.raises(ValueError, match='PostgreSQL'):
        create_online_app(tmp_path / 'invalid', demo=False, database_url='sqlite:///' + str(tmp_path / 'bad.db'))


def test_manual_check_preference_does_not_release_without_qms(client):
    c,_=client
    sign(client)
    c.put('/api/preferences',json={'auto_checks':False})
    job=example(client,'hold')
    c.post(f'/api/jobs/{job["id"]}/run',json={})
    reply=c.post(f'/api/jobs/{job["id"]}/chat',json={'text':'North Feb is 18','request_id':'manual-qms-reply'}).json()
    confirmed=c.post(f'/api/jobs/{job["id"]}/confirm',json={'proposal_id':reply['proposal']['id'],'request_id':'manual-qms-confirm'}).json()
    assert confirmed['state']=='MAPPED' and confirmed['report'] is None
    assert c.get(f'/api/jobs/{job["id"]}/output').status_code==409
    assert c.post(f'/api/jobs/{job["id"]}/run',json={}).json()['state']=='RELEASED'


def test_concise_explanation_preference_is_applied(client):
    c,_=client
    sign(client)
    c.put('/api/preferences',json={'explanations':'concise'})
    job=example(client,'hold')
    c.post(f'/api/jobs/{job["id"]}/run',json={})
    reply=c.post(f'/api/jobs/{job["id"]}/chat',json={'text':'What is blocking this output?','request_id':'concise-explanation'}).json()
    assert reply['chat'][-1]['text'].startswith('Output held.')
    assert 'Reply with evidence' in reply['chat'][-1]['text']


def test_conversational_easy_speech_number_and_yes_confirmation(client):
    c, _ = client
    sign(client)
    job = example(client, 'hold', 'casual-hold-001')
    # Casual "go" runs the transformation
    ran = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'go', 'request_id': 'casual-go-001'}).json()
    assert ran['state'] == 'HELD'
    # Casual number reply ("18") without repeating North Feb
    reply = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': '18', 'request_id': 'casual-18-001'}).json()
    assert reply['proposal']['kind'] == 'data_fact'
    assert reply['proposal']['entity'] == 'North' and reply['proposal']['category'] == 'Feb' and reply['proposal']['value'] == '18'
    # Casual "yes" in chat confirms and releases the workbook
    confirmed = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'yes', 'request_id': 'casual-yes-001'}).json()
    assert confirmed['state'] == 'RELEASED'
    assert confirmed['report']['rows'][0]['Feb'] == 18


def test_conversational_column_mapping_and_clarifying_questions(client):
    c, _ = client
    sign(client)
    job = example(client, 'chat_map', 'casual-map-001')
    assert "should I put 'Boxes' into 'Qty'?" in job['chat'][-1]['text']
    # Partial question from user ("what goes in Description?") triggers a friendly clarifying question
    clarify = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'what goes in Description?', 'request_id': 'casual-clarify-001'}).json()
    assert "which column from your file should go into 'Description'?" in clarify['chat'][-1]['text']
    # Replying in everyday speech ("put Boxes in Qty") proposes the mapping
    proposed = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'put Boxes in Qty', 'request_id': 'casual-boxes-qty-001'}).json()
    assert proposed['proposal']['kind'] == 'mapping'
    assert 'Put Boxes into Qty' in proposed['proposal']['description']
    # Confirming with "sure" in chat applies the mapping and releases the workbook
    released = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'sure', 'request_id': 'casual-sure-001'}).json()
    assert released['state'] == 'RELEASED'
    assert released['report']['rows'][0]['Qty'] == 8


def test_client_spreadsheet_edit_requests_in_chat(client):
    from io import BytesIO
    from openpyxl import load_workbook
    c, _ = client
    sign(client)
    job = example(client, 'pivot', 'client-edits-001')
    ran = c.post(f'/api/jobs/{job["id"]}/run', json={}).json()
    assert ran['state'] == 'RELEASED'
    assert [r['Site'] for r in ran['report']['rows']] == ['North', 'South', 'West']
    orig_jan = ran['report']['rows'][0]['Jan']
    orig_feb = ran['report']['rows'][0]['Feb']
    orig_mar = ran['report']['rows'][0]['Mar']

    # 1. "replace the first row with row 2" -> swaps row 1 (North) and row 2 (South)
    r1 = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'replace the first row with row 2', 'request_id': 'edit-row-swap'}).json()
    assert [r['Site'] for r in r1['report']['rows']] == ['South', 'North', 'West']
    assert 'swapped' in r1['chat'][-1]['text'].lower()

    # 2. "swap jan and feb" -> swaps Jan and Feb values across all rows
    r2 = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'swap jan and feb', 'request_id': 'edit-col-swap'}).json()
    north_row = next(r for r in r2['report']['rows'] if r['Site'] == 'North')
    assert north_row['Jan'] == orig_feb and north_row['Feb'] == orig_jan

    # 3. Bare "swap" followed by "jan and feb" -> asks what to swap, then executes on follow-up
    r3a = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'swap', 'request_id': 'edit-bare-swap'}).json()
    assert 'which two columns or rows to swap' in r3a['chat'][-1]['text'].lower()
    r3b = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'jan and feb', 'request_id': 'edit-followup-swap'}).json()
    north_row_after = next(r for r in r3b['report']['rows'] if r['Site'] == 'North')
    assert north_row_after['Jan'] == orig_jan and north_row_after['Feb'] == orig_feb

    # 4. Direct cell update ("change North Jan to 25") -> updates cell and recalculates Total
    r4 = c.post(f'/api/jobs/{job["id"]}/chat', json={'text': 'change North Jan to 25', 'request_id': 'edit-cell-val'}).json()
    north_updated = next(r for r in r4['report']['rows'] if r['Site'] == 'North')
    expected_total = 25 + orig_feb + orig_mar
    assert north_updated['Jan'] == 25 and north_updated['Total'] == expected_total

    # Verify downloadable .xlsx workbook reflects the updated rows and values
    dl = c.get(f'/api/jobs/{job["id"]}/output')
    assert dl.status_code == 200
    wb = load_workbook(BytesIO(dl.content), data_only=False)
    ws = wb['Output']
    assert ws['A4'].value == 'South'
    assert ws['A5'].value == 'North'
    assert ws['B5'].value == 25


def test_normal_workbook_without_rules_tab_and_header_dropdown_mapping(client):
    from io import BytesIO
    from openpyxl import Workbook
    c, _ = client
    sign(client)

    # Normal template WITHOUT a Rules sheet and with a multi-cell banner on Row 1
    tpl_wb = Workbook()
    tpl_ws = tpl_wb.active
    tpl_ws.title = 'Inventory_Report'
    tpl_ws.append(['ACME CORP — STANDARD INVENTORY TEMPLATE', None, 'Prepared: 2026-10-13'])
    tpl_ws.append([])
    tpl_ws.append(['SKU', 'Product Name', 'Qty', 'Unit Price'])
    tpl_bio = BytesIO()
    tpl_wb.save(tpl_bio)

    # Messy source with banner row, extra text column (Warehouse_Bin), two competing numeric columns, and Subtotal row
    src_wb = Workbook()
    src_ws = src_wb.active
    src_ws.title = 'Raw_ERP_Dump'
    src_ws.append(['ERP SYSTEM EXPORT — CONFIDENTIAL', None, None, 'Date: 2026-10-13'])
    src_ws.append([])
    src_ws.append(['Item code', 'Material Description', 'Warehouse_Bin', 'Crates_Delivered', 'Backup_Boxes', 'Unit Cost'])
    src_ws.append(['SKU-901', 'Stainless Flange 4in', 'Bin-A1', 24, 2, 45])
    src_ws.append(['SKU-902', 'Hydraulic Seal Kit', 'Bin-B4', 15, 0, 18])
    src_ws.append(['Subtotal', 'All Bins', '', 39, 2, 63])
    src_bio = BytesIO()
    src_wb.save(src_bio)

    job = c.post('/api/jobs', data={'request_id': 'no-rules-tab-001'}, files=[
        ('target', ('Normal-Template.xlsx', tpl_bio.getvalue(), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
        ('sources', ('Messy-ERP.xlsx', src_bio.getvalue(), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
    ]).json()

    # Banner rows skipped, Subtotal row excluded (2 rows), and text column Warehouse_Bin never misplaced into Qty
    assert job['plan']['sources'][0]['field_map'] == {'SKU': 'Item code', 'Product Name': 'Material Description', 'Unit Price': 'Unit Cost'}
    assert len(job['report']['rows']) == 2
    assert job['state'] == 'HELD'

    # Selecting Crates_Delivered from the Qty column header dropdown (/map-column) immediately maps and releases
    mapped = c.post(f'/api/jobs/{job["id"]}/map-column', json={'target_column': 'Qty', 'source_column': 'Crates_Delivered', 'request_id': 'map-col-001'}).json()
    assert mapped['state'] == 'RELEASED'
    assert mapped['report']['rows'][0] == {'SKU': 'SKU-901', 'Product Name': 'Stainless Flange 4in', 'Qty': 24, 'Unit Price': 45}


def test_sasams_two_sheet_student_and_subject_percentage_matrix_import(client):
    from io import BytesIO
    from openpyxl import load_workbook
    c, _ = client
    sign(client)
    job = example(client, 'sasams_students', 'sasams-students-001')
    ran = c.post(f'/api/jobs/{job["id"]}/run', json={}).json()
    assert ran['state'] == 'RELEASED'
    assert ran['report']['headers'] == [
        'Student ID', 'First Name', 'Last Name', 'Date of Birth', 'Grade',
        'Subjects', 'Parent First Name', 'Parent Last Name', 'Parent Email', 'Parent Phone',
    ]
    rows = ran['report']['rows']
    assert len(rows) == 4
    assert rows[0] == {
        'Student ID': 'STU001', 'First Name': 'John', 'Last Name': 'Doe',
        'Date of Birth': '2015-03-15', 'Grade': 'Grade 8',
        'Subjects': 'Mathematics; English; Science',
        'Parent First Name': 'Jane', 'Parent Last Name': 'Doe',
        'Parent Email': 'jane.doe@example.com', 'Parent Phone': '0821234567',
    }
    assert rows[1] == {
        'Student ID': 'STU002', 'First Name': 'Sarah', 'Last Name': 'Smith',
        'Date of Birth': '2014-07-22', 'Grade': 'Grade 9',
        'Subjects': 'Mathematics; English; Physical Science',
        'Parent First Name': 'Michael', 'Parent Last Name': 'Smith',
        'Parent Email': 'michael.smith@example.com', 'Parent Phone': '0839876543',
    }
    assert rows[2] == {
        'Student ID': 'STU003', 'First Name': 'Emma', 'Last Name': 'Johnson',
        'Date of Birth': '2016-01-10', 'Grade': 'Grade 7',
        'Subjects': 'Mathematics; English; Natural Science',
        'Parent First Name': 'Patricia', 'Parent Last Name': 'Johnson',
        'Parent Email': 'patricia.johnson@example.com', 'Parent Phone': '0847654321',
    }
    assert rows[3] == {
        'Student ID': 'STU004', 'First Name': 'Liam', 'Last Name': 'Johnson',
        'Date of Birth': '2013-09-05', 'Grade': 'Grade 10',
        'Subjects': 'Mathematics; English; Physical Science; Geography',
        'Parent First Name': 'Patricia', 'Parent Last Name': 'Johnson',
        'Parent Email': 'patricia.johnson@example.com', 'Parent Phone': '0847654321',
    }

    # Verify exported .xlsx preserves leading zero on Parent Phone ('0821234567') and exact cell values
    dl = c.get(f'/api/jobs/{job["id"]}/output')
    assert dl.status_code == 200
    wb = load_workbook(BytesIO(dl.content), data_only=True)
    ws = wb['Students']
    assert ws['A2'].value == 'STU001'
    assert ws['E2'].value == 'Grade 8'
    assert ws['F2'].value == 'Mathematics; English; Science'
    assert ws['J2'].value == '0821234567'
    assert ws['F5'].value == 'Mathematics; English; Physical Science; Geography'


def test_template_library_sheet_builder_and_cleaning_tools(client):
    c, _ = client
    sign(client)

    # 1. Built-in templates + custom template creation
    tpls = c.get('/api/templates').json()['items']
    assert any(t['id'] == 'sasams_student_import' for t in tpls)
    assert any(t['id'] == 'quotation_invoice' for t in tpls)

    saved = c.post('/api/templates', json={
        'name': 'Clinic Patient Intake',
        'category': 'Healthcare',
        'headers': ['Patient ID', 'Full Name', 'Medical Aid', 'Phone'],
    }).json()
    assert saved['name'] == 'Clinic Patient Intake'
    assert saved['headers'] == ['Patient ID', 'Full Name', 'Medical Aid', 'Phone']

    # 2. Create a spreadsheet from Create Sheet / Quotes & Invoices (/api/jobs/from-builder)
    built = c.post('/api/jobs/from-builder', json={
        'title': 'QUO-2026-0042-Greenwood-High.xlsx',
        'sheet': 'Quotation',
        'headers': ['Item Code', 'Description', 'Qty', 'Unit Price', 'Line Total'],
        'rows': [
            {'Item Code': 'SAS-01', 'Description': 'SA-SAMS Student Import', 'Qty': 850, 'Unit Price': 35, 'Line Total': 29750},
            {'Item Code': 'ONB-02', 'Description': 'Onboarding Session', 'Qty': 1, 'Unit Price': 2500, 'Line Total': 2500},
        ],
        'request_id': 'builder-quote-001',
    }).json()
    assert built['state'] == 'RELEASED'
    assert len(built['report']['rows']) == 2

    # 3. Run 1-click Data Cleaning tools (/api/jobs/{id}/clean): sort_asc, add_total_row, smart_fix_contacts
    sorted_job = c.post(f'/api/jobs/{built["id"]}/clean', json={'operation': 'sort_asc', 'request_id': 'clean-sort-001'}).json()
    assert sorted_job['state'] == 'RELEASED'
    assert [r['Item Code'] for r in sorted_job['report']['rows']] == ['ONB-02', 'SAS-01']

    tot_job = c.post(f'/api/jobs/{built["id"]}/clean', json={'operation': 'add_total_row', 'request_id': 'clean-total-001'}).json()
    assert tot_job['report']['rows'][-1]['Item Code'] == 'Total'
    assert tot_job['report']['rows'][-1]['Line Total'] == 32250

    sa_job = c.post('/api/jobs/from-builder', json={
        'title': 'SA-ID-Contacts.xlsx',
        'sheet': 'Contacts',
        'headers': ['Student ID', 'Full Name', 'SA ID Number', 'Date of Birth', 'Gender', 'Grade', 'Parent Email', 'Parent Phone'],
        'rows': [
            {'Student ID': 'STU001', 'Full Name': 'JOHN DOE', 'SA ID Number': '1503155123084', 'Date of Birth': '', 'Gender': '', 'Grade': '8', 'Parent Email': 'JANE@GMIAL.COM', 'Parent Phone': '821234567'},
        ],
        'request_id': 'builder-said-001',
    }).json()
    fixed_job = c.post(f'/api/jobs/{sa_job["id"]}/clean', json={'operation': 'smart_fix_contacts', 'request_id': 'clean-said-001'}).json()
    r0 = fixed_job['report']['rows'][0]
    assert r0['Full Name'] == 'John Doe'
    assert r0['Date of Birth'] == '2015-03-15'
    assert r0['Gender'] == 'Male'
    assert r0['Grade'] == 'Grade 8'
    assert r0['Parent Email'] == 'jane@gmail.com'
    assert r0['Parent Phone'] == '0821234567'






