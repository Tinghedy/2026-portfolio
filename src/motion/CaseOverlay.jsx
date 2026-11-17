import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { gsap, Flip, ScrollSmoother, getMotion, prefersReducedMotion } from "./tokens";
import { flip, flipSource } from "./flip";
import { CaseView } from "../pages/Works/WorkDetail";
import styles from "./CaseOverlay.module.css";

/**
 * Case page shown as an overlay above /works, grown out of the clicked card.
 * Mounted by PublicLayout while the URL is /works/:id *and* the history
 * entry carries a backgroundLocation (i.e. it was opened from a card).
 * Opening /works/:id directly uses the normal route with a plain fade.
 *
 * Open  (≈ --duration-focus):
 *   1. dark backdrop fades in (--duration-base)
 *   2. hero FLIPs from the card's box to its place (--duration-focus, --ease-flip)
 *   3. page background + content fade in, rising 8px (--duration-base)
 *   4. hero replays the script once; focus moves to the title
 * Close (Back button, Esc, browser Back): the same in reverse, back into
 *   the card; the /works scroll position is untouched.
 * Reduced motion: no FLIP — a --duration-base fade in / out.
 */
export default function CaseOverlay({ id, closing, onClosed }) {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const sheetRef = useRef(null);
  const [heroActive, setHeroActive] = useState(false);
  const sheetBg = useRef("");

  const requestClose = useCallback(() => {
    if (flip.animating) return;
    navigate(-1);
  }, [navigate]);

  // Lock the page behind: no scroll (keep scrollbar gap), not focusable.
  useLayoutEffect(() => {
    const body = document.body;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    const smoother = ScrollSmoother.get();
    smoother?.paused(true);
    const behind = [document.getElementById("smooth-wrapper"), document.querySelector("header")].filter(Boolean);
    behind.forEach((el) => { el.inert = true; });
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
      smoother?.paused(false);
      behind.forEach((el) => { el.inert = false; });
      // Back to the card it came from (only possible once un-inert).
      flipSource(id)?.closest("a")?.focus({ preventScroll: true });
    };
  }, [id]);

  // Esc closes (unless the image lightbox inside is open — it handles Esc).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape" || document.querySelector("dialog[open]")) return;
      e.preventDefault();
      requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestClose]);

  // The card's take-off state, read once per mount (StrictMode-safe).
  const pendingRef = useRef(flip.pending?.id === id ? flip.pending : null);

  // Open.
  useLayoutEffect(() => {
    const m = getMotion();
    const sheet = sheetRef.current;
    const hero = sheet.querySelector(`[data-flip-id="${CSS.escape(id)}"]`);
    const content = sheet.querySelectorAll("[data-enter]");
    const card = flipSource(id);
    const pending = pendingRef.current;
    if (flip.pending?.id === id) flip.pending = null;
    sheetBg.current = getComputedStyle(sheet).backgroundColor;

    const landed = () => {
      flip.animating = false;
      setHeroActive(true);
      sheet.querySelector("h1")?.focus({ preventScroll: true });
    };
    flip.animating = true;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion() || !pending || !hero) {
        // No card to grow from (or reduced motion): plain fade.
        gsap.fromTo(rootRef.current, { autoAlpha: 0 }, {
          autoAlpha: 1, duration: m.duration.base, ease: m.ease.focus, onComplete: landed,
        });
        return;
      }
      if (card) gsap.set(card, { visibility: "hidden" });
      gsap.set(content, { autoAlpha: 0, y: 8 });
      gsap.set(sheet, { backgroundColor: "transparent" });

      const tl = gsap.timeline({ onComplete: landed });
      tl.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: m.duration.base, ease: m.ease.focus }, 0);
      tl.add(Flip.from(pending.state, {
        targets: hero, duration: m.duration.focus, ease: m.ease.flip, absolute: true,
      }), 0);
      tl.to(sheet, { backgroundColor: sheetBg.current, duration: m.duration.base, ease: m.ease.focus });
      tl.to(content, { autoAlpha: 1, y: 0, duration: m.duration.base, ease: m.ease.focus, stagger: 0.04 }, "<");
    });
    return () => {
      flip.animating = false;
      ctx.revert();
    };
  }, [id]);

  // Close (triggered by the URL leaving /works/:id).
  useEffect(() => {
    if (!closing) return;
    const m = getMotion();
    const sheet = sheetRef.current;
    const hero = sheet.querySelector(`[data-flip-id="${CSS.escape(id)}"]`);
    const content = sheet.querySelectorAll("[data-enter]");
    const card = flipSource(id);
    flip.animating = true;

    const done = () => {
      if (card) {
        gsap.set(card, { clearProps: "visibility" });
        card.closest("a")?.removeAttribute("data-clean");
      }
      flip.animating = false;
      onClosed();
    };

    let tween;
    if (prefersReducedMotion() || !card || !hero) {
      tween = gsap.to(rootRef.current, {
        autoAlpha: 0, duration: m.duration.base, ease: m.ease.focus, onComplete: done,
      });
    } else {
      tween = gsap.timeline({ onComplete: done });
      tween.to(content, { autoAlpha: 0, duration: m.duration.step, ease: m.ease.focus }, 0);
      tween.to(sheet, { backgroundColor: "transparent", duration: m.duration.step, ease: m.ease.focus }, 0);
      tween.add(Flip.fit(hero, card, {
        duration: m.duration.focus, ease: m.ease.flip, absolute: true,
      }), m.duration.step);
      tween.to(backdropRef.current, { autoAlpha: 0, duration: m.duration.base, ease: m.ease.focus }, "<");
    }
    return () => tween.kill();
  }, [closing, id, onClosed]);

  return createPortal(
    <div
      ref={rootRef}
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`case-title-${id}`}
    >
      <div ref={backdropRef} className={styles.backdrop} />
      <div ref={sheetRef} className={styles.sheet}>
        <CaseView id={id} mode="overlay" onClose={requestClose} heroActive={heroActive && !closing} />
      </div>
    </div>,
    document.body
  );
}
