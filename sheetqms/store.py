from __future__ import annotations

import hashlib
import json
import os
import sqlite3
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from decimal import Decimal, ROUND_CEILING


def now():
    return datetime.now(timezone.utc).isoformat()


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'), default=str)


def digest(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()


def microdollars(value: str):
    return int((Decimal(value) * 1_000_000).to_integral_value(rounding=ROUND_CEILING))


class Store:
    def __init__(self, directory: Path):
        self.directory = directory
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        try:
            os.chmod(directory, 0o700)
        except OSError:
            pass  # Windows permissions follow the user's private profile directory.
        self.path = directory / 'state.sqlite3'
        self.lock = threading.RLock()
        with self.connect() as db:
            db.executescript('''
                CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, data TEXT NOT NULL, created TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, job_id TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
                CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT, trace_id TEXT NOT NULL, kind TEXT NOT NULL, data TEXT NOT NULL, created TEXT NOT NULL);
                CREATE TRIGGER IF NOT EXISTS no_event_update BEFORE UPDATE ON events BEGIN SELECT RAISE(ABORT,'Events are append-only'); END;
                CREATE TRIGGER IF NOT EXISTS no_event_delete BEFORE DELETE ON events BEGIN SELECT RAISE(ABORT,'Events are append-only'); END;
                CREATE TABLE IF NOT EXISTS knowledge (id TEXT PRIMARY KEY, family TEXT NOT NULL, version TEXT NOT NULL, input_signature TEXT NOT NULL, plan_hash TEXT NOT NULL, data TEXT NOT NULL, created TEXT NOT NULL, UNIQUE(version,input_signature,plan_hash));
                CREATE TABLE IF NOT EXISTS knowledge_heads (scope TEXT PRIMARY KEY, knowledge_id TEXT NOT NULL);
                CREATE TRIGGER IF NOT EXISTS no_knowledge_update BEFORE UPDATE ON knowledge BEGIN SELECT RAISE(ABORT,'Knowledge revisions are immutable'); END;
                CREATE TRIGGER IF NOT EXISTS no_knowledge_delete BEFORE DELETE ON knowledge BEGIN SELECT RAISE(ABORT,'Knowledge revisions are immutable'); END;
                CREATE TABLE IF NOT EXISTS spend (request_id TEXT PRIMARY KEY, month TEXT NOT NULL, reserved INTEGER NOT NULL, actual INTEGER, created TEXT NOT NULL);
            ''')

    def connect(self):
        db = sqlite3.connect(self.path, timeout=30)
        db.row_factory = sqlite3.Row
        db.execute('PRAGMA journal_mode=WAL')
        db.execute('PRAGMA foreign_keys=ON')
        return db

    def event(self, job_id, trace_id, kind, data):
        with self.lock, self.connect() as db:
            db.execute('INSERT INTO events(job_id,trace_id,kind,data,created) VALUES(?,?,?,?,?)', (job_id, trace_id, kind, canonical(data), now()))

    def save_job(self, job, kind, detail=None):
        with self.lock, self.connect() as db:
            db.execute('INSERT INTO jobs(id,data,created) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', (job['id'], canonical(job), job['created']))
            db.execute('INSERT INTO events(job_id,trace_id,kind,data,created) VALUES(?,?,?,?,?)', (job['id'], job['trace_id'], kind, canonical(detail or {'state': job['state']}), now()))

    def job(self, job_id):
        with self.connect() as db:
            row = db.execute('SELECT data FROM jobs WHERE id=?', (job_id,)).fetchone()
            return json.loads(row['data']) if row else None

    def jobs(self):
        with self.connect() as db:
            rows = db.execute('SELECT data FROM jobs ORDER BY created DESC LIMIT 30').fetchall()
            return [json.loads(row['data']) for row in rows]

    def request_job(self, request_id):
        with self.connect() as db:
            row = db.execute('SELECT job_id FROM requests WHERE id=?', (request_id,)).fetchone()
            return row['job_id'] if row else None

    def link_request(self, request_id, job_id):
        with self.lock, self.connect() as db:
            db.execute('INSERT OR IGNORE INTO requests(id,job_id) VALUES(?,?)', (request_id, job_id))
            return db.execute('SELECT job_id FROM requests WHERE id=?', (request_id,)).fetchone()['job_id']

    def settings(self):
        with self.connect() as db:
            row = db.execute('SELECT data FROM settings WHERE id=1').fetchone()
            return json.loads(row['data']) if row else {}

    def save_settings(self, settings, trace_id):
        with self.lock, self.connect() as db:
            db.execute('INSERT INTO settings(id,data) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data', (canonical(settings),))
            db.execute('INSERT INTO events(job_id,trace_id,kind,data,created) VALUES(NULL,?,?,?,?)', (trace_id, 'settings_updated', canonical({'enabled': settings.get('enabled'), 'auto_learn': settings.get('auto_learn')}), now()))

    def knowledge(self):
        with self.connect() as db:
            heads = {row['scope']: row['knowledge_id'] for row in db.execute('SELECT * FROM knowledge_heads').fetchall()}
            result = []
            for row in db.execute('SELECT data FROM knowledge ORDER BY created DESC').fetchall():
                item = json.loads(row['data'])
                item['active'] = heads.get(digest([item['version'], item['input_signature']])) == item['id']
                result.append(item)
            return result

    def learn(self, item):
        with self.lock, self.connect() as db:
            plan_hash = digest({'plan': item['plan'], 'bindings': item['bindings']})
            existing = db.execute('SELECT id FROM knowledge WHERE version=? AND input_signature=? AND plan_hash=?', (item['version'], item['input_signature'], plan_hash)).fetchone()
            if existing:
                knowledge_id = existing['id']
            else:
                knowledge_id = str(uuid.uuid4())
                item = dict(item) | {'id': knowledge_id, 'created': now(), 'plan_hash': plan_hash}
                db.execute('INSERT INTO knowledge(id,family,version,input_signature,plan_hash,data,created) VALUES(?,?,?,?,?,?,?)', (knowledge_id, item['family'], item['version'], item['input_signature'], plan_hash, canonical(item), item['created']))
                db.execute('INSERT INTO events(job_id,trace_id,kind,data,created) VALUES(?,?,?,?,?)', (item['job_id'], item['trace_id'], 'knowledge_added', canonical({'knowledge_id': knowledge_id, 'version': item['version']}), now()))
            scope = digest([item['version'], item['input_signature']])
            head = db.execute('SELECT knowledge_id FROM knowledge_heads WHERE scope=?', (scope,)).fetchone()
            if not head or head['knowledge_id'] != knowledge_id:
                db.execute('INSERT INTO knowledge_heads(scope,knowledge_id) VALUES(?,?) ON CONFLICT(scope) DO UPDATE SET knowledge_id=excluded.knowledge_id', (scope, knowledge_id))
                db.execute('INSERT INTO events(job_id,trace_id,kind,data,created) VALUES(?,?,?,?,?)', (item['job_id'], item['trace_id'], 'knowledge_activated', canonical({'knowledge_id': knowledge_id, 'previous_id': head['knowledge_id'] if head else None}), now()))
            return knowledge_id

    def events(self, job_id):
        with self.connect() as db:
            return [dict(row) | {'data': json.loads(row['data'])} for row in db.execute('SELECT * FROM events WHERE job_id=? ORDER BY id', (job_id,)).fetchall()]

    def spent(self, month=None):
        month = month or datetime.now(timezone.utc).strftime('%Y-%m')
        with self.connect() as db:
            row = db.execute('SELECT COALESCE(SUM(COALESCE(actual,reserved)),0) AS amount FROM spend WHERE month=?', (month,)).fetchone()
            return int(row['amount'])

    def reserve(self, request_id, reserved: int, budget: int):
        month = datetime.now(timezone.utc).strftime('%Y-%m')
        with self.lock, self.connect() as db:
            db.execute('BEGIN IMMEDIATE')
            prior = db.execute('SELECT request_id FROM spend WHERE request_id=?', (request_id,)).fetchone()
            if prior:
                raise ValueError('This paid request already has a reservation. Do not retry it automatically.')
            used = db.execute('SELECT COALESCE(SUM(COALESCE(actual,reserved)),0) AS amount FROM spend WHERE month=?', (month,)).fetchone()['amount']
            if budget <= 0 or used + reserved > budget:
                raise ValueError('Monthly app budget would be exceeded. AI remains paused.')
            db.execute('INSERT INTO spend(request_id,month,reserved,created) VALUES(?,?,?,?)', (request_id, month, reserved, now()))
            db.execute('INSERT INTO events(job_id,trace_id,kind,data,created) VALUES(NULL,?,?,?,?)', (request_id, 'budget_reserved', canonical({'reserved_micro_usd': reserved, 'month': month}), now()))

    def settle(self, request_id, actual: int):
        with self.lock, self.connect() as db:
            db.execute('UPDATE spend SET actual=? WHERE request_id=?', (actual, request_id))
            db.execute('INSERT INTO events(job_id,trace_id,kind,data,created) VALUES(NULL,?,?,?,?)', (request_id, 'budget_settled', canonical({'actual_micro_usd': actual}), now()))
