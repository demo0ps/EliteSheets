import os
import uuid
from pathlib import Path

os.environ['SHEETQMS_DEMO'] = '1'
import tempfile
os.environ['SHEETQMS_DATA_DIR'] = str(Path(tempfile.gettempdir()) / 'sheetqms-test-bootstrap')

import pytest
from sheetqms.samples import create_samples, sample_case
from sheetqms.workbooks import profile
from sheetqms.store import now


@pytest.fixture
def samples(tmp_path):
    folder = tmp_path / 'samples'
    create_samples(folder)
    return folder


def make_job(folder: Path, case='pivot'):
    template, sources = sample_case(folder, case)
    return {
        'id': str(uuid.uuid4()), 'trace_id': str(uuid.uuid4()), 'created': now(),
        'files': {'template': {'id': 'template', 'name': template.name, 'path': str(template)}, 'sources': [{'id': f'source-{i+1}', 'name': source.name, 'path': str(source)} for i, source in enumerate(sources)]},
        'profiles': {'template': profile(template, 'template', template=True), 'sources': [profile(source, f'source-{i+1}') for i, source in enumerate(sources)]},
        'clarifications': [], 'mapping_origin': 'rule-informed layout resolver',
    }
