import MetroCover from "../../components/MetroCover/MetroCover";
import TaigiCover from "../../components/TaigiCover/TaigiCover";

/**
 * Case-page banners drawn in code instead of the uploaded cover image,
 * keyed by project id (Supabase projects.id). Anything not listed uses
 * cover_image as before. The work card on /works keeps cover_image.
 *
 * `wide`: banner box is 824:467 on desktop and 4:3 below 640px
 * (WorkDetail.module.css `.bannerWide`) instead of the 3:2 image box.
 */
export const CODE_COVERS = {
  // MetroSense 捷境 — Figma 133:58
  "59910d0d-63aa-4754-a6a5-c48079f927db": { Component: MetroCover, wide: true },
  // 台語文 Storybook — Figma 2026_Portfolio 137:121
  "a9ac5711-ccc2-433f-8e41-079cab397c14": { Component: TaigiCover, wide: true },
};
