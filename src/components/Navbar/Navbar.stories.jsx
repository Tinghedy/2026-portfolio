import Navbar from "./Navbar";

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "全站導覽列。目前頁面的連結會加上 active 樣式；窄螢幕時收成漢堡選單。",
      },
    },
  },
};
export default meta;

export const Home = {
  parameters: { router: { initialEntries: ["/"] } },
};

export const OnWorks = {
  parameters: { router: { initialEntries: ["/works"] } },
};

export const Mobile = {
  parameters: { router: { initialEntries: ["/works"] } },
  globals: { viewport: { value: "mobile1" } },
};
