-- The old default badge colour (#D8FF3E lime) was saved into rows by the
-- admin form. Clear it so those badges use the new default (accent blue,
-- see CoverTag.jsx DEFAULT_TAG_COLOR).

UPDATE public.projects
SET tag_color = NULL
WHERE upper(tag_color) = '#D8FF3E';
