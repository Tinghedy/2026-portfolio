-- Metadata fields written by the admin ProjectForm (src/pages/admin/ProjectForm.jsx)
-- but missing from the database, so saving a project fails with
-- "Could not find the 'role' / 'team' / 'link' column of 'projects'".

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS team TEXT,
  ADD COLUMN IF NOT EXISTS link TEXT;
