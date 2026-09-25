CREATE TABLE IF NOT EXISTS profiles (
  id          SERIAL       PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(254) NOT NULL,
  bio         TEXT,
  github_url  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- E-mail único sem diferenciar maiúsculas/minúsculas
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_lower_key ON profiles (LOWER(email));

CREATE TABLE IF NOT EXISTS technologies (
  id        SERIAL      PRIMARY KEY,
  name      VARCHAR(60) NOT NULL,
  category  VARCHAR(60)
);

-- Nome de tecnologia único sem diferenciar maiúsculas/minúsculas
CREATE UNIQUE INDEX IF NOT EXISTS technologies_name_lower_key ON technologies (LOWER(name));

CREATE TABLE IF NOT EXISTS projects (
  id              SERIAL       PRIMARY KEY,
  profile_id      INTEGER      NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title           VARCHAR(150) NOT NULL,
  description     TEXT,
  repository_url  TEXT         NOT NULL,
  demo_url        TEXT,
  upvotes         INTEGER      NOT NULL DEFAULT 0,
  average_rating  NUMERIC(3,2),  -- fica NULL até o primeiro feedback
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_profile_id_idx ON projects (profile_id);

-- Tabela de junção do relacionamento N:N entre Project e Technology
CREATE TABLE IF NOT EXISTS project_technologies (
  project_id     INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  technology_id  INTEGER NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, technology_id)
);

CREATE INDEX IF NOT EXISTS project_technologies_technology_id_idx ON project_technologies (technology_id);

CREATE TABLE IF NOT EXISTS feedbacks (
  id           SERIAL       PRIMARY KEY,
  project_id   INTEGER      NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  author_name  VARCHAR(120) NOT NULL,
  comment      VARCHAR(1000) NOT NULL,
  rating       INTEGER      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedbacks_project_id_idx ON feedbacks (project_id);
