import styles from "./Label.module.css";

/**
 * Small label — the only tag style on the site (P2).
 *
 *   <Label>2026</Label>                          plain: dates, years
 *   <Label variant="outline">Research</Label>    outline: content tags
 *   <Label variant="fill" size="lg">UI/UX</Label>  fill: tags above a case title
 *   <Label variant="solid" color="#1043E5">UX</Label>  solid: cover badge
 *
 * Text: --label-font (mono 11px bold, uppercase, tracking 0.06em);
 * size="lg": --label-font-lg (mono 14px regular).
 * `color` (solid only) is a background hex; the text colour is picked
 * for contrast by the caller (see CoverTag).
 *
 * @param {{ variant?: "plain" | "outline" | "fill" | "solid", size?: "md" | "lg", as?: string,
 *   wrap?: boolean, className?: string, style?: object,
 *   children: import("react").ReactNode }} props
 */
export default function Label({ variant = "plain", size = "md", as = "span", wrap = false, className = "", children, ...rest }) {
  const Tag = as;
  const cls = [styles.label, styles[variant], size === "lg" && styles.lg, wrap && styles.wrap, className].filter(Boolean).join(" ");
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
