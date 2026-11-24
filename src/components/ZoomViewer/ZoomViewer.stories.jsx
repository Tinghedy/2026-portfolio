import ZoomViewer from "./ZoomViewer";

const meta = {
  title: "Components/ZoomViewer",
  component: ZoomViewer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "固定大小的檢視框，裡面放大型畫布（參考 mchiu.co.uk 的工作坊白板）。一開始整張縮進框裡；拖曳或捲動移動、右下角 ＋／− 或觸控板雙指縮放（最多放大到 5 倍）。頁面高度不會被大圖撐開。框高是 `--zoom-viewer-height`（min(480px, 70vh)）。",
      },
    },
  },
};
export default meta;

const W = 1600;
const H = 1800;

export const Demo = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ZoomViewer canvasWidth={W} canvasHeight={H} label="Demo canvas">
        <div style={{ width: W, height: H, background: "var(--color-bg-raised)", position: "relative" }}>
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 80 + (i % 4) * 380,
                top: 80 + Math.floor(i / 4) * 280,
                width: 320,
                height: 200,
                display: "grid",
                placeItems: "center",
                background: "var(--color-bg-surface)",
                font: "var(--type-section)",
              }}
            >
              Board {i + 1}
            </div>
          ))}
        </div>
      </ZoomViewer>
    </div>
  ),
};
