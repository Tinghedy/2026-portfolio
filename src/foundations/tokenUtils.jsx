import { useEffect, useState } from "react";

/**
 * Helpers for the Foundations stories (D1: Storybook shows every token).
 *
 * Token names are discovered by parsing public/tokens.css itself, so a
 * token added there shows up here with no story edit. Each row shows the
 * raw definition (e.g. `var(--color-primitive-neutral-500)`) and the
 * resolved value read from the page.
 */

let cache = null;

/** @returns {Map<string, string> | null} name → raw definition, in file order */
export function useTokenDefs() {
  const [defs, setDefs] = useState(cache);
  useEffect(() => {
    if (cache) return;
    fetch("/tokens.css")
      .then((r) => r.text())
      .then((css) => {
        const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
        const map = new Map();
        for (const m of text.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].trim());
        cache = map;
        setDefs(map);
      })
      .catch(() => setDefs(new Map()));
  }, []);
  return defs;
}

export const resolve = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/** Names whose prefix matches, minus any excluded prefixes. */
export function pick(defs, prefixes, exclude = []) {
  if (!defs) return [];
  return [...defs.keys()].filter(
    (n) => prefixes.some((p) => n.startsWith(p)) && !exclude.some((p) => n.startsWith(p))
  );
}

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

export const monoStyle = { font: "var(--type-data)", fontSize: 12 };

const rowStyle = (cols) => ({
  display: "grid",
  gridTemplateColumns: cols,
  alignItems: "center",
  gap: "var(--spacing-md)",
  width: "100%",
  padding: "var(--spacing-sm) 0",
  border: 0,
  borderBottom: "1px solid var(--color-border-subtle)",
  background: "none",
  font: "inherit",
  color: "var(--color-text-primary)",
  textAlign: "left",
  cursor: "copy",
});

/**
 * One row per token: preview · name · definition → resolved value.
 * Click a row to copy `var(--token)`.
 */
export function TokenTable({ names, preview, previewWidth = 72, maxWidth = 960 }) {
  const defs = useTokenDefs();
  const [copied, copy] = useCopy();
  if (!defs) return <p style={monoStyle}>讀取 tokens.css…</p>;
  const cols = `${previewWidth}px minmax(200px, 1fr) minmax(200px, 1.4fr)`;
  return (
    <div style={{ maxWidth }}>
      {names.map((name) => {
        const raw = defs.get(name) ?? "";
        const value = resolve(name);
        const isAlias = raw.startsWith("var(");
        return (
          <button key={name} type="button" style={rowStyle(cols)} onClick={() => copy(name)} title="點擊複製 var(…)">
            <span style={{ display: "flex", alignItems: "center" }}>{preview?.(name, value)}</span>
            <span style={monoStyle}>{copied === name ? "已複製 ✓" : name}</span>
            <span style={{ ...monoStyle, color: "var(--color-text-secondary)", overflowWrap: "anywhere" }}>
              {isAlias ? (
                <>
                  {raw.replace(/var\((--[\w-]+)\)/g, "$1")}
                  <span style={{ color: "var(--color-text-tertiary)" }}> → {value}</span>
                </>
              ) : (
                value || raw || "（未定義）"
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Section({ title, note, children }) {
  return (
    <section style={{ marginBottom: "var(--spacing-2xl)" }}>
      <h3 style={{ font: "var(--type-ui-strong)", margin: "0 0 var(--spacing-xs)" }}>{title}</h3>
      {note && <p style={{ font: "var(--type-caption)", color: "var(--color-text-secondary)", margin: "0 0 var(--spacing-md)", maxWidth: 720 }}>{note}</p>}
      {children}
    </section>
  );
}

export const swatch = (name) => (
  <span style={{ width: 56, height: 40, background: `var(${name})`, border: "1px solid var(--color-border-subtle)" }} />
);

export const bar = (name) => (
  <span style={{ height: 12, width: `var(${name})`, maxWidth: 64, background: "var(--color-accent)" }} />
);
