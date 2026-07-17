-- Public portfolio content: anyone may read, only the admin may write.
--
-- Previously every `authenticated` user could insert/update/delete, which means
-- anyone who signs up with the public anon key gains write access. Writes are
-- now gated on the admin's email claim instead of merely being signed in.

-- ─── 1. Admin check ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
  RETURNS BOOLEAN
  LANGUAGE SQL
  STABLE
  SET search_path = ''
AS $$
  SELECT COALESCE((SELECT auth.jwt() ->> 'email') = 'ting7169133@gmail.com', FALSE);
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ─── 2. Notes table ──────────────────────────────────────────────────────────
-- Present in the live database but absent from supabase_setup.sql; created here
-- so the schema is reproducible from migrations.
CREATE TABLE IF NOT EXISTS public.notes (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title      TEXT        NOT NULL,
  date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  tags       TEXT[]      DEFAULT '{}',
  summary    TEXT,
  content    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Row Level Security ───────────────────────────────────────────────────
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes    ENABLE ROW LEVEL SECURITY;

-- Drop the permissive policies from supabase_setup.sql, plus any earlier run of
-- this migration, so re-applying is idempotent.
DROP POLICY IF EXISTS "Public read"        ON public.projects;
DROP POLICY IF EXISTS "Auth insert"        ON public.projects;
DROP POLICY IF EXISTS "Auth update"        ON public.projects;
DROP POLICY IF EXISTS "Auth delete"        ON public.projects;
DROP POLICY IF EXISTS "Public read posts"  ON public.posts;
DROP POLICY IF EXISTS "Auth insert posts"  ON public.posts;
DROP POLICY IF EXISTS "Auth update posts"  ON public.posts;
DROP POLICY IF EXISTS "Auth delete posts"  ON public.posts;
DROP POLICY IF EXISTS "Public read notes"  ON public.notes;
DROP POLICY IF EXISTS "Auth insert notes"  ON public.notes;
DROP POLICY IF EXISTS "Auth update notes"  ON public.notes;
DROP POLICY IF EXISTS "Auth delete notes"  ON public.notes;

DROP POLICY IF EXISTS "projects_public_read"  ON public.projects;
DROP POLICY IF EXISTS "projects_admin_insert" ON public.projects;
DROP POLICY IF EXISTS "projects_admin_update" ON public.projects;
DROP POLICY IF EXISTS "projects_admin_delete" ON public.projects;
DROP POLICY IF EXISTS "posts_public_read"     ON public.posts;
DROP POLICY IF EXISTS "posts_admin_insert"    ON public.posts;
DROP POLICY IF EXISTS "posts_admin_update"    ON public.posts;
DROP POLICY IF EXISTS "posts_admin_delete"    ON public.posts;
DROP POLICY IF EXISTS "notes_public_read"     ON public.notes;
DROP POLICY IF EXISTS "notes_admin_insert"    ON public.notes;
DROP POLICY IF EXISTS "notes_admin_update"    ON public.notes;
DROP POLICY IF EXISTS "notes_admin_delete"    ON public.notes;

-- projects
CREATE POLICY "projects_public_read"  ON public.projects FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "projects_admin_insert" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "projects_admin_update" ON public.projects FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "projects_admin_delete" ON public.projects FOR DELETE TO authenticated USING (public.is_admin());

-- posts
CREATE POLICY "posts_public_read"  ON public.posts FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "posts_admin_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "posts_admin_update" ON public.posts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "posts_admin_delete" ON public.posts FOR DELETE TO authenticated USING (public.is_admin());

-- notes
CREATE POLICY "notes_public_read"  ON public.notes FOR SELECT TO anon, authenticated USING (TRUE);
CREATE POLICY "notes_admin_insert" ON public.notes FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "notes_admin_update" ON public.notes FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "notes_admin_delete" ON public.notes FOR DELETE TO authenticated USING (public.is_admin());

-- ─── 4. Storage ──────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

DROP POLICY IF EXISTS "Public read storage"    ON storage.objects;
DROP POLICY IF EXISTS "Auth upload storage"    ON storage.objects;
DROP POLICY IF EXISTS "Auth delete storage"    ON storage.objects;
DROP POLICY IF EXISTS "project_images_read"    ON storage.objects;
DROP POLICY IF EXISTS "project_images_insert"  ON storage.objects;
DROP POLICY IF EXISTS "project_images_update"  ON storage.objects;
DROP POLICY IF EXISTS "project_images_delete"  ON storage.objects;

CREATE POLICY "project_images_read"   ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'project-images');
CREATE POLICY "project_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-images' AND public.is_admin());
CREATE POLICY "project_images_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-images' AND public.is_admin()) WITH CHECK (bucket_id = 'project-images' AND public.is_admin());
CREATE POLICY "project_images_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-images' AND public.is_admin());
