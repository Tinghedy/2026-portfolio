import BlogCard from "./BlogCard";

const meta = {
  title: "Components/BlogCard",
  component: BlogCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Blog 列表卡片。**Blog 一律沒有封面**：卡片只有文字（日期、標題、摘要、tags），文章頁也不放封面橫幅。`--color-bg-surface` 底、內距 16px、直角無陰影；hover 時出現 1px 黑框。摘要最多 3 行。點擊會導向 `/blog/:slug`。",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

export const Default = {
  args: {
    post: {
      slug: "miryoku-ai-imageboard",
      date: "2026-03-14",
      title: "AI 生圖真的懂設計師的感覺嗎？用魅力工學找答案【IDCII 2026 優秀論文獎 🏆】",
      summary:
        "客戶說要「尊榮感」，AI 給的卻總是金色和皮革。我用魅力工學把模糊的感覺拆成具體特徵，再交給 AI 生成意象看板，並找 15 位設計師實測。",
      tags: ["Blog", "Research", "Generative AI", "魅力工學"],
    },
  },
};

export const TitleOnly = {
  name: "只有標題",
  args: { post: { slug: "untitled", title: "2026 Prompt Engineering 的 AI 產圖實錄" } },
};

export const LongSummary = {
  name: "長摘要（截成 3 行）",
  args: {
    post: {
      slug: "long",
      date: "2026-04-30",
      title: "2026 Prompt Engineering 的 AI 產圖實錄【設計工作流 2.0 🖌️】",
      summary:
        "這段期間正好是源源的口卡 2.0 上架期間，這篇文章我會分享到我所使用到的 AI 工具跟使用流程，從找參考、寫 prompt、挑圖到後製，每一步遇到的問題和解法都會寫下來，最後也整理成一份可以直接套用的清單。",
      tags: ["Blog", "AI"],
    },
  },
};
