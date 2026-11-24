import CursorTooltip from "./CursorTooltip";

const meta = {
  title: "Components/CursorTooltip（游標提示）",
  component: CursorTooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "全站共用的游標提示。任何元素加 `data-tooltip=\"…\"`，滑鼠移上去就在游標右下 24px 打字浮出。主色藍底、白字、直角，字是 `--tooltip-font`（mono 15px，跟封面 badge 同一個字體家族，T2）。觸控裝置、寬度 ≤ 768px、減少動態時不顯示。**把滑鼠移到下面的方塊上試試。**",
      },
    },
  },
};
export default meta;

const box = {
  display: "grid",
  placeItems: "center",
  width: 360,
  aspectRatio: "3 / 2",
  background: "var(--color-bg-surface)",
  fontSize: 13,
  color: "var(--color-text-secondary)",
};

export const Interactive = {
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
      <div style={box} data-tooltip={"UX Project\nPrivacy Protection"}>滑鼠移過來（兩行）</div>
      <div style={box} data-tooltip="用 AI 助理重新設計台北捷運 App">滑鼠移過來（一行）</div>
      <CursorTooltip />
    </div>
  ),
};
