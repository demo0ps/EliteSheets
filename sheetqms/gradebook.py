"""Teacher gradebook core: weighted assessments, CAPS levels, checks and export.

Pure functions only, so the maths and checks can be tested without the web app.

Rules:
- Each assessment has a name, a maximum mark (> 0) and a weight (>= 0).
- A mark is converted to a percentage of its own maximum first, so a 6-mark test
  and an 80-mark test count fairly when weighted.
- The term mark is the weighted average of the assessment percentages. It is only
  calculated when every weighted assessment has a mark; otherwise it is left blank
  and a warning is raised, so an incomplete learner is never shown as a final mark.
- Errors block export. Warnings do not.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal, InvalidOperation
from typing import Any

from .engine import percentage_to_caps_level

ABSENT_WORDS = {'', '-', '--', '—', 'n/a', 'na', 'absent', 'ab', 'exempt', 'not taken'}


@dataclass
class Assessment:
    name: str
    max_mark: Any
    weight: Any


@dataclass
class Learner:
    learner_id: str
    marks: dict[str, Any] = field(default_factory=dict)


@dataclass
class Check:
    level: str  # 'error' or 'warning'
    message: str
    where: str = ''


def _decimal(value: Any) -> Decimal | None:
    """Return a Decimal for a numeric value, or None for blank, absent or non-numeric."""
    if value is None or isinstance(value, bool):
        return None
    text = str(value).strip().rstrip('%').strip()
    if text.lower() in ABSENT_WORDS:
        return None
    try:
        number = Decimal(text)
    except (InvalidOperation, ValueError):
        return None
    return number


def validate(assessments: list[Assessment], learners: list[Learner]) -> list[Check]:
    checks: list[Check] = []
    if not assessments:
        checks.append(Check('error', 'Add at least one assessment.'))
        return checks

    names = [a.name.strip() for a in assessments]
    for name in set(n for n in names if names.count(n) > 1):
        checks.append(Check('error', f'Two assessments are called "{name}". Give each one a unique name.'))

    total_weight = Decimal(0)
    for a in assessments:
        label = a.name.strip() or '(unnamed)'
        if not a.name.strip():
            checks.append(Check('error', 'An assessment has no name.'))
        max_mark = _decimal(a.max_mark)
        if max_mark is None or max_mark <= 0:
            checks.append(Check('error', f'"{label}" needs a maximum mark greater than zero.', label))
        weight = _decimal(a.weight)
        if weight is None or weight < 0:
            checks.append(Check('error', f'"{label}" needs a weight of zero or more.', label))
        else:
            total_weight += weight

    if total_weight != 100:
        checks.append(Check('error', f'The weights add up to {total_weight}%, not 100%.'))

    seen_ids: set[str] = set()
    for learner in learners:
        lid = str(learner.learner_id).strip()
        if not lid:
            checks.append(Check('error', 'A learner has no learner number or initials.'))
            continue
        if lid in seen_ids:
            checks.append(Check('error', f'Learner "{lid}" appears more than once.', lid))
        seen_ids.add(lid)

        for a in assessments:
            label = a.name.strip()
            raw = learner.marks.get(label)
            if isinstance(raw, str) and raw.strip().lower() in ABSENT_WORDS:
                # Absent or not taken: recorded, but counted as missing for the term mark.
                checks.append(Check('warning', f'{lid}: "{label}" is marked absent, so no term mark is calculated.', lid))
                continue
            if raw is None or (isinstance(raw, str) and not raw.strip()):
                checks.append(Check('warning', f'{lid}: no mark for "{label}", so no term mark is calculated.', lid))
                continue
            mark = _decimal(raw)
            if mark is None:
                checks.append(Check('error', f'{lid}: "{raw}" in "{label}" is not a number.', lid))
                continue
            max_mark = _decimal(a.max_mark)
            if max_mark and mark < 0:
                checks.append(Check('error', f'{lid}: mark in "{label}" is negative.', lid))
            elif max_mark and mark > max_mark:
                checks.append(Check('error', f'{lid}: mark {mark} in "{label}" is above the maximum of {max_mark}.', lid))
    return checks


def calculate(assessments: list[Assessment], learner: Learner) -> dict[str, Any]:
    """Return per-assessment percentages, the term mark and the CAPS level for one learner."""
    percentages: dict[str, Decimal | None] = {}
    weighted_sum = Decimal(0)
    complete = True
    for a in assessments:
        label = a.name.strip()
        mark = _decimal(learner.marks.get(label))
        max_mark = _decimal(a.max_mark)
        weight = _decimal(a.weight) or Decimal(0)
        if mark is None or not max_mark or max_mark <= 0 or mark < 0 or mark > max_mark:
            percentages[label] = None
            if weight > 0:
                complete = False
            continue
        pct = (mark / max_mark * 100).quantize(Decimal('0.01'))
        percentages[label] = pct
        weighted_sum += pct * weight

    term_mark = None
    level = None
    if complete:
        term_mark = (weighted_sum / 100).quantize(Decimal('0.01'))
        level = percentage_to_caps_level(str(term_mark))
    return {'percentages': percentages, 'term_mark': term_mark, 'caps_level': level}


def build_rows(assessments: list[Assessment], learners: list[Learner]) -> list[dict[str, Any]]:
    rows = []
    for learner in learners:
        result = calculate(assessments, learner)
        row: dict[str, Any] = {'Learner': str(learner.learner_id).strip()}
        for a in assessments:
            label = a.name.strip()
            raw = learner.marks.get(label)
            row[label] = _decimal(raw) if _decimal(raw) is not None else (raw if raw is not None else '')
        row['Term mark %'] = float(result['term_mark']) if result['term_mark'] is not None else ''
        row['CAPS level'] = result['caps_level'] if result['caps_level'] is not None else ''
        rows.append(row)
    return rows


def export_xlsx(path, assessments: list[Assessment], learners: list[Learner]) -> list[Check]:
    """Write the gradebook to an .xlsx file. Refuses to export if any check is an error."""
    from openpyxl import Workbook
    from openpyxl.styles import Font, PatternFill

    checks = validate(assessments, learners)
    if any(c.level == 'error' for c in checks):
        raise ValueError('Export blocked: fix the errors first.')

    rows = build_rows(assessments, learners)
    wb = Workbook()
    ws = wb.active
    ws.title = 'Marks'
    headers = list(rows[0].keys()) if rows else ['Learner']
    ws.append(headers)
    for cell in ws[1]:
        cell.font = Font(bold=True, color='FFFFFF')
        cell.fill = PatternFill('solid', fgColor='4E6B4A')
    for row in rows:
        ws.append([row.get(h, '') for h in headers])
    ws.freeze_panes = 'B2'

    notes = wb.create_sheet('Checks')
    notes.append(['Level', 'Message'])
    if checks:
        for c in checks:
            notes.append([c.level, c.message])
    else:
        notes.append(['ok', 'No problems found.'])

    wb.save(path)
    return checks
