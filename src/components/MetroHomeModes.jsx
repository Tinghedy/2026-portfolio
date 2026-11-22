import { useState } from "react";
import styles from "./MetroHomeModes.module.css";

/* ──────────────────────────────────────────────────────────────
 * MetroSense home: Work / Travel dual mode (Figma node 4047:4049).
 * Toggle = Figma "Mode Toggle（工作／旅遊）" (4053:4152): the knob first
 * stretches toward the target, then retracts from the other end.
 * Phones are 2x exports of the iPhone mockups (4047:4052 / 4047:4123).
 * ────────────────────────────────────────────────────────────── */

const MODES = [
  {
    id: "work",
    label: "工作",
    caption: "工作模式：站點與搜尋優先",
    src: "/images/metrosense/metrosense-home-phone-work.webp",
    alt: "工作模式主頁：上方路網圖與搜尋列，下方常用站點、鄰近站點與常用功能",
  },
  {
    id: "travel",
    label: "旅遊",
    caption: "旅遊模式：地圖與探索優先",
    src: "/images/metrosense/metrosense-home-phone-travel.webp",
    alt: "旅遊模式主頁：上方街道地圖與目的地搜尋，下方鄰近站點與旅遊相關常用功能",
  },
];

export default function MetroHomeModes() {
  const [mode, setMode] = useState("work");
  const travel = mode === "travel";

  return (
    <div className={styles.board} data-mode={mode}>
      <div className={styles.inner}>
        <div className={styles.toggleHolder}>
          <button
            type="button"
            role="switch"
            aria-checked={travel}
            aria-label="切換工作／旅遊模式"
            className={styles.toggle}
            onClick={() => setMode(travel ? "work" : "travel")}
          >
            <span className={styles.knob} aria-hidden="true" />
            <span className={`${styles.option} ${styles.optionWork}`}>工作</span>
            <span className={`${styles.option} ${styles.optionTravel}`}>旅遊</span>
          </button>
          <p className={styles.hint}>點開關或手機切換模式</p>
        </div>

        <div className={styles.phones}>
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={styles.col}
              aria-pressed={mode === m.id}
              data-active={mode === m.id || undefined}
              onClick={() => setMode(m.id)}
            >
              <img
                src={m.src}
                alt={m.alt}
                className={styles.phone}
                width={376}
                height={785}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.caption}>{m.caption}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
