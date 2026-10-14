from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, field_validator


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid')


class Rule(StrictModel):
    id: str
    kind: Literal['required', 'unique', 'nonnegative', 'sum', 'allowed', 'min', 'max', 'aggregate', 'numeric', 'integer']
    fields: list[str]
    value: str = ''
    evidence: str = ''


class Question(StrictModel):
    id: str
    text: str
    evidence: str = ''
    kind: Literal['mapping', 'rule', 'data', 'conflict', 'unsupported'] = 'mapping'
    options: list[str] = Field(default_factory=list)


class DestinationPlan(StrictModel):
    sheet: str
    header_row: int = Field(ge=1, le=20000)
    mode: Literal['pivot', 'long', 'direct']
    key: str
    period: str = ''
    value: str = ''
    categories: list[str] = Field(default_factory=list)
    total: str = ''


class SourcePlan(StrictModel):
    source_id: str
    sheet: str
    header_row: int = Field(ge=1, le=20000)
    layout: Literal['long', 'matrix', 'wide', 'direct', 'cells']
    key: str = ''
    period: str = ''
    value: str = ''
    columns: list[str] = Field(default_factory=list)
    field_map: dict[str, str] = Field(default_factory=dict)
    ignored_columns: dict[str, str] = Field(default_factory=dict)
    field_labels: dict[str, str] = Field(default_factory=dict)
    ignored_cells: dict[str, str] = Field(default_factory=dict)


class MappingPlan(StrictModel):
    schema_version: Literal[1] = 1
    destination: DestinationPlan
    sources: list[SourcePlan]
    rules: list[Rule] = Field(default_factory=list)
    questions: list[Question] = Field(default_factory=list)
    unsupported_rules: list[str] = Field(default_factory=list)


class AISettings(StrictModel):
    enabled: bool = False
    provider: Literal['openai_compatible', 'anthropic'] = 'openai_compatible'
    base_url: str = ''
    model: str = ''
    monthly_budget_usd: str = '0'
    input_price_per_million_usd: str = '0'
    output_price_per_million_usd: str = '0'
    pricing_verified_date: str = ''
    pricing_source_url: str = ''
    max_output_tokens: int = Field(default=4000, ge=256, le=12000)
    timeout_seconds: int = Field(default=75, ge=10, le=120)
    auto_learn: bool = True

    @field_validator('monthly_budget_usd', 'input_price_per_million_usd', 'output_price_per_million_usd')
    @classmethod
    def nonnegative_decimal(cls, value: str) -> str:
        try:
            number = Decimal(value)
            if not number.is_finite() or number < 0:
                raise ValueError('Use a finite, non-negative decimal amount.')
        except InvalidOperation as exc:
            raise ValueError('Use a decimal amount, such as 0 or 2.50.') from exc
        return str(number)


class SettingsUpdate(AISettings):
    api_key: str | None = Field(default=None, max_length=1000)
    clear_key: bool = False


class DemoRequest(StrictModel):
    case: Literal['pivot', 'unpivot', 'hold', 'direct', 'form'] = 'pivot'
    request_id: str = Field(min_length=8, max_length=100)


class RunRequest(StrictModel):
    use_workbook_rules: bool = False


class PlanUpdate(StrictModel):
    plan: MappingPlan
    confirmation: str = Field(min_length=8, max_length=2000)


class ClarificationInput(StrictModel):
    text: str = Field(min_length=2, max_length=4000)


class AIRequest(StrictModel):
    consent_to_external_processing: bool = False
    request_id: str = Field(min_length=8, max_length=100)


class Check(StrictModel):
    id: str
    name: str
    passed: bool
    detail: str


class Report(StrictModel):
    status: Literal['RELEASED', 'HELD']
    checks: list[Check]
    questions: list[Question]
    rows: list[dict]
    headers: list[str]
    source_records: int
    mapped_records: int
    output_rows: int
    provenance: list[dict]
    exclusions: list[dict]
    mapping_origin: str
    template_version: str
    trace_id: str
    passed_checks: int
    total_checks: int
    output_sha256: str = ''
    note: str = 'Passed checks validate the defined rules, not unknown business meaning.'
