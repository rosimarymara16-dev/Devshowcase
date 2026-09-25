CREATE TABLE IF NOT EXISTS profiles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL UNIQUE,
  bio         TEXT,
  github_url  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS technologies (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  category    TEXT
);

CREATE TABLE IF NOT EXISTS projects (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  profile_id      INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           TEXT    NOT NULL,
  description     TEXT,
  repository_url  TEXT    NOT NULL,
  demo_url        TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Tabela de junção do relacionamento N:N entre Project e Technology
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id     INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id  INTEGER NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

CREATE TABLE IF NOT EXISTS feedbacks (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_name  TEXT    NOT NULL,
  comment      TEXT    NOT NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);
