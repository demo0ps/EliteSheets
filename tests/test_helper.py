import json

import httpx
import pytest

from sheetqms import helper
from sheetqms.helper import HelperError, HelperRequest
from tests.test_online import client, sign  # noqa: F401  (shared fixtures)


def req(**kw):
    base = dict(kind='lesson', grade='8', subject='Mathematics', topic='Fractions: adding unlike denominators', minutes=45, total_marks=50)
    base.update(kw)
    return HelperRequest(**base)


def gemini_reply(draft):
    return {'candidates': [{'content': {'parts': [{'text': json.dumps(draft)}]}}]}


LESSON = {
    'title': 'Adding unlike fractions',
    'objectives': ['Find a common denominator'],
    'steps': [{'minutes': 15, 'activity': 'Warm-up'}, {'minutes': 20, 'activity': 'Worked examples'}, {'minutes': 10, 'activity': 'Practice'}],
    'resources': ['Board'],
    'assessment': 'Exit ticket',
    'homework': 'Five sums',
}

TEST = {
    'title': 'Fractions test',
    'instructions': 'Show all working.',
    'questions': [
        {'number': 1, 'text': '1/2 + 1/3', 'marks': 3, 'memo': '5/6'},
        {'number': 2, 'text': '2/3 + 1/4', 'marks': 4, 'memo': '11/12'},
        {'number': 3, 'text': 'Word problem', 'marks': 3, 'memo': '2 1/2 cups'},
    ],
}

RUBRIC = {
    'title': 'Fraction project',
    'brief': 'Explain a fraction sum with a diagram.',
    'rubric': [{'criterion': 'Method', 'marks': 5, 'descriptor': 'Correct steps'}, {'criterion': 'Accuracy', 'marks': 5, 'descriptor': 'Correct answer'}],
}


def test_valid_request_passes():
    helper.validate(req())


def test_grade_and_subject_must_match():
    with pytest.raises(HelperError):
        helper.validate(req(grade='3', subject='Physical Sciences'))
    with pytest.raises(HelperError):
        helper.validate(req(grade='13'))


@pytest.mark.parametrize('topic', [
    'Fractions for 8012150123087',   # SA ID shape
    'Ask mom 0821234567 about it',   # phone
    'Send results to jane@school.za',  # email
    'Fractions 123456',               # long digit run
])
def test_identifier_shaped_topics_are_refused(topic):
    with pytest.raises(HelperError):
        helper.validate(req(topic=topic))


def test_known_learner_strings_are_refused():
    with pytest.raises(HelperError):
        helper.check_identifiers('Remedial work for Thabo Mokoena', known=('Thabo Mokoena',))


def test_request_body_has_no_learner_fields(client):
    c, _ = client
    sign(client)
    r = c.post('/api/helper/generate', json={'kind': 'lesson', 'grade': '8', 'subject': 'Mathematics', 'topic': 'Ratios', 'learners': [{'name': 'Thabo'}]})
    assert r.status_code == 422


def test_lesson_minutes_must_add_up():
    bad = dict(LESSON, steps=[{'minutes': 10, 'activity': 'Only one'}])
    with pytest.raises(HelperError):
        helper.check_draft(req(), bad)


def test_test_marks_must_add_up_and_memos_required():
    with pytest.raises(HelperError):
        helper.check_draft(req(kind='test', total_marks=50), TEST)
    no_memo = json.loads(json.dumps(TEST))
    no_memo['questions'][0]['memo'] = ' '
    with pytest.raises(HelperError):
        helper.check_draft(req(kind='test', total_marks=10), no_memo)
    assert helper.check_draft(req(kind='test', total_marks=10), TEST)['marks'] == 10


def test_question_numbers_must_run_in_order():
    bad = json.loads(json.dumps(TEST))
    bad['questions'][1]['number'] = 5
    with pytest.raises(HelperError):
        helper.check_draft(req(kind='test', total_marks=10), bad)


