import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollTrigger } from "../../motion/tokens";
import styles from "./Home.module.css";

export default function Home() {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  // 往下捲過開場動畫（hero 下緣捲到畫面一半）→ 自動切到「作品集」。
  // 用捲動位置判斷而不是 wheel 事件：滑鼠停在 iframe 上時，wheel 事件
  // 只會進到 iframe，但捲動會傳回主頁，ScrollTrigger 一樣收得到。
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: heroRef.current,
      start: "bottom 50%",
      once: true,
      onEnter: () => navigate("/works"),
    });
    return () => st.kill();
  }, [navigate]);

  return (
    <main>
      {/* Hero — HELLO → HEDY 開場動畫（public/hero.html） */}
      <section ref={heroRef} className={styles.hero}>
        <iframe
          src="/hero.html"
          title="Hedy Liang — HELLO → HEDY"
          className={styles.heroFrame}
        />
      </section>

      {/* 捲動空間：讓 hero 能被捲上去，觸發切換到作品集 */}
      <div className={styles.scrollRoom} aria-hidden="true" />
    </main>
  );
}
