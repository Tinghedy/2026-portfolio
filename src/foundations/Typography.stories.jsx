/**
 * 字體「現況盤點」── 不是規範。
 *
 * 列出目前網站上實際在用的字體和文字樣式（數值抄自各 .module.css，
 * 2026-11-22 盤點）。還沒有字級 token，所以這頁是手動整理的快照：
 * 改了 CSS 這裡不會自動跟著變。等字級系統定案後，這頁會改成讀 token。
 */

const FAMILIES = [
  { token: "--font-heading", use: "所有 h1–h6（index.css 全域）：頁標題、案例頁標題、內文小標" },
  { token: "--font-body", use: "內文、卡片標題、導覽列、游標提示" },
  { token: "--font-mono", use: "封面 badge、年份、meta、Back、Blog 標籤" },
];

// 沒有走 token、直接寫死的字體
const HARDCODED = [
  { family: '"Helvetica Neue", sans-serif', where: "Notes 頁（9 處）" },
  { family: '"Georgia", serif', where: "Notes 頁（3 處）" },
  { family: "'JetBrains Mono', ui-monospace", where: "後台：封面標籤預覽（ProjectForm.jsx）" },
  { family: "Inter, \"PingFang TC\", …", where: "1 處" },
];

// 公開頁面實際在用的文字樣式。f = 字體 token，s = 字級，w = 字重，
// lh = 行高，ls = 字距，up = 大寫。
const STYLES = [
  { group: "標題", items: [
    { name: "案例頁 h1", where: "WorkDetail .title（≥768px）", f: "--font-heading", s: "48px", w: 700, lh: "60px", ls: "-1.2px", text: "【2025 捷運盃黑客松】第一名" },
    { name: "案例頁 h1（手機）", where: "WorkDetail .title", f: "--font-heading", s: "30px", w: 700, lh: 1.25, ls: "-0.025em", text: "【2025 捷運盃黑客松】第一名" },
    { name: "頁標題", where: "Works／Blog .pageTitle", f: "--font-heading", s: "clamp(1.4rem, 2.4vw, 1.9rem)", w: 700, ls: "-0.03em", text: "Works" },
    { name: "內文 h2", where: "WorkDetail .prose h2", f: "--font-heading", s: "28px", w: 600, lh: "35px", ls: "-0.7px", text: "專案簡介" },
    { name: "內文 h3", where: "WorkDetail .prose h3", f: "--font-heading", s: "24px", w: 600, lh: "30px", ls: "-0.6px", text: "設計挑戰" },
    { name: "內文 h4", where: "WorkDetail .prose h4", f: "--font-heading", s: "20px", w: 600, lh: "27.5px", ls: "-0.5px", text: "訪談摘錄" },
  ]},
  { group: "內文與卡片", items: [
    { name: "內文", where: "WorkDetail .prose（≥768px）", f: "--font-body", s: "16px", w: 400, lh: "26px", text: "MetroSense 捷境是一款重新設計台北捷運服務的 App 概念。" },
    { name: "內文（手機）", where: "WorkDetail .prose", f: "--font-body", s: "14px", w: 400, lh: 1.625, text: "MetroSense 捷境是一款重新設計台北捷運服務的 App 概念。" },
    { name: "作品卡片標題", where: "WorkCard .title", f: "--font-body", s: "15px", w: 500, lh: "22px", text: "【Young Ones】反 AI 生圖軟體_Flux" },
    { name: "Blog 卡片標題", where: "Blog .title", f: "--font-body", s: "1rem", w: 700, lh: 1.4, ls: "-0.01em", text: "文章標題" },
    { name: "Blog 摘要", where: "Blog .tagline", f: "--font-body", s: "0.8125rem", w: 400, lh: 1.6, text: "一句話摘要。" },
    { name: "游標提示", where: "CursorTooltip", f: "--font-body", s: "15px", w: 500, lh: 1.4, text: "UX Project\nPrivacy Protection", tooltip: true },
  ]},
  { group: "小字／標籤（mono）", items: [
    { name: "封面 badge", where: "CoverTag", f: "--font-mono", s: "11px", w: 500, lh: 1.4, ls: "0.06em", up: true, text: "Young Ones Awards — UX", badge: true },
    { name: "作品卡片年份", where: "WorkCard .year", f: "--font-mono", s: "11px", w: 400, lh: 1.4, text: "2026" },
    { name: "Blog 年份", where: "Blog .year", f: "--font-mono", s: "11px", w: 400, ls: "0.08em", up: true, text: "2026" },
    { name: "Blog 標籤", where: "Blog .tag", f: "--font-mono", s: "11px", w: 400, ls: "0.06em", up: true, text: "Research" },
    { name: "案例頁 meta／Back", where: "WorkDetail .meta / .back", f: "--font-mono", s: "14px", w: 400, lh: "20px", text: "← Back    Role UX Designer" },
  ]},
  { group: "導覽列", items: [
    { name: "Logo", where: "Navbar .logo", f: "--font-body", s: "1.1rem", w: 700, ls: "0.05em", text: "YT" },
    { name: "導覽連結", where: "Navbar .link", f: "--font-body", s: "0.9rem", w: 400, ls: "0.03em", text: "作品集" },
    { name: "Admin 按鈕", where: "Navbar .loginBtn", f: "--font-body", s: "0.85rem", w: 500, text: "Admin" },
  ]},
];

