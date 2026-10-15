import sqlite3

import pytest

from sheetqms.store import Store


# The AI mapping, knowledge base and their tests have been removed.
# Only the append-only audit store check remains.

def test_events_are_append_only(tmp_path):
    store = Store(tmp_path / 'store')
    store.event('job', 'trace', 'test', {})
    with store.connect() as db:
        with pytest.raises(sqlite3.IntegrityError):
            db.execute('UPDATE events SET kind="changed"')
        with pytest.raises(sqlite3.IntegrityError):
            db.execute('DELETE FROM events')
