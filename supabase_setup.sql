-- ⚠️  Tables only. RLS policies live in supabase/migrations/ and are applied with
--     `supabase db push`. Do not add policies here — an older copy of this file
--     granted every authenticated user write access, and re-running it would
--     silently undo the admin-only policies.

-- ─── 1. Projects ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title         TEXT        NOT NULL,
  description   TEXT,
  cover_image   TEXT,
  images        TEXT[]      DEFAULT '{}',
  tags          TEXT[]      DEFAULT '{}',
  year          INTEGER,
  order_index   INTEGER     DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Posts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug        TEXT        NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  summary     TEXT,
  content     TEXT,
  cover_image TEXT,
  tags        TEXT[]      DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Notes ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT        NOT NULL,
  date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  tags       TEXT[]      DEFAULT '{}',
  summary    TEXT,
  content    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Storage bucket ───────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', TRUE)
ON CONFLICT (id) DO NOTHING;
