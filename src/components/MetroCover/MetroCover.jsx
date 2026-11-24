import styles from "./MetroCover.module.css";

const BASE = "/images/metrosense/cover";

/**
 * 台北捷運 cover art, built from the Figma layers (node 133:58) instead of
 * one flat image, so it can lay out differently on desktop and mobile.
 * Fills its positioned parent (the case-page banner); the parent sets the
 * box ratio — 824:467 on desktop, 4:3 below 640px (see WorkDetail.module.css
 * `.bannerWide`). Decorative: the case title names the project.
 */
export default function MetroCover() {
  return (
    <div className={styles.cover} aria-hidden="true">
      <img className={`${styles.layer} ${styles.waves}`} src={`${BASE}/waves.svg`} alt="" />
      <img className={`${styles.layer} ${styles.train}`} src={`${BASE}/train.svg`} alt="" width="501.5" height="142" />
      <img className={`${styles.layer} ${styles.mark}`} src={`${BASE}/logo-mark.svg`} alt="" width="190.656" height="94" />
      <img className={`${styles.layer} ${styles.wordmark}`} src={`${BASE}/logo-wordmark.svg`} alt="" width="481.677" height="90.5506" />
    </div>
  );
}
