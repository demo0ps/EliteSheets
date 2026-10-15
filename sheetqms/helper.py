"""Sheet Helper: lesson plans, class tests with memos, and assignments with rubrics.

Privacy rule: the prompt to Gemini is built only from grade, subject, topic and mark totals.
Learner names, IDs and marks never reach this module. `guard_outgoing` refuses any request
body that contains an identifier-shaped value or a known learner string.

Checks in code (not trusted to the model): lesson minutes add up to the lesson length,
test and rubric marks add up to the total, question numbers run 1..n, and every question has a memo.
"""
from __future__ import annotations

import json
import os
import re
from typing import Literal

import httpx
from pydantic import Field

from .models import StrictModel

GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
DEFAULT_MODEL = 'gemini-2.5-flash'
MAX_OUTPUT_TOKENS = 4096
TIMEOUT_SECONDS = 60

# Monthly allowance per teacher. Suggested values, to be confirmed by the user.
HELPER_LIMITS = {'lesson': 20, 'assessment': 10}

GRADES = ['R'] + [str(n) for n in range(1, 13)]

# CAPS subject lists by phase. Confirm against the official CAPS documents before launch.
_FOUNDATION = ['English Home Language', 'Afrikaans Home Language', 'Mathematics', 'Life Skills']
_INTERMEDIATE = ['English Home Language', 'Afrikaans Home Language', 'Mathematics', 'Natural Sciences and Technology', 'Social Sciences', 'Life Skills']
_SENIOR = ['English Home Language', 'Afrikaans Home Language', 'Mathematics', 'Natural Sciences', 'Social Sciences', 'Technology', 'Economic and Management Sciences', 'Life Orientation', 'Creative Arts']
_FET = ['English Home Language', 'Afrikaans Home Language', 'Mathematics', 'Mathematical Literacy', 'Physical Sciences', 'Life Sciences', 'Geography', 'History', 'Accounting', 'Business Studies', 'Economics', 'Life Orientation']
SUBJECTS: dict[str, list[str]] = {}
for _g in GRADES:
    if _g in {'R', '1', '2', '3'}:
        SUBJECTS[_g] = _FOUNDATION
    elif _g in {'4', '5', '6'}:
        SUBJECTS[_g] = _INTERMEDIATE
    elif _g in {'7', '8', '9'}:
        SUBJECTS[_g] = _SENIOR
    else:
        SUBJECTS[_g] = _FET

KINDS = ('lesson', 'test', 'assignment')
BUCKET = {'lesson': 'lesson', 'test': 'assessment', 'assignment': 'assessment'}

# Patterns that look like personal identifiers. Any of these in an outgoing request is refused.
_ID_PATTERNS = [
    re.compile(r'\b\d{13}\b'),                 # SA ID number
    re.compile(r'\b\d{6,}\b'),                 # long digit runs (IDs, account numbers)
    re.compile(r'[^\s@]+@[^\s@]+\.[^\s@]+'),   # email
    re.compile(r'(?:\+27|\b0)[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{4}\b'),  # SA phone
]


class HelperError(ValueError):
    pass


class HelperRequest(StrictModel):
    kind: Literal['lesson', 'test', 'assignment']
    grade: str = Field(max_length=2)
    subject: str = Field(max_length=60)
    topic: str = Field(max_length=120)
    minutes: int = Field(default=45, ge=20, le=120)
    total_marks: int = Field(default=50, ge=10, le=100)


def bucket(kind: str) -> str:
    return BUCKET[kind]


def configured() -> bool:
    return bool(os.environ.get('SHEETQMS_GEMINI_API_KEY', '').strip())


def check_identifiers(text: str, known: tuple[str, ...] = ()) -> None:
    """Raises HelperError when text contains identifier-shaped values or known learner strings."""
    for pattern in _ID_PATTERNS:
        if pattern.search(text):
            raise HelperError('Remove numbers, emails or phone numbers from the topic. Sheet Helper never needs personal details.')
    lowered = text.lower()
    for item in known:
        if item and item.lower() in lowered:
            raise HelperError('Learner details cannot be sent to Sheet Helper.')


def validate(req: HelperRequest) -> None:
    if req.grade not in GRADES:
        raise HelperError('Choose a grade from R to 12.')
    if req.subject not in SUBJECTS[req.grade]:
        raise HelperError('Choose a CAPS subject for this grade.')
    topic = req.topic.strip()
    if len(topic) < 3:
        raise HelperError('Describe the topic in a few words, for example "Fractions: adding unlike denominators".')
    check_identifiers(topic)


