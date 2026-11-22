import { useEffect, useState } from "react";

/**
 * Design tokens from public/tokens.css (the single source of truth).
 * Only the token NAMES live here; values are read from the page at render
 * time, so editing tokens.css updates these stories automatically.
 * Click a row to copy `var(--token)`.
 */

const GROUPS = {
  color: [
    "--color-bg-page",
    "--color-bg-surface",
    "--color-bg-surface-strong",
    "--color-text-primary",
    "--color-text-secondary",
    "--color-text-on-accent",
    "--color-accent",
    "--color-accent-strong",
    "--color-border-hairline",
    "--color-rule-on-photo",
  ],
  warmInk: [
    "--color-bg-warm",
    "--color-ink-secondary",
    "--color-ink-code",
    "--color-ink-fill",
    "--color-ink-line",
  ],
  spacing: [
    "--spacing-xs",
    "--spacing-sm",
    "--spacing-md",
    "--spacing-lg",
    "--spacing-xl",
    "--spacing-2xl",
    "--spacing-gutter",
  ],
  motion: [
    "--duration-step",
    "--duration-base",
    "--duration-focus",
    "--duration-flip",
    "--ease-step",
    "--ease-focus",
    "--ease-fall",
    "--ease-flip",
  ],
};

const readToken = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function useCopy() {
  const [copied, setCopied] = useState(null);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(null), 1200);
    return () => clearTimeout(t);
  }, [copied]);
  const copy = (name) => {
    navigator.clipboard?.writeText(`var(${name})`).then(() => setCopied(name), () => {});
  };
  return [copied, copy];
}

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "72px 1fr 1fr",
  alignItems: "center",
  gap: "var(--spacing-md)",
  width: "100%",
  padding: "var(--spacing-sm) 0",
  border: 0,
  borderBottom: "1px solid var(--color-border-hairline)",
  background: "none",
  font: "inherit",
  color: "var(--color-text-primary)",
  textAlign: "left",
  cursor: "copy",
};

const mono = { fontFamily: "var(--font-mono)", fontSize: 13 };

function TokenTable({ names, preview }) {
  const [copied, copy] = useCopy();
  return (
    <div style={{ maxWidth: 720 }}>
      {names.map((name) => {
        const value = readToken(name);
        return (
          <button key={name} type="button" style={rowStyle} onClick={() => copy(name)} title="點擊複製 var(…)">
            {preview(name, value)}
            <span style={mono}>{copied === name ? "已複製 ✓" : name}</span>
            <span style={{ ...mono, color: "var(--color-text-secondary)" }}>{value || "（未定義）"}</span>
          </button>
        );
      })}
    </div>
  );
}

const swatch = (name) => (
  <span
    style={{
      width: 56,
      height: 40,
      background: `var(${name})`,
      border: "1px solid var(--color-border-hairline)",
    }}
  />
);

const bar = (name) => (
  <span style={{ height: 12, width: `var(${name})`, background: "var(--color-accent)" }} />
);

function MotionDot({ name }) {
  // Pair each duration with --ease-focus, and each easing with --duration-focus.
  const isEase = name.startsWith("--ease");
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ position: "relative", width: 56, height: 12, background: "var(--color-bg-surface)" }}>
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 12,
          height: 12,
          background: "var(--color-accent)",
          transform: on ? "translateX(44px)" : "none",
          transitionProperty: "transform",
          transitionDuration: isEase ? "var(--duration-focus)" : `var(${name})`,
          transitionTimingFunction: isEase ? `var(${name})` : "var(--ease-focus)",
        }}
      />
    </span>
  );
}

const meta = {
  title: "Foundations/Tokens",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`public/tokens.css` 的設計 Token，數值即時從頁面讀取，改 tokens.css 這裡會自動更新。點任一列可複製 `var(--token)`。",
      },
    },
  },
};
export default meta;

export const Colors = {
  render: () => <TokenTable names={GROUPS.color} preview={swatch} />,
};

export const WarmInk = {
  name: "Warm ink (case study)",
  render: () => (
    <div style={{ background: "var(--color-bg-warm)", padding: "var(--spacing-lg)" }}>
      <TokenTable names={GROUPS.warmInk} preview={swatch} />
    </div>
  ),
};

export const Spacing = {
  render: () => <TokenTable names={GROUPS.spacing} preview={bar} />,
};

export const Motion = {
  render: () => <TokenTable names={GROUPS.motion} preview={(name) => <MotionDot name={name} />} />,
};
