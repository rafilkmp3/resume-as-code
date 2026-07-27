-- Chat log corpus — every conversation turn with full metadata, so the
-- self-improvement loop (analyze-logs → eval/questions.json → hero cards)
-- reads real production history instead of guesses.
--
-- Privacy invariants (do not weaken silently):
--   * NO IP address, no fingerprint. session_id is a client-generated random
--     UUID living in sessionStorage — per-tab, dies on close, never cross-visit.
--   * Geo/network columns are request.cf coarse signals (country, city,
--     AS organization): company-level, never person-level.
--   * Retention is enforced by the Worker's scheduled handler: age purge
--     (RETENTION_DAYS) + size watermark fuse. "Forever" is not a policy.

CREATE TABLE chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  session_id TEXT,             -- groups one recruiter conversation (per-tab UUID)
  turn INTEGER,                -- 1-based position within the session's thread
  source TEXT,                 -- 'typed' | 'card' | 'retry' (anti feedback-loop tag)
  q TEXT NOT NULL,
  reply TEXT,                  -- truncated server-side (REPLY_LOG_MAX)
  reply_len INTEGER,           -- full length even when reply is truncated
  model TEXT,
  ms INTEGER,
  cached INTEGER NOT NULL DEFAULT 0,
  degraded INTEGER NOT NULL DEFAULT 0,
  gateway INTEGER NOT NULL DEFAULT 0,
  history_len INTEGER,
  geo_country TEXT,
  geo_city TEXT,
  network_org TEXT,            -- request.cf.asOrganization ("Google LLC" beats an IP)
  turnstile TEXT               -- 'pass' | 'fail' | 'off'
);

CREATE INDEX idx_chats_ts ON chats (ts);
CREATE INDEX idx_chats_session ON chats (session_id);

CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  session_id TEXT,
  verdict TEXT NOT NULL,       -- 'up' | 'down'
  question TEXT,
  reply TEXT
);

CREATE INDEX idx_feedback_ts ON feedback (ts);
