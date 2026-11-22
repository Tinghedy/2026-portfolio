import { useEffect, useRef, useState } from "react";
import { gsap, getMotion, prefersReducedMotion } from "../../motion/tokens";
import styles from "./CursorTooltip.module.css";

const OFFSET = 24;      // px right / below the pointer (same as mchiu.co.uk)
const EDGE = 8;         // keep this far from the viewport's right edge
const CHAR_MS = 18;     // typewriter speed per character

/**
 * One site-wide tooltip that follows the mouse.
 *
 * Any element with `data-tooltip="…"` shows that text while the pointer is
 * over it ("\n" breaks lines). The tooltip sits 24px right/below the pointer,
 * trails it slightly (--duration-base, --ease-focus), and types its text in.
 * Leaving the element hides it at once.
 *
 * Off on touch / no-hover devices, narrow screens (≤768px) and under
 * prefers-reduced-motion. Decorative only: pointer-events none, aria-hidden.
 */
export default function CursorTooltip() {
  const boxRef = useRef(null);
  const [text, setText] = useState("");
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      window.innerWidth > 768 &&
      !prefersReducedMotion()
  );

  useEffect(() => {
    if (!enabled) return;
    const box = boxRef.current;
    const m = getMotion();
    const toX = gsap.quickTo(box, "x", { duration: m.duration.base, ease: m.ease.focus });
    const toY = gsap.quickTo(box, "y", { duration: m.duration.base, ease: m.ease.focus });

    let full = "";
    let timer = null;
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let shown = false;

    const place = (instant) => {
      const x = Math.min(px + OFFSET, window.innerWidth - box.offsetWidth - EDGE);
      const y = py + OFFSET;
      if (instant) {
        toX(x, x);
        toY(y, y);
      } else {
        toX(x);
        toY(y);
      }
    };

    const type = (value) => {
      clearTimeout(timer);
      full = value;
      let i = 0;
      const tick = () => {
        i += 1;
        setText(full.slice(0, i));
        if (i < full.length) timer = setTimeout(tick, CHAR_MS);
      };
      tick();
    };

    const show = (value) => {
      if (value === full && shown) return;
      // First appearance starts right at the pointer (no slide in from afar).
      const first = !shown;
      shown = true;
      type(value);
      requestAnimationFrame(() => place(first));
    };

    const hide = () => {
      if (!shown) return;
      shown = false;
      full = "";
      clearTimeout(timer);
      setText("");
    };

    const check = (el) => {
      const value = el?.closest?.("[data-tooltip]")?.dataset.tooltip?.trim();
      if (value) show(value);
      else hide();
    };

    const onMove = (e) => {
      px = e.clientX;
      py = e.clientY;
      check(e.target);
      if (shown) place(false);
    };
    // Scrolling moves content under a still pointer: re-check what's there.
    const onScroll = () => check(document.elementFromPoint(px, py));
    const onLeave = () => hide();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("pointerdown", onLeave);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll, { capture: true });
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("pointerdown", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={boxRef} className={styles.tooltip} data-visible={text ? "" : undefined} aria-hidden="true">
      {text}
    </div>
  );
}
