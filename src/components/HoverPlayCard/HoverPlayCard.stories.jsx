import HoverPlayCard from "./HoverPlayCard";
import { SCRIPTS } from "./scripts";

const meta = {
  title: "Components/HoverPlayCard",
  component: HoverPlayCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "在封面上播放小劇本（打字＋浮出的介面方塊）。只負責播放控制，內容來自 `scripts.js`。用 Controls 切換 `active` 觀察播放與淡出。",
      },
    },
  },
  argTypes: {
    script: {
      control: "select",
      options: ["none", ...Object.keys(SCRIPTS)],
      mapping: { none: null, ...SCRIPTS },
    },
    mode: { control: "inline-radio", options: ["loop", "once"] },
    children: { control: false },
  },
  args: {
    active: true,
    mode: "loop",
    waitForFocus: false,
    style: { width: 360, aspectRatio: "3 / 2" },
    children: (
      <img
        src="/images/metrosense/metrosense-cover.webp"
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ),
  },
};
export default meta;

export const Playing = {
  args: { script: SCRIPTS["59910d0d-63aa-4754-a6a5-c48079f927db"] },
};

export const Idle = {
  args: { ...Playing.args, active: false },
};

export const NoScript = {
  args: { script: null },
};
