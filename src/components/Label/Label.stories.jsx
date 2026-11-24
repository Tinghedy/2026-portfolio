import Label from "./Label";

const meta = {
  title: "Components/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "全站唯一的小標籤（P2）。字一律是 `--label-font`：mono 11px、粗體、大寫、字距 0.06em，直角。四種變體：**plain** 日期、年份；**outline** 內容標籤（Blog、Notes）；**fill** 案例頁標題上方的 tags（搭配 `size=\"lg\"`，mono 14px）；**solid** 封面 badge（底色可自訂，見 CoverTag）。",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "outline", "fill", "solid"] },
  },
};
export default meta;

export const Plain = { args: { variant: "plain", children: "2026-11-24" } };
export const Outline = { args: { variant: "outline", children: "Research" } };
export const FillLarge = { name: "Fill · lg（案例頁標題上方）", args: { variant: "fill", size: "lg", children: "UI/UX" } };
export const Solid = { args: { variant: "solid", children: "Young Ones Awards — UX" } };

export const AllVariants = {
  name: "三種並排",
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <Label>2026</Label>
      <Label variant="outline">UX Research</Label>
      <Label variant="outline">#設計系統</Label>
      <Label variant="fill" size="lg">交通</Label>
      <Label variant="solid">UI/UX</Label>
    </div>
  ),
};
