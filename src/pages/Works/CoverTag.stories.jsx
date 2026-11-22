import CoverTag from "./CoverTag";

const meta = {
  title: "Components/CoverTag（封面 badge）",
  component: CoverTag,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "作品卡片封面左上角的 badge。文字 = 後台「封面標籤」，底色 = 後台「標籤顏色」，沒設定時用主色藍 `#1043E5`；字色依底色自動選黑或白。字體 `--font-mono` 11px／500／大寫／字距 0.06em。",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", width: 360, aspectRatio: "3 / 2", background: "var(--color-bg-surface)" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

export const Default = { args: { label: "Young Ones Awards — UX" } };
export const CustomColor = { name: "自訂顏色（淺色底 → 黑字）", args: { label: "UI/UX", color: "#D8FF3E" } };
export const LongLabel = { name: "長文字（> 28 字自動換行）", args: { label: "2025 Taipei Metro Hackathon — First Place & Acer Award" } };