def test_rubric_marks_must_add_up():
    with pytest.raises(HelperError):
        helper.check_draft(req(kind='assignment', total_marks=20), RUBRIC)
    assert helper.check_draft(req(kind='assignment', total_marks=10), RUBRIC)['ok']


def test_outgoing_body_is_only_structured_fields():
    body = helper.build_body(req())
    text = json.dumps(body)
    assert 'Fractions: adding unlike denominators' in text
    assert '@' not in text and 'Thabo' not in text


def test_generate_sends_guarded_request_and_returns_checked_draft():
    seen = []

    def handler(request):
        seen.append(request)
        return httpx.Response(200, json=gemini_reply(LESSON))

    out = helper.generate(req(), 'test-key', transport=httpx.MockTransport(handler))
    assert out['check'] == {'minutes': 45, 'expected': 45, 'ok': True}
    assert seen[0].headers['x-goog-api-key'] == 'test-key'
    assert b'Thabo' not in seen[0].content


def test_refused_topic_makes_no_outgoing_call():
    seen = []
    with pytest.raises(HelperError):
        helper.generate(req(topic='Mail jane@school.za'), 'k', transport=httpx.MockTransport(lambda r: seen.append(r) or httpx.Response(200, json={})))
    assert seen == []


def test_endpoint_refuses_without_key(client, monkeypatch):
    c, _ = client
    sign(client)
    monkeypatch.delenv('SHEETQMS_GEMINI_API_KEY', raising=False)
    r = c.post('/api/helper/generate', json={'kind': 'lesson', 'grade': '8', 'subject': 'Mathematics', 'topic': 'Ratios'})
    assert r.status_code == 503


def test_endpoint_generates_and_counts_allowance(client, monkeypatch):
    c, app = client
    sign(client)
    monkeypatch.setenv('SHEETQMS_GEMINI_API_KEY', 'test-key')
    app.state.helper_transport = httpx.MockTransport(lambda r: httpx.Response(200, json=gemini_reply(LESSON)))
    r = c.post('/api/helper/generate', json={'kind': 'lesson', 'grade': '8', 'subject': 'Mathematics', 'topic': 'Ratios', 'minutes': 45})
    assert r.status_code == 200, r.text
    assert r.json()['check']['ok'] is True
    usage = c.get('/api/helper/usage').json()
    assert usage['used']['lesson'] == 1 and usage['limits'] == {'lesson': 20, 'assessment': 10, 'chat': 60}


def test_endpoint_bad_draft_uses_no_allowance(client, monkeypatch):
    c, app = client
    sign(client)
    monkeypatch.setenv('SHEETQMS_GEMINI_API_KEY', 'test-key')
    app.state.helper_transport = httpx.MockTransport(lambda r: httpx.Response(200, json=gemini_reply(dict(LESSON, steps=[]))))
    r = c.post('/api/helper/generate', json={'kind': 'lesson', 'grade': '8', 'subject': 'Mathematics', 'topic': 'Ratios', 'minutes': 45})
    assert r.status_code == 422
    assert c.get('/api/helper/usage').json()['used']['lesson'] == 0


def test_endpoint_enforces_monthly_allowance(client, monkeypatch):
    c, app = client
    sign(client)
    monkeypatch.setenv('SHEETQMS_GEMINI_API_KEY', 'test-key')
    monkeypatch.setitem(helper.HELPER_LIMITS, 'assessment', 1)
    app.state.helper_transport = httpx.MockTransport(lambda r: httpx.Response(200, json=gemini_reply(RUBRIC)))
    body = {'kind': 'assignment', 'grade': '8', 'subject': 'Mathematics', 'topic': 'Ratios', 'total_marks': 10}
    assert c.post('/api/helper/generate', json=body).status_code == 200
    assert c.post('/api/helper/generate', json=body).status_code == 402


# ---- Conversation ----

def chat_body(messages=None, **kw):
    base = {'kind': 'lesson', 'grade': '8', 'subject': 'Mathematics', 'minutes': 45,
            'messages': messages or [{'role': 'user', 'text': 'What does CAPS expect for fractions in Grade 8?'}]}
    base.update(kw)
    return base


