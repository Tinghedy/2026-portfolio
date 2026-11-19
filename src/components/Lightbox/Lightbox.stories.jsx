import { useState } from "react";
import Lightbox from "./Lightbox";

const IMAGE = {
  src: "/images/metrosense/metrosense-01-key-visual.webp",
  alt: "MetroSense 主視覺",
};

const meta = {
  title: "Components/Lightbox",
  component: Lightbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "用原生 `<dialog>` 全螢幕看單張原尺寸圖片：Esc 關閉、焦點鎖在對話框內、顯示在 top layer。",
      },
      story: { inline: false, iframeHeight: 480 },
    },
  },
  argTypes: {
    image: { control: "object" },
    onClose: { action: "close" },
  },
};
export default meta;

/** Click the thumbnail to open; Esc, the button or the backdrop closes it. */
export const Interactive = {
  render: (args) => {
    const [image, setImage] = useState(null);
    return (
      <>
        <button type="button" onClick={() => setImage(IMAGE)} style={{ border: 0, padding: 0, cursor: "zoom-in" }}>
          <img src={IMAGE.src} alt="開啟大圖" style={{ width: 240 }} />
        </button>
        <Lightbox
          image={image}
          onClose={() => {
            setImage(null);
            args.onClose?.();
          }}
        />
      </>
    );
  },
};

export const Open = {
  args: { image: IMAGE },
};
