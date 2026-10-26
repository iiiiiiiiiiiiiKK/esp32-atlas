-- ESP32 Atlas — schema (SQLite 3 / Cloudflare D1 compatible)
-- Editorial content is stored as JSON documents (i18n aware) so that the
-- automated GitHub sync never overwrites human-curated fields.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS repositories (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                TEXT NOT NULL UNIQUE,
  owner               TEXT NOT NULL,
  name                TEXT NOT NULL,
  full_name           TEXT NOT NULL UNIQUE,
  html_url            TEXT NOT NULL,
  homepage            TEXT,
  description         TEXT,
  summary_i18n        TEXT,                -- {"zh":"..","en":".."} curated, never overwritten by sync
  topics              TEXT NOT NULL DEFAULT '[]',
  language            TEXT,
  license             TEXT,
  stars               INTEGER NOT NULL DEFAULT 0,
  forks               INTEGER NOT NULL DEFAULT 0,
  open_issues         INTEGER NOT NULL DEFAULT 0,
  created_at          TEXT,
  updated_at          TEXT,
  pushed_at           TEXT,
  default_branch      TEXT,
  archived            INTEGER NOT NULL DEFAULT 0,
  disabled            INTEGER NOT NULL DEFAULT 0,
  latest_release_tag  TEXT,
  latest_release_at   TEXT,
  latest_release_url  TEXT,
  category            TEXT,
  chips               TEXT NOT NULL DEFAULT '[]',
  frameworks          TEXT NOT NULL DEFAULT '[]',
  difficulty          TEXT,
  doc_score           INTEGER,
  demo_score          INTEGER,
  beginner_friendly   INTEGER NOT NULL DEFAULT 0,
  tags                TEXT NOT NULL DEFAULT '[]',
  featured            INTEGER NOT NULL DEFAULT 0,
  curation_status     TEXT NOT NULL DEFAULT 'published', -- published | pending | rejected
  data_origin         TEXT NOT NULL DEFAULT 'github',    -- github | demo
  first_seen_at       TEXT NOT NULL,
  last_synced_at      TEXT,
  sync_status         TEXT NOT NULL DEFAULT 'ok',        -- ok | stale | failed
  sync_error          TEXT,
  source_verified_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_repositories_stars ON repositories(stars DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_pushed ON repositories(pushed_at DESC);
CREATE INDEX IF NOT EXISTS idx_repositories_category ON repositories(category);
CREATE INDEX IF NOT EXISTS idx_repositories_curation ON repositories(curation_status, difficulty);

CREATE TABLE IF NOT EXISTS repository_snapshots (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id  INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  captured_at    TEXT NOT NULL,
  stars          INTEGER NOT NULL,
  forks          INTEGER NOT NULL,
  open_issues    INTEGER NOT NULL,
  UNIQUE(repository_id, captured_at)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_repo ON repository_snapshots(repository_id, captured_at);

CREATE TABLE IF NOT EXISTS project_guides (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  repository_id      INTEGER NOT NULL UNIQUE REFERENCES repositories(id) ON DELETE CASCADE,
  content            TEXT NOT NULL,
  confidence         TEXT NOT NULL DEFAULT 'verified',
  editorial_updated  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tutorials (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  title_i18n      TEXT NOT NULL,
  url             TEXT NOT NULL,
  source          TEXT NOT NULL,
  author          TEXT,
  lang            TEXT NOT NULL,
  difficulty      TEXT NOT NULL,
  topics          TEXT NOT NULL DEFAULT '[]',
  chips           TEXT NOT NULL DEFAULT '[]',
  frameworks      TEXT NOT NULL DEFAULT '[]',
  goal_i18n       TEXT,
  related_repos   TEXT NOT NULL DEFAULT '[]',
  verified_at     TEXT,
  check_status    TEXT NOT NULL DEFAULT 'unverified',
  data_origin     TEXT NOT NULL DEFAULT 'manual',
  published_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_tutorials_lang ON tutorials(lang, difficulty);

CREATE TABLE IF NOT EXISTS chips (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  family         TEXT NOT NULL,
  cores          TEXT,
  clock          TEXT,
  sram           TEXT,
  flash          TEXT,
  wifi           TEXT,
  ble            TEXT,
  thread_zigbee  TEXT,
  usb            TEXT,
  camera         TEXT,
  display        TEXT,
  use_cases_i18n TEXT,
  boards         TEXT NOT NULL DEFAULT '[]',
  official_url   TEXT,
  confidence     TEXT NOT NULL DEFAULT 'verified',
  verified_at    TEXT
);

CREATE TABLE IF NOT EXISTS learning_paths (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title_i18n   TEXT NOT NULL,
  summary_i18n TEXT NOT NULL,
  level        TEXT NOT NULL,
  hours        TEXT,
  chips        TEXT NOT NULL DEFAULT '[]',
  frameworks   TEXT NOT NULL DEFAULT '[]',
  icon         TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS learning_path_steps (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  path_id      INTEGER NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  step_no      INTEGER NOT NULL,
  title_i18n   TEXT NOT NULL,
  goal_i18n    TEXT NOT NULL,
  prereq_i18n  TEXT,
  resources    TEXT NOT NULL DEFAULT '[]',
  projects     TEXT NOT NULL DEFAULT '[]',
  estimate     TEXT,
  done_when_i18n TEXT,
  UNIQUE(path_id, step_no)
);

CREATE TABLE IF NOT EXISTS tags (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  slug      TEXT NOT NULL UNIQUE,
  label_i18n TEXT NOT NULL,
  kind      TEXT NOT NULL DEFAULT 'topic'
);

CREATE TABLE IF NOT EXISTS repository_tags (
  repository_id INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  tag_id        INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (repository_id, tag_id)
);

CREATE TABLE IF NOT EXISTS project_submissions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_url      TEXT NOT NULL,
  full_name     TEXT,
  note_i18n     TEXT,
  submitter_ip  TEXT,
  status        TEXT NOT NULL DEFAULT 'pending',
  reject_reason TEXT,
  github_check  TEXT,
  created_at    TEXT NOT NULL,
  reviewed_at   TEXT,
  reviewed_by   TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON project_submissions(status, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TEXT NOT NULL,
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_jobs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at  TEXT NOT NULL,
  finished_at TEXT,
  trigger     TEXT NOT NULL,
  status      TEXT NOT NULL,
  total       INTEGER NOT NULL DEFAULT 0,
  updated     INTEGER NOT NULL DEFAULT 0,
  failed      INTEGER NOT NULL DEFAULT 0,
  message     TEXT,
  rate_limit  TEXT
);

CREATE TABLE IF NOT EXISTS content_sources (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  kind        TEXT NOT NULL,
  lang        TEXT NOT NULL,
  note_i18n   TEXT,
  verified_at TEXT
);

CREATE TABLE IF NOT EXISTS submit_rate_limit (
  ip_hash   TEXT NOT NULL,
  window_at TEXT NOT NULL,
  count     INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, window_at)
);