def test_chat_reply_without_draft(client, monkeypatch):
    c, app = client
    sign(client)
    monkeypatch.setenv('SHEETQMS_GEMINI_API_KEY', 'test-key')
    app.state.helper_transport = httpx.MockTransport(lambda r: httpx.Response(200, json=gemini_reply({'reply': 'Grade 8 covers operations with fractions.', 'draft': None})))
    r = c.post('/api/helper/chat', json=chat_body())
    assert r.status_code == 200, r.text
    assert r.json()['reply'].startswith('Grade 8') and r.json()['draft'] is None
    assert c.get('/api/helper/usage').json()['used']['chat'] == 1


def test_chat_revised_draft_is_rechecked(client, monkeypatch):
    c, app = client
    sign(client)
    monkeypatch.setenv('SHEETQMS_GEMINI_API_KEY', 'test-key')
    app.state.helper_transport = httpx.MockTransport(lambda r: httpx.Response(200, json=gemini_reply({'reply': 'Made it shorter.', 'draft': LESSON})))
    r = c.post('/api/helper/chat', json=chat_body(messages=[{'role': 'user', 'text': 'Make it shorter'}], current_draft=LESSON))
    assert r.status_code == 200, r.text
    assert r.json()['check'] == {'minutes': 45, 'expected': 45, 'ok': True}


def test_chat_draft_that_breaks_totals_is_refused(client, monkeypatch):
    c, app = client
    sign(client)
    monkeypatch.setenv('SHEETQMS_GEMINI_API_KEY', 'test-key')
    bad = dict(LESSON, steps=[{'minutes': 30, 'activity': 'Too short'}])
    app.state.helper_transport = httpx.MockTransport(lambda r: httpx.Response(200, json=gemini_reply({'reply': 'Here it is.', 'draft': bad})))
    r = c.post('/api/helper/chat', json=chat_body(messages=[{'role': 'user', 'text': 'Shorter please'}]))
    assert r.status_code == 422
    assert c.get('/api/helper/usage').json()['used']['chat'] == 0


def test_chat_message_with_identifier_makes_no_call(client, monkeypatch):
    c, app = client
    sign(client)
    monkeypatch.setenv('SHEETQMS_GEMINI_API_KEY', 'test-key')
    seen = []
    app.state.helper_transport = httpx.MockTransport(lambda r: seen.append(r) or httpx.Response(200, json={}))
    r = c.post('/api/helper/chat', json=chat_body(messages=[{'role': 'user', 'text': 'Email jane@school.za the marks'}]))
    assert r.status_code == 422
    assert seen == []


def test_chat_must_end_with_teacher_message(client, monkeypatch):
    c, app = client
    sign(client)
    monkeypatch.setenv('SHEETQMS_GEMINI_API_KEY', 'test-key')
    seen = []
    app.state.helper_transport = httpx.MockTransport(lambda r: seen.append(r) or httpx.Response(200, json={}))
    r = c.post('/api/helper/chat', json=chat_body(messages=[{'role': 'user', 'text': 'Hi there'}, {'role': 'assistant', 'text': 'Hello'}]))
    assert r.status_code == 422 and seen == []


def test_chat_refuses_without_key_and_respects_allowance(client, monkeypatch):
    c, app = client
    sign(client)
    monkeypatch.delenv('SHEETQMS_GEMINI_API_KEY', raising=False)
    assert c.post('/api/helper/chat', json=chat_body()).status_code == 503
    monkeypatch.setenv('SHEETQMS_GEMINI_API_KEY', 'test-key')
    monkeypatch.setitem(helper.HELPER_LIMITS, 'chat', 1)
    app.state.helper_transport = httpx.MockTransport(lambda r: httpx.Response(200, json=gemini_reply({'reply': 'Yes.', 'draft': None})))
    assert c.post('/api/helper/chat', json=chat_body()).status_code == 200
    assert c.post('/api/helper/chat', json=chat_body()).status_code == 402
