import styles from "./CoverTag.module.css";

export const DEFAULT_TAG_COLOR = "#D8FF3E";

/**
 * Pick a readable text color (near-black or white) for a hex background,
 * so a custom badge color stays legible no matter what the user chooses.
 *
 * @param {string} hex
 * @returns {string}
 */
export function readableTextColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return "#0A0A0A";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0A0A0A" : "#FFFFFF";
}

/**
 * Cover badge shown at the top-right corner of a WorkCard cover.
 * Renders nothing when there is no label.
 *
 * @param {{ label: string, color?: string | null }} props
 */
export default function CoverTag({ label, color }) {
  if (!label) return null;

  const bg = color?.trim() || DEFAULT_TAG_COLOR;
  const wrap = label.length > 28;

  return (
    <span
      className={wrap ? `${styles.tag} ${styles.wrap}` : styles.tag}
      style={{ background: bg, color: readableTextColor(bg) }}
    >
      {label}
    </span>
  );
}
