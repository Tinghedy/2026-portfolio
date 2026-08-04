-- Per-project cover-badge color (hex), paired with projects.tag.
-- NULL falls back to the default #D8FF3E in the UI (see CoverTag.jsx).

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS tag_color TEXT DEFAULT NULL;
