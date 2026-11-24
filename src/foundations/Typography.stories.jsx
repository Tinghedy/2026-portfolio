import { TokenTable, Section, useTokenDefs, pick, monoStyle } from "./tokenUtils";

/**
 * Typography tokens (T1–T7), read live from public/tokens.css.
 * Replaces the 2026-11-22 hand-copied inventory: edit tokens.css and
 * every sample here follows.
 */

const sample = "作品集 Portfolio 2026";

// Text roles (T5): name → sample text + where it is used.
const ROLES = [
  { role: "display", text: "Yating Liang", use: "案例標題（≥ 768px，40）、Resume 名字" },
  { role: "title", text: "Works", use: "頁標題（Works／Blog／Notes）、案例標題（≥ 640px，34）" },
  { role: "title-sm", text: "【2025 捷運盃黑客松】", use: "案例標題（手機，28）" },
  { role: "section", text: "專案簡介", use: "案例頁 h2（≥ 768px，28）、文章 h2" },
  { role: "section-md", text: "專案簡介", use: "案例頁 h2（≥ 640px，26）" },
  { role: "section-sm", text: "專案簡介", use: "案例頁 h2（手機，22）" },
  { role: "subsection", text: "設計挑戰", use: "案例頁、文章 h3、Notes 彈窗標題" },
  { role: "body-lg", text: "MetroSense 捷境是一款重新設計台北捷運服務的 App 概念。", use: "案例頁、文章內文（≥ 768px）、Resume 自介" },
  { role: "body", text: "MetroSense 捷境是一款重新設計台北捷運服務的 App 概念。", use: "預設內文、側欄目錄、資訊區塊的值" },
  { role: "body-sm", text: "MetroSense 捷境是一款重新設計台北捷運服務的 App 概念。", use: "案例頁、文章內文（14px，參考 meganyap.me）" },
  { role: "ui", text: "【Young Ones】反 AI 生圖軟體_Flux", use: "作品卡片標題、按鈕" },
  { role: "ui-strong", text: "訪談摘錄", use: "Blog 卡片標題、案例頁 h4、Logo、Resume 公司名" },
  { role: "caption", text: "捷境 MetroSense 主視覺", use: "摘要、次要說明" },
  { role: "caption-sm", text: "捷境 MetroSense 主視覺", use: "案例頁圖說" },
  { role: "label", text: "Young Ones Awards — UX", use: "badge、標籤、年份（Label 元件）", upper: true, mono: true },
  { role: "label-lg", text: "UI/UX · Contents · Year", use: "案例頁 tags、側欄標題、資訊區塊標籤", upper: true, mono: true },
  { role: "data", text: "2026 · Role UX Designer · ← Back", use: "年份、日期、meta、Back 連結、導覽列連結與 Admin 按鈕", mono: true },
  { role: "tooltip", text: "UX Project\nPrivacy Protection", use: "游標提示", mono: true, accent: true },
];

function Families() {
  return (
    <TokenTable
      names={["--font-sans", "--font-mono"]}
      previewWidth={280}
      preview={(name) => <span style={{ fontFamily: `var(${name})`, fontSize: 22 }}>{sample}</span>}
    />
  );
}

function Scale() {
  const defs = useTokenDefs();
  return (
    <TokenTable
      names={pick(defs, ["--text-"])}
      previewWidth={280}
      preview={(name) => <span style={{ fontSize: `var(${name})`, lineHeight: 1.2, whiteSpace: "nowrap" }}>字級 Aa</span>}
    />
  );
}

