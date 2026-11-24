import styles from "./TaigiCover.module.css";

const BASE = "/images/taigie/cover";

/**
 * 台語文教學共融平台 cover art, built from the Figma layers
 * (2026_Portfolio node 137:121: BN-06 background, BN-07 whale, Tsui水 logo)
 * so it can lay out differently on desktop and mobile, like MetroCover.
 * Fills its positioned parent (the case-page banner, 824:467 on desktop,
 * 4:3 below 640px — WorkDetail.module.css `.bannerWide`).
 *
 * Two proposals:
 * - "logo":   Tsui水 team logo as a signature chip above the title. 水 (tsuí)
 *             is water in Taiwanese — the whale and the waves are the
 *             platform's water, the team logo signs it.
 * - "nologo": platform title only.
 * Until one is picked, `?cover=nologo` on the case URL previews the second.
 *
 * Decorative: the case title below names the project.
 *
 * @param {{ variant?: "logo" | "nologo" }} props
 */
export default function TaigiCover({ variant }) {
  const v =
    variant ??
    (typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("cover") === "nologo"
      ? "nologo"
      : "logo");

  return (
    <div className={styles.cover} data-variant={v} aria-hidden="true">
      <img className={styles.bg} src={`${BASE}/bg.png`} alt="" width="1600" height="450" />
      <img className={styles.whale} src={`${BASE}/whale.png`} alt="" width="1200" height="1200" />

      <div className={styles.text}>
        {v === "logo" ? (
          <span className={styles.chip}>
            <span className={styles.logoBox}>
              <img className={styles.logo} src={`${BASE}/tsui-logo.png`} alt="" width="872" height="660" />
            </span>
          </span>
        ) : (
          <span className={styles.eyebrow}>Design System · Storybook</span>
        )}
        <span className={styles.title}>台語文教學共融平台</span>
        {v === "logo" && <span className={styles.sub}>Design System · Storybook</span>}
      </div>
    </div>
  );
}
