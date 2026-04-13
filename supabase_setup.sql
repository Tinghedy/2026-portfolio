-- ─── 1. Projects table ───────────────────────────────────────────────────────
CREATE TABLE projects (
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

-- ─── 2. Row Level Security ────────────────────────────────────────────────────
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Anyone can read
CREATE POLICY "Public read"
  ON projects FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can insert / update / delete
CREATE POLICY "Auth insert"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth update"
  ON projects FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Auth delete"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- ─── 3. Storage bucket ───────────────────────────────────────────────────────
-- Run this in the SQL editor (or create the bucket manually in the Storage UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT DO NOTHING;

-- Public read for storage
CREATE POLICY "Public read storage"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'project-images');

-- Authenticated upload
CREATE POLICY "Auth upload storage"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-images');

-- Authenticated delete
CREATE POLICY "Auth delete storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-images');
