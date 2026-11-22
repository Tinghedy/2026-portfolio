-- Per-project cursor tooltip on the Works grid (see CursorTooltip.jsx).
-- NULL / empty = no tooltip. "\n" (a real line break) splits lines.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS hover_text TEXT DEFAULT NULL;
