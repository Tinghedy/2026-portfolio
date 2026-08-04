import styles from "./CoverTag.module.css";

/**
 * Cover badge shown at the top-right corner of a WorkCard cover.
 * Renders nothing when there is no label.
 *
 * @param {{ label: string }} props
 */
export default function CoverTag({ label }) {
  if (!label) return null;

  const wrap = label.length > 28;

  return (
    <span className={wrap ? `${styles.tag} ${styles.wrap}` : styles.tag}>
      {label}
    </span>
  );
}
