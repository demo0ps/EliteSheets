from typing import Literal
from pydantic import Field, field_validator
from .models import StrictModel, SettingsUpdate, MappingPlan


VerticalType = Literal['general', 'education', 'sme_pa', 'finance_hr', 'supply_chain']


class Login(StrictModel):
    email: str = Field(min_length=3, max_length=180)
    password: str = Field(min_length=1, max_length=256)


class Signup(StrictModel):
    name: str = Field(min_length=2, max_length=100)
    display_name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=180)
    password: str = Field(min_length=8, max_length=256)
    vertical: VerticalType = 'general'


class DemoLogin(StrictModel):
    role: Literal['operator', 'admin', 'other_customer'] = 'operator'
    vertical: VerticalType | None = None


class Preferences(StrictModel):
    theme: Literal['dark', 'light'] = 'light'
    density: Literal['comfortable', 'compact'] = 'comfortable'
    explanations: Literal['concise', 'detailed'] = 'detailed'
    auto_checks: bool = True
    vertical: VerticalType = 'general'


class PlatformSettings(SettingsUpdate):
    platform_budget_usd: str = '0'
    max_storage_mib_per_customer: int = Field(default=250, ge=50, le=10000)
    max_jobs_per_customer: int = Field(default=100, ge=5, le=1000)
    @field_validator('platform_budget_usd')
    @classmethod
    def budget(cls, value):
        from decimal import Decimal
        number = Decimal(value)
        if not number.is_finite() or not 0 <= number <= 100000:
            raise ValueError('Use a finite nonnegative USD amount, at most 100000.')
        return str(number)


class CustomerCreate(StrictModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=180)
    display_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=12, max_length=256)
    vertical: VerticalType = 'general'


class ChatInput(StrictModel):
    text: str = Field(min_length=1, max_length=4000)
    request_id: str = Field(min_length=8, max_length=100)


class ProposalConfirm(StrictModel):
    proposal_id: str
    request_id: str = Field(min_length=8, max_length=100)


class Run(StrictModel):
    use_workbook_rules: bool = False


class Analyse(StrictModel):
    consent_to_external_processing: bool = False
    request_id: str = Field(min_length=8, max_length=100)


class PlanConfirm(StrictModel):
    plan: MappingPlan
    confirmation: str = Field(min_length=8, max_length=2000)
