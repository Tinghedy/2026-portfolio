import Label from "../../components/Label/Label";
import styles from "./CoverTag.module.css";

/** Default badge colour = --color-accent (Style C blue), white text. */
export const DEFAULT_TAG_COLOR = "#1043E5";

/**
 * Pick a readable text color (near-black or white) for a hex background,
 * so a custom badge color stays legible no matter what the user chooses.
 *
 * @param {string} hex
 * @returns {string}
 */
export function readableTextColor(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex ?? "").trim());
  if (!m) return "#0A0A0C";
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Mirrors --color-primitive-neutral-900 / -0 (inline style needs a value).
  return luminance > 0.6 ? "#0A0A0C" : "#FFFFFF";
}

/**
 * Cover badge shown at the top-left corner of a WorkCard cover.
 * Renders nothing when there is no label.
 *
 * @param {{ label: string, color?: string | null }} props
 */
export default function CoverTag({ label, color }) {
  if (!label) return null;

  const bg = color?.trim() || DEFAULT_TAG_COLOR;
  const wrap = label.length > 28;

  return (
    <Label
      variant="solid"
      wrap={wrap}
      className={styles.tag}
      style={{ background: bg, color: readableTextColor(bg) }}
    >
      {label}
    </Label>
  );
}