def build_prompt(req: HelperRequest) -> tuple[str, str]:
    """Returns (system instruction, user prompt). Only structured, non-personal fields are used."""
    system = (
        'You help South African teachers prepare CAPS-aligned material in English. '
        'Use only the grade, subject, topic and totals given. Never invent learner names, IDs or marks. '
        'Return JSON only, matching the schema. Keep language plain and suitable for the grade.'
    )
    phase_note = f'Grade {req.grade}, CAPS subject: {req.subject}. Topic: {req.topic.strip()}.'
    if req.kind == 'lesson':
        task = f'Write one lesson plan of {req.minutes} minutes. Steps must add up to exactly {req.minutes} minutes.'
    elif req.kind == 'test':
        task = (f'Write a class test out of {req.total_marks} marks with a memo. Question marks must add up to exactly {req.total_marks}. '
                'Give every question a memo answer with the marks shown.')
    else:
        task = (f'Write an assignment brief and a rubric out of {req.total_marks} marks. Rubric criterion marks must add up to exactly {req.total_marks}.')
    return system, phase_note + ' ' + task


def _schema(kind: str) -> dict:
    s = {'type': 'STRING'}
    n = {'type': 'INTEGER'}
    if kind == 'lesson':
        return {'type': 'OBJECT', 'properties': {
            'title': s,
            'objectives': {'type': 'ARRAY', 'items': s},
            'steps': {'type': 'ARRAY', 'items': {'type': 'OBJECT', 'properties': {'minutes': n, 'activity': s}, 'required': ['minutes', 'activity']}},
            'resources': {'type': 'ARRAY', 'items': s},
            'assessment': s,
            'homework': s,
        }, 'required': ['title', 'objectives', 'steps', 'resources', 'assessment']}
    if kind == 'test':
        return {'type': 'OBJECT', 'properties': {
            'title': s,
            'instructions': s,
            'questions': {'type': 'ARRAY', 'items': {'type': 'OBJECT', 'properties': {'number': n, 'text': s, 'marks': n, 'memo': s}, 'required': ['number', 'text', 'marks', 'memo']}},
        }, 'required': ['title', 'instructions', 'questions']}
    return {'type': 'OBJECT', 'properties': {
        'title': s,
        'brief': s,
        'rubric': {'type': 'ARRAY', 'items': {'type': 'OBJECT', 'properties': {'criterion': s, 'marks': n, 'descriptor': s}, 'required': ['criterion', 'marks', 'descriptor']}},
    }, 'required': ['title', 'brief', 'rubric']}


def build_body(req: HelperRequest) -> dict:
    system, prompt = build_prompt(req)
    return {
        'systemInstruction': {'parts': [{'text': system}]},
        'contents': [{'role': 'user', 'parts': [{'text': prompt}]}],
        'generationConfig': {
            'responseMimeType': 'application/json',
            'responseSchema': _schema(req.kind),
            'temperature': 0.4,
            'maxOutputTokens': MAX_OUTPUT_TOKENS,
        },
    }


def check_draft(req: HelperRequest, draft: dict) -> dict:
    """Checks the arithmetic and structure in code. Raises HelperError when a draft fails."""
    if req.kind == 'lesson':
        steps = draft.get('steps') or []
        total = sum(int(step.get('minutes', 0)) for step in steps)
        if total != req.minutes:
            raise HelperError(f'The lesson steps add up to {total} minutes, not {req.minutes}. Try again.')
        return {'minutes': total, 'expected': req.minutes, 'ok': True}
    if req.kind == 'test':
        questions = draft.get('questions') or []
        numbers = [int(q.get('number', 0)) for q in questions]
        if numbers != list(range(1, len(questions) + 1)):
            raise HelperError('Question numbers are not in order. Try again.')
        if any(not str(q.get('memo', '')).strip() for q in questions):
            raise HelperError('A question has no memo. Try again.')
        total = sum(int(q.get('marks', 0)) for q in questions)
        if total != req.total_marks:
            raise HelperError(f'The test marks add up to {total}, not {req.total_marks}. Try again.')
        return {'marks': total, 'expected': req.total_marks, 'ok': True}
    rubric = draft.get('rubric') or []
    total = sum(int(r.get('marks', 0)) for r in rubric)
    if not rubric or total != req.total_marks:
        raise HelperError(f'The rubric marks add up to {total}, not {req.total_marks}. Try again.')
    return {'marks': total, 'expected': req.total_marks, 'ok': True}


def generate(req: HelperRequest, api_key: str, transport=None, model: str | None = None) -> dict:
    validate(req)
    body = build_body(req)
    # Final guard over the whole outgoing body, not only the topic.
    check_identifiers(json.dumps(body, ensure_ascii=False))
    model_name = model or os.environ.get('SHEETQMS_GEMINI_MODEL', DEFAULT_MODEL)
    headers = {'x-goog-api-key': api_key, 'content-type': 'application/json'}
    with httpx.Client(timeout=TIMEOUT_SECONDS, follow_redirects=False, trust_env=False, transport=transport) as client:
        response = client.post(GEMINI_URL.format(model=model_name), headers=headers, json=body)
    if response.status_code >= 300:
        raise HelperError('The AI service could not write this draft. No allowance was used. Try again shortly.')
    raw = response.json()
    try:
        text = raw['candidates'][0]['content']['parts'][0]['text']
        draft = json.loads(text)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError):
        raise HelperError('The draft came back in an unexpected format. No allowance was used. Try again.')
    if not isinstance(draft, dict):
        raise HelperError('The draft came back in an unexpected format. No allowance was used. Try again.')
    check = check_draft(req, draft)
    return {'kind': req.kind, 'grade': req.grade, 'subject': req.subject, 'topic': req.topic.strip(), 'draft': draft, 'check': check, 'model': model_name}


