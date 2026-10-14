import json
import sqlite3
import uuid
from datetime import date, timedelta
from decimal import Decimal

import httpx
import pytest
from pydantic import ValidationError

from sheetqms.ai import analyse, validate_endpoint, checked_pricing, payload_for
from sheetqms.models import AISettings
from sheetqms.engine import infer_plan, transform
from sheetqms.store import Store, microdollars
from conftest import make_job


def settings(**changes):
    # Synthetic billing parameters for tests, not a quote from any actual provider/model.
    values = {'enabled': True, 'base_url': 'https://api.openai.com/v1', 'model': 'synthetic-test-model', 'monthly_budget_usd': '1', 'input_price_per_million_usd': '1', 'output_price_per_million_usd': '2', 'pricing_verified_date': date.today().isoformat(), 'pricing_source_url': 'https://example.org/synthetic-pricing'}
    return AISettings(**(values | changes))


def test_ai_request_uses_typed_json_and_no_key_in_payload(samples, tmp_path):
    job = make_job(samples)
    expected = infer_plan(job)
    seen = []
    def provider(request):
        body = json.loads(request.content)
        seen.append(body)
        assert request.headers['authorization'] == 'Bearer FAKE-TEST-KEY'
        assert b'FAKE-TEST-KEY' not in request.content
        assert request.url.path == '/v1/chat/completions'
        assert body['max_tokens'] == 4000
        return httpx.Response(200, json={'choices': [{'message': {'content': expected.model_dump_json()}}], 'usage': {'prompt_tokens': 100, 'completion_tokens': 100}})
    store = Store(tmp_path / 'store')
    plan, usage = analyse(job, settings(), 'FAKE-TEST-KEY', store, str(uuid.uuid4()), httpx.MockTransport(provider))
    assert plan == expected
    assert len(seen) == 1
    assert store.spent() == 300
    assert transform(job, plan, tmp_path / 'result.xlsx').status == 'RELEASED'


def test_anthropic_adapter_mocked(samples, tmp_path):
    job = make_job(samples)
    expected = infer_plan(job)
    def provider(request):
        assert request.headers['x-api-key'] == 'FAKE-TEST-KEY'
        assert request.url.path == '/v1/messages'
        return httpx.Response(200, json={'content': [{'type': 'text', 'text': expected.model_dump_json()}], 'usage': {'input_tokens': 100, 'output_tokens': 100}})
    plan, _ = analyse(job, settings(provider='anthropic', base_url='https://api.anthropic.com'), 'FAKE-TEST-KEY', Store(tmp_path / 'store'), str(uuid.uuid4()), httpx.MockTransport(provider))
    assert plan == expected


def test_invalid_ai_plan_rejected(samples, tmp_path):
    def provider(request):
        return httpx.Response(200, json={'choices': [{'message': {'content': '{"run_python":"delete everything"}'}}]})
    with pytest.raises(ValidationError):
        analyse(make_job(samples), settings(), 'FAKE-TEST-KEY', Store(tmp_path / 'store'), str(uuid.uuid4()), httpx.MockTransport(provider))


def test_no_retry_on_provider_error(samples, tmp_path):
    calls = []
    def provider(request):
        calls.append(1)
        return httpx.Response(429, json={'message': 'SYNTHETIC RATE LIMIT'})
    store = Store(tmp_path / 'store')
    with pytest.raises(ValueError, match='HTTP 429'):
        analyse(make_job(samples), settings(), 'FAKE-TEST-KEY', store, str(uuid.uuid4()), httpx.MockTransport(provider))
    assert len(calls) == 1
    assert store.spent() > 0  # reservation retained; unknown billed usage is not treated as free


def test_budget_blocks_before_network(samples, tmp_path):
    calls = []
    def provider(request):
        calls.append(1)
        return httpx.Response(200)
    with pytest.raises(ValueError, match='budget'):
        analyse(make_job(samples), settings(monthly_budget_usd='0'), 'FAKE-TEST-KEY', Store(tmp_path / 'store'), str(uuid.uuid4()), httpx.MockTransport(provider))
    assert calls == []


def test_stale_prices_rejected():
    with pytest.raises(ValueError, match='30 days'):
        checked_pricing(settings(pricing_verified_date=(date.today() - timedelta(days=31)).isoformat()))


def test_non_allowlisted_url_rejected():
    with pytest.raises(ValueError, match='allowlist'):
        validate_endpoint(settings(base_url='https://unapproved.invalid/v1'))


def test_api_url_cannot_contain_credentials_or_http():
    with pytest.raises(ValueError):
        validate_endpoint(settings(base_url='https://secret@api.openai.com/v1'))
    with pytest.raises(ValueError):
        validate_endpoint(settings(base_url='http://api.openai.com/v1'))


def test_nan_and_negative_prices_rejected():
    with pytest.raises(ValidationError):
        settings(input_price_per_million_usd='NaN')
    with pytest.raises(ValidationError):
        settings(monthly_budget_usd='-1')


def test_spend_is_integer_microdollars(tmp_path):
    store = Store(tmp_path / 'store')
    assert microdollars('0.000001') == 1
    store.reserve('request-one', 800, 1000)
    with pytest.raises(ValueError, match='budget'):
        store.reserve('request-two', 201, 1000)
    with pytest.raises(ValueError, match='already'):
        store.reserve('request-one', 1, 1000)
    store.settle('request-one', 700)
    assert store.spent() == 700
    store.reserve('request-two', 300, 1000)
    assert store.spent() == 1000


def test_events_are_append_only(tmp_path):
    store = Store(tmp_path / 'store')
    store.event('job', 'trace', 'test', {})
    with store.connect() as db:
        with pytest.raises(sqlite3.IntegrityError):
            db.execute('UPDATE events SET kind="changed"')
        with pytest.raises(sqlite3.IntegrityError):
            db.execute('DELETE FROM events')


def test_knowledge_corrections_create_immutable_revisions(tmp_path):
    store = Store(tmp_path / 'store')
    base = {'family': 'family', 'version': 'version', 'input_signature': 'shape', 'plan': {'source': 'field-a'}, 'bindings': {}, 'job_id': 'job', 'trace_id': 'trace'}
    first = store.learn(base)
    second = store.learn(base | {'plan': {'source': 'field-b'}})
    assert first != second
    assert len(store.knowledge()) == 2
    assert [item['id'] for item in store.knowledge() if item['active']] == [second]
    assert store.learn(base) == first
    assert [item['id'] for item in store.knowledge() if item['active']] == [first]
    with store.connect() as db:
        with pytest.raises(sqlite3.IntegrityError):
            db.execute('UPDATE knowledge SET version="overwritten"')


def test_only_bounded_samples_in_ai_payload(samples):
    payload = payload_for(make_job(samples))
    for profile in payload['source_profiles']:
        assert 'path' not in profile
        assert 'sha256' not in profile
        for sheet in profile['sheets']:
            assert len(sheet['preview']) <= 5
    assert 'api_key' not in json.dumps(payload)
