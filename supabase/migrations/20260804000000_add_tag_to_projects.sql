-- Add an optional cover-badge label to portfolio projects.
-- Rendered at the top-right of the WorkCard cover; NULL = no badge.
--
-- Note: the app's "Works" UI is backed by the `projects` table (see
-- src/pages/Works/Works.jsx → .from("projects")). There is no `works`
-- table, so the column is added to `projects`.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT NULL;