# ---- Conversation: questions, CAPS alignment and refining the current draft ----

CHAT_LIMIT = 60  # messages per teacher per month. Suggested value, to be confirmed.
HELPER_LIMITS['chat'] = CHAT_LIMIT
MAX_HISTORY = 12
MAX_TURN_CHARS = 1000


class ChatTurn(StrictModel):
    role: Literal['user', 'assistant']
    text: str = Field(min_length=1, max_length=MAX_TURN_CHARS)


class ChatRequest(StrictModel):
    kind: Literal['lesson', 'test', 'assignment']
    grade: str = Field(max_length=2)
    subject: str = Field(max_length=60)
    minutes: int = Field(default=45, ge=20, le=120)
    total_marks: int = Field(default=50, ge=10, le=100)
    messages: list[ChatTurn] = Field(min_length=1, max_length=MAX_HISTORY)
    current_draft: dict | None = None


def _chat_schema(kind: str) -> dict:
    draft = dict(_schema(kind))
    draft['nullable'] = True
    return {'type': 'OBJECT', 'properties': {'reply': {'type': 'STRING'}, 'draft': draft}, 'required': ['reply', 'draft']}


def build_chat_body(req: ChatRequest) -> dict:
    total = req.minutes if req.kind == 'lesson' else req.total_marks
    unit = 'minutes' if req.kind == 'lesson' else 'marks'
    system = (
        'You are Sheet Helper, a planning assistant for South African teachers. Answer in English, aligned to CAPS. '
        'Explain CAPS content, learning outcomes and how to pitch a topic for the grade. Never use or ask for learner names, IDs or marks. '
        'If the teacher asks for changes to the current draft, return the complete updated draft in "draft", using the schema. '
        'Otherwise return "draft": null. The draft totals must stay exactly as set: ' + f'{total} {unit}. Return JSON only.'
    )
    context = f'Grade {req.grade}, CAPS subject: {req.subject}. Type: {req.kind}. Totals: {total} {unit}.'
    if req.current_draft is not None:
        context += ' Current draft (JSON): ' + json.dumps(req.current_draft, ensure_ascii=False)
    contents = []
    for turn in req.messages:
        role = 'user' if turn.role == 'user' else 'model'
        contents.append({'role': role, 'parts': [{'text': turn.text}]})
    contents[0]['parts'][0]['text'] = context + '\n\n' + contents[0]['parts'][0]['text']
    return {
        'systemInstruction': {'parts': [{'text': system}]},
        'contents': contents,
        'generationConfig': {
            'responseMimeType': 'application/json',
            'responseSchema': _chat_schema(req.kind),
            'temperature': 0.4,
            'maxOutputTokens': MAX_OUTPUT_TOKENS,
        },
    }


def chat(req: ChatRequest, api_key: str, transport=None, model: str | None = None) -> dict:
    base = HelperRequest(kind=req.kind, grade=req.grade, subject=req.subject, topic='Sheet Helper conversation',
                         minutes=req.minutes, total_marks=req.total_marks)
    validate(base)
    if req.messages[-1].role != 'user' or req.messages[0].role != 'user':
        raise HelperError('Start and end the conversation with your message.')
    for turn in req.messages:
        check_identifiers(turn.text)
    body = build_chat_body(req)
    check_identifiers(json.dumps(body, ensure_ascii=False))
    model_name = model or os.environ.get('SHEETQMS_GEMINI_MODEL', DEFAULT_MODEL)
    headers = {'x-goog-api-key': api_key, 'content-type': 'application/json'}
    with httpx.Client(timeout=TIMEOUT_SECONDS, follow_redirects=False, trust_env=False, transport=transport) as client:
        response = client.post(GEMINI_URL.format(model=model_name), headers=headers, json=body)
    if response.status_code >= 300:
        raise HelperError('Sheet Helper could not answer this message. No allowance was used. Try again shortly.')
    try:
        out = json.loads(response.json()['candidates'][0]['content']['parts'][0]['text'])
    except (KeyError, IndexError, TypeError, json.JSONDecodeError):
        raise HelperError('The answer came back in an unexpected format. No allowance was used. Try again.')
    if not isinstance(out, dict) or not str(out.get('reply', '')).strip():
        raise HelperError('The answer came back empty. No allowance was used. Try again.')
    draft = out.get('draft')
    check = None
    if draft is not None:
        if not isinstance(draft, dict):
            raise HelperError('The updated draft came back in an unexpected format. No allowance was used. Try again.')
        check = check_draft(base, draft)
    return {'reply': str(out['reply']).strip(), 'draft': draft, 'check': check, 'model': model_name}
