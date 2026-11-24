import { useEffect, useState } from "react";
import { TokenTable, Section, useTokenDefs, pick, swatch, bar } from "./tokenUtils";

/**
 * Colour, spacing, layout, radius and motion tokens from public/tokens.css.
 * Names are discovered from the file (see tokenUtils.jsx), so new tokens
 * appear here automatically. Typography is its own page.
 */

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

const Group = ({ prefixes, exclude, preview, previewWidth }) => {
  const defs = useTokenDefs();
  return <TokenTable names={pick(defs, prefixes, exclude)} preview={preview} previewWidth={previewWidth} />;
};

const meta = {
  title: "Foundations/Tokens",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "`public/tokens.css` 的設計 Token，分三層（A1）：**Primitive** 原始值（元件不准直接用）→ **Semantic** 用途（元件用這層）→ **Component** 元件專用。每列顯示「指向誰 → 實際值」。改 tokens.css 這裡自動更新；點任一列複製 `var(--token)`。",
      },
    },
  },
};
export default meta;

export const Colors = {
  name: "色彩",
  render: () => (
    <>
      <Section title="Semantic · 背景（三層，全站冷灰 C4）">
        <Group prefixes={["--color-bg-"]} preview={swatch} />
      </Section>
      <Section title="Semantic · 文字（C2）" note="secondary 在三層背景上的對比都 ≥ 4.7:1；tertiary 只給裝飾或停用狀態，不放必讀資訊。">
        <Group prefixes={["--color-text-"]} preview={swatch} />
      </Section>
      <Section title="Semantic · 主色（C3）" note="只給「現在在哪／可以互動」：導覽列目前頁、游標提示、badge 預設、焦點框、連結 hover。一個畫面最多兩三塊，不用漸層。">
        <Group prefixes={["--color-accent"]} preview={swatch} />
      </Section>
      <Section title="Semantic · 線與遮罩（S2：用細線分層，不用陰影）">
        <Group prefixes={["--color-border-", "--color-rule-", "--color-backdrop"]} preview={swatch} />
      </Section>
      <Section title="Primitive · 原始色" note="只能被語意層引用，元件 CSS 不直接用。">
        <Group prefixes={["--color-primitive-"]} preview={swatch} />
      </Section>
    </>
  ),
};

export const Spacing = {
  name: "間距",
  render: () => (
    <Section title="8px 方格" note="--grid-unit 是倍數：calc(var(--grid-unit) * 3px) = 24px。">
      <Group prefixes={["--spacing-"]} preview={bar} />
    </Section>
  ),
};

export const Layout = {
  name: "版面（S3）",
  render: () => (
    <Section title="頁框與閱讀欄" note="作品牆、Blog 共用頁框；案例頁、Blog 文章、Resume 共用 680px 閱讀欄（T6）。">
      <Group prefixes={["--layout-"]} />
    </Section>
  ),
};

export const Radius = {
  name: "圓角（S1）",
  render: () => (
    <Section title="直角是唯一值" note="例外要新增 token，不在元件裡寫數字。目前唯一的例外是自訂游標（圓形）。">
      <Group
        prefixes={["--radius-"]}
        preview={(name) => <span style={{ width: 40, height: 40, background: "var(--color-accent)", borderRadius: `var(${name})` }} />}
      />
    </Section>
  ),
};

export const Motion = {
  name: "動態",
  render: () => (
    <Section title="時長與曲線" note="--stagger：列表進場每項錯開 60ms，最多 8 步（M1）。">
      <Group prefixes={["--duration-", "--ease-", "--stagger"]} preview={(name) => (name === "--stagger" ? null : <MotionDot name={name} />)} />
    </Section>
  ),
};