const mono = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-secondary)" };
const cell = { padding: "12px 16px 12px 0", borderBottom: "1px solid var(--color-border-hairline)", verticalAlign: "top" };

function spec(it) {
  return [
    it.f.replace("--font-", ""),
    it.s,
    it.w,
    it.lh != null && `lh ${it.lh}`,
    it.ls && `ls ${it.ls}`,
    it.up && "大寫",
  ].filter(Boolean).join(" · ");
}

function Sample({ it }) {
  const style = {
    fontFamily: `var(${it.f})`,
    fontSize: it.s,
    fontWeight: it.w,
    lineHeight: it.lh,
    letterSpacing: it.ls,
    textTransform: it.up ? "uppercase" : undefined,
    whiteSpace: "pre-line",
    margin: 0,
    color: "var(--color-text-primary)",
  };
  if (it.badge) Object.assign(style, { display: "inline-block", padding: "4px 8px", background: "var(--color-accent)", color: "var(--color-text-on-accent)" });
  if (it.tooltip) Object.assign(style, { display: "inline-block", padding: "8px 16px", background: "var(--color-accent)", color: "var(--color-text-on-accent)" });
  return <p style={style}>{it.text}</p>;
}

const meta = {
  title: "Foundations/Typography（現況盤點）",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "目前網站實際在用的字體與文字樣式，**是盤點不是規範**。還沒有字級 token，各頁各自寫數值（全站 CSS 約 45 種 font-size，混用 px / rem / clamp）。數值為 2026-11-22 從 CSS 抄錄的快照。",
      },
    },
  },
};
export default meta;

export const Families = {
  name: "字體家族",
  render: () => (
    <div style={{ maxWidth: 880 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {FAMILIES.map(({ token, use }) => (
            <tr key={token}>
              <td style={{ ...cell, width: 160 }}><span style={mono}>{token}</span></td>
              <td style={cell}>
                <p style={{ fontFamily: `var(${token})`, fontSize: 28, margin: "0 0 4px" }}>作品集 Portfolio 2026</p>
                <span style={mono}>{getComputedStyle(document.documentElement).getPropertyValue(token)}</span>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>{use}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ margin: "32px 0 8px", fontSize: 15 }}>沒走 token、寫死的字體</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {HARDCODED.map(({ family, where }) => (
            <tr key={family}>
              <td style={{ ...cell, width: 320 }}><span style={mono}>{family}</span></td>
              <td style={{ ...cell, fontSize: 13 }}>{where}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

export const TextStyles = {
  name: "文字樣式（公開頁面）",
  render: () => (
    <div style={{ maxWidth: 1040 }}>
      {STYLES.map(({ group, items }) => (
        <section key={group} style={{ marginBottom: 40 }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>{group}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {items.map((it) => (
                <tr key={it.name}>
                  <td style={{ ...cell, width: 200 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{it.name}</div>
                    <div style={mono}>{it.where}</div>
                  </td>
                  <td style={cell}><Sample it={it} /></td>
                  <td style={{ ...cell, width: 260 }}><span style={mono}>{spec(it)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  ),
};
