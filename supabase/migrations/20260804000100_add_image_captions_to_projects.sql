-- Per-image captions, parallel to projects.images.
-- The admin ProjectForm writes this column (src/pages/admin/ProjectForm.jsx)
-- and WorkDetail reads it (src/pages/Works/WorkDetail.jsx), but the column was
-- never added to the database — saving a project fails with
-- "Could not find the 'image_captions' column of 'projects'".

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS image_captions TEXT[] DEFAULT '{}';
