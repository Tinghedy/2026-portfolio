/**
 * 作品卡片的「小劇本」── 改劇本只要改這個檔案。
 *
 * 以作品 id（Supabase projects.id）對應。沒有列在這裡的作品不播劇本，
 * 只保留卡片原本的「模糊 → 對焦」。
 *
 * 每個劇本：
 *   query   輸入框裡逐字打出的那句話
 *   blocks  打完之後依序浮出的介面方塊（文字標籤）
 *   build   （選填）自訂時間軸；不寫就用下面的 typeAndStack
 *
 * 內容都取自各案例內文裡實際出現的詞，不另外編造。
 */
import { getMotion } from "../../motion/tokens";

export const SCRIPTS = {
  // MetroSense 捷境：AI 助理的提問範例（內文原句）＋ 三個新增功能
  "59910d0d-63aa-4754-a6a5-c48079f927db": {
    query: "台北車站附近有沒有置物櫃？",
    blocks: ["AI 助理", "語音輸入", "捷徑"],
  },
  // Young Ones／Flux：內文標語 ＋ 三種保護技術
  "10d97252-ea07-4e9a-86a0-1914527aa555": {
    query: "三步驟完成圖像隱私保護",
    blocks: ["Metadata Protection", "Content Credentials", "AI Disturbance"],
  },
  // 微信小程式：活動分頁 ＋ 資訊架構的四大入口
  "f78a3220-7e08-44ec-9d58-f68e26532bc9": {
    query: "進行中活動",
    blocks: ["主頁", "活動", "我的活動", "聯絡我們"],
  },
};

export const scriptFor = (id) => SCRIPTS[id] ?? null;

const TYPE_MS = 30;        // 每個字 30ms（規格指定）
const STAGGER = 0.08;      // 方塊依序出現的間隔（規格指定）
const HOLD = 2;            // 播完停在完成狀態幾秒再循環

/**
 * 預設劇本：面板浮出 → 逐字打字 → 方塊依序往上浮出。
 * 在時間軸上標記 "done"（完成狀態），減少動態時直接跳到這裡。
 * loop=true 時，完成後停 HOLD 秒再把面板淡掉，讓循環接得順。
 *
 * @param {gsap.core.Timeline} tl
 * @param {(sel: string) => Element[]} q  限定在這張卡片裡的選取器
 * @param {{ query: string, loop: boolean, offset: number }} opts
 */
export function typeAndStack(tl, q, { query, loop, offset }) {
  const m = getMotion();
  const [panel] = q("[data-hp='panel']");
  const [text] = q("[data-hp='text']");
  const blocks = q("[data-hp='block']");
  const typer = { n: 0 };
  const render = () => { text.textContent = query.slice(0, Math.round(typer.n)); };

  tl.fromTo(panel, { autoAlpha: 0, y: offset }, {
    autoAlpha: 1, y: 0, duration: m.duration.base, ease: m.ease.focus,
  });
  tl.fromTo(typer, { n: 0 }, {
    n: query.length, duration: (query.length * TYPE_MS) / 1000, ease: "none",
    onUpdate: render, onStart: render,
  });
  tl.fromTo(blocks, { autoAlpha: 0, y: offset }, {
    autoAlpha: 1, y: 0, duration: m.duration.base, ease: m.ease.focus, stagger: STAGGER,
  });
  tl.addLabel("done");
  if (loop) {
    tl.to(panel, { autoAlpha: 0, duration: m.duration.base, ease: m.ease.focus }, `+=${HOLD}`);
  }
  // make sure seek(0) also clears the typed text
  tl.eventCallback("onRepeat", () => { typer.n = 0; render(); });
}
