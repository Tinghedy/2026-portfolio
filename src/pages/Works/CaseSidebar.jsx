import { useEffect, useState } from "react";
import { gsap, ScrollSmoother, prefersReducedMotion } from "../../motion/tokens";
import styles from "./CaseSidebar.module.css";

/**
 * Case-page sidebar (ref: meganyap.me): back link, table of contents
 * built from the description's h2s, and "back to top".
 *
 * Scrolling works in both places a case page lives:
 *   - inside CaseOverlay: the overlay sheet is the scroll container
 *     (native scroll, so the sidebar can be CSS-sticky);
 *   - as a normal page: ScrollSmoother scrolls the window, so jumps go
 *     through it (and WorkDetail pins the sidebar with ScrollTrigger).
 *
 * @param {{ headings: { id: string, text: string }[], onBack: () => void,
 *   backLabel?: string, rootRef: import("react").RefObject<HTMLElement> }} props
 */
export default function CaseSidebar({ headings, onBack, backLabel = "Works", rootRef }) {
  const [active, setActive] = useState(headings[0]?.id ?? null);

  // Current section = the last heading that has scrolled past 30% of the
  // view (first one before that). Recomputed on scroll, once per frame.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || headings.length === 0) return;
    const scroller = scrollContainer(root);
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = scroller === window ? 0 : scroller.getBoundingClientRect().top;
      const height = scroller === window ? window.innerHeight : scroller.clientHeight;
      const line = top + height * 0.3;
      let current = headings[0].id;
      for (const { id } of headings) {
        const el = root.querySelector(`#${CSS.escape(id)}`);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    // Under ScrollSmoother the content keeps moving after the last scroll
    // event (it eases in), so re-check every frame there instead.
    if (scroller === window && ScrollSmoother.get()) {
      gsap.ticker.add(update);
      update();
      return () => gsap.ticker.remove(update);
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const target = scroller === window ? window : scroller;
    target.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      target.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [headings, rootRef]);

  const jump = (target) => {
    const root = rootRef.current;
    if (!root) return;
    const el = target ? root.querySelector(`#${CSS.escape(target)}`) : null;
    const scroller = scrollContainer(root);
    const smoother = scroller === window ? ScrollSmoother.get() : null;
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    if (smoother) {
      smoother.scrollTo(el ?? 0, true, el ? "top 96px" : undefined);
    } else if (el) {
      el.scrollIntoView({ behavior, block: "start" });
    } else {
      (scroller === window ? window : scroller).scrollTo({ top: 0, behavior });
    }
  };

  return (
    <aside className={styles.sidebar} aria-label="Case study navigation" data-enter="">
      <button type="button" className={styles.home} onClick={onBack}>
        <span className={styles.arrow} aria-hidden="true">←</span> {backLabel}
      </button>

      {headings.length > 0 && (
        <nav className={styles.toc} aria-label="Table of contents">
          <p className={styles.tocTitle}>Contents</p>
          <ol className={styles.tocList}>
            {headings.map(({ id, text }, i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={styles.tocLink}
                  aria-current={active === id ? "location" : undefined}
                  onClick={(e) => { e.preventDefault(); jump(id); }}
                >
                  {String(i + 1).padStart(2, "0")}. {text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <button type="button" className={styles.top} onClick={() => jump(null)}>
        <span className={styles.arrow} aria-hidden="true">↑</span> Back to top
      </button>
    </aside>
  );
}

/** Nearest scrolling ancestor (the overlay sheet), or window. */
function scrollContainer(el) {
  for (let n = el.parentElement; n; n = n.parentElement) {
    const oy = getComputedStyle(n).overflowY;
    if (oy === "auto" || oy === "scroll") return n;
  }
  return window;
}