function Scales() {
  const defs = useTokenDefs();
  return (
    <>
      <Section title="字重">
        <TokenTable names={pick(defs, ["--weight-"])} previewWidth={160} preview={(n) => <span style={{ fontWeight: `var(${n})`, fontSize: 18 }}>{sample.slice(0, 3)} Aa</span>} />
      </Section>
      <Section title="行高">
        <TokenTable
          names={pick(defs, ["--leading-"])}
          previewWidth={160}
          preview={(n) => <span style={{ lineHeight: `var(${n})`, fontSize: 13, display: "block", background: "var(--color-bg-surface)" }}>兩行文字<br />Line two</span>}
        />
      </Section>
      <Section title="字距" note="全大寫的字一律至少 wide。">
        <TokenTable names={pick(defs, ["--tracking-"])} previewWidth={160} preview={(n) => <span style={{ letterSpacing: `var(${n})`, fontSize: 14, textTransform: "uppercase" }}>Label</span>} />
      </Section>
    </>
  );
}

function Roles() {
  const defs = useTokenDefs();
  if (!defs) return null;
  return (
    <div style={{ maxWidth: 1040 }}>
      {ROLES.map(({ role, text, use, upper, accent }) => {
        const font = `--type-${role}`;
        const tracking = defs.has(`${font}-tracking`) ? `var(${font}-tracking)` : undefined;
        return (
          <div
            key={role}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 1fr 280px",
              gap: "var(--spacing-md)",
              alignItems: "start",
              padding: "var(--spacing-md) 0",
              borderBottom: "1px solid var(--color-border-subtle)",
            }}
          >
            <div>
              <div style={{ font: "var(--type-ui-strong)" }}>{role}</div>
              <div style={{ ...monoStyle, color: "var(--color-text-secondary)" }}>{font}</div>
            </div>
            <div>
              <span
                style={{
                  font: `var(${font})`,
                  letterSpacing: tracking,
                  textTransform: upper ? "uppercase" : undefined,
                  whiteSpace: "pre-line",
                  display: "inline-block",
                  ...(accent && { background: "var(--color-accent)", color: "var(--color-text-on-accent)", padding: "var(--tooltip-pad)" }),
                }}
              >
                {text}
              </span>
            </div>
            <div style={{ font: "var(--type-caption)", color: "var(--color-text-secondary)" }}>
              {use}
              <div style={{ ...monoStyle, color: "var(--color-text-tertiary)", marginTop: 4, overflowWrap: "anywhere" }}>
                {(defs.get(font) ?? "").replace(/var\((--[\w-]+)\)/g, "$1")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Components() {
  const defs = useTokenDefs();
  return (
    <TokenTable
      names={pick(defs, ["--nav-", "--page-title", "--card-", "--label-", "--tooltip-", "--article-"])}
      previewWidth={1}
    />
  );
}

const meta = {
  title: "Foundations/Typography",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "字體系統（T1–T7），即時讀取 `public/tokens.css`。**一個主字體**負責標題與內文，用字重分層級；**mono** 是小標籤與數據的識別（badge、年份、meta、游標提示）。全站文字只能從「文字角色」選，元件再透過元件 token 指向角色。",
      },
    },
  },
};
export default meta;

export const FontFamilies = {
  name: "字體家族（T1、T2）",
  render: () => (
    <Section title="兩個字體" note="主字體已定案 LINE Seed，但 webfont 尚未自架，目前實際顯示的是後備的 Noto Sans TC。">
      <Families />
    </Section>
  ),
};

export const TypeScale = {
  name: "字級階層（T3）",
  render: () => (
    <Section title="12 階，全部用 rem（T7）" note="原始值，元件不直接用；元件用下面的文字角色。">
      <Scale />
    </Section>
  ),
};

export const WeightLeadingTracking = {
  name: "字重／行高／字距（T4）",
  render: () => <Scales />,
};

export const TextRoles = {
  name: "文字角色（T5）",
  render: () => (
    <Section title="全站文字只從這張表選" note="每個角色 = 一個 font 簡寫 token（字重 字級/行高 字體）＋ 選用的字距 token。用法：font: var(--type-title); letter-spacing: var(--type-title-tracking);">
      <Roles />
    </Section>
  ),
};

export const ComponentTokens = {
  name: "元件 token（A3）",
  render: () => (
    <Section title="元件 → 角色" note="改某個元件的字，只要改 tokens.css 這裡一行。">
      <Components />
    </Section>
  ),
};
