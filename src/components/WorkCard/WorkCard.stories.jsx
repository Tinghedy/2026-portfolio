import { flip } from "../../motion/flip";
import WorkCard from "./WorkCard";

// Id with an entry in HoverPlayCard/scripts.js, so the card plays its script.
const METROSENSE_ID = "59910d0d-63aa-4754-a6a5-c48079f927db";

const meta = {
  title: "Components/WorkCard",
  component: WorkCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "作品卡片（Figma「Work Card」60:44）。預設模糊、只有幾個清楚的框；hover / 鍵盤 focus 時對焦並播放 HoverPlayCard 劇本。點擊會導向 `/works/:id`（Storybook 內不會開出案例頁）。",
      },
    },
  },
  decorators: [
    (Story) => {
      // Clicking a card sets flip.animating; the case overlay that clears it
      // doesn't exist here, so reset it to keep the card clickable.
      flip.animating = false;
      flip.pending = null;
      return (
        <div style={{ width: 360 }}>
          <Story />
        </div>
      );
    },
  ],
  argTypes: {
    index: { control: { type: "number", min: 0, max: 98 } },
  },
};
export default meta;

export const WithCover = {
  args: {
    index: 0,
    work: {
      id: METROSENSE_ID,
      title: "MetroSense 捷境",
      cover_image: "/images/metrosense/metrosense-cover.webp",
      tags: ["UI Design", "Research"],
      tag: "UI Design",
      year: 2025,
    },
  },
};

export const WithoutScript = {
  args: {
    index: 1,
    work: {
      ...WithCover.args.work,
      id: "no-script",
      title: "沒有劇本的作品",
    },
  },
};

export const NoCover = {
  args: {
    index: 2,
    work: {
      id: "no-cover",
      title: "尚未上傳封面",
      cover_image: "",
      tags: ["Research"],
      tag: null,
      year: 2024,
    },
  },
};
