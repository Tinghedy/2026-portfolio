import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { gsap, Flip, ScrollSmoother, getMotion, prefersReducedMotion } from "./tokens";
import { flip, flipSource } from "./flip";
import { CaseView } from "../pages/Works/WorkDetail";
import styles from "./CaseOverlay.module.css";

/**
 * x / y / scaleX / scaleY that make the full-screen .surface cover `rect`
 * (a DOMRect in viewport px). The surface has transform-origin 0 0.
 */
function surfaceVarsFor(rect, root) {
  const box = root.getBoundingClientRect();
  return {
    x: rect.left - box.left,
    y: rect.top - box.top,
    scaleX: rect.width / box.width,
    scaleY: rect.height / box.height,
  };
}

/**
 * Case page shown as an overlay above /works, grown out of the clicked card.
 * Mounted by PublicLayout while the URL is /works/:id *and* the history
 * entry carries a backgroundLocation (i.e. it was opened from a card).
 * Opening /works/:id directly uses the normal route with a plain fade.
 *
 * Open (--duration-flip, --ease-flip; all three start together):
 *   1. dark backdrop fades in (--duration-base)
 *   2. page-coloured surface grows from the card's box to full screen
 *   3. cover FLIPs from the card's box to the hero (transform only)
 *   Back + title fade in from 55% of the flight. On landing the body
 *   (meta, prose, gallery) mounts and fades in, the hero replays its
 *   script once, and focus moves to the title.
 * Close (Back button, Esc, browser Back): text fades out, then cover and
 *   surface shrink back into the card; the /works scroll position is untouched.
 * Reduced motion: no FLIP — a --duration-base fade in / out.
 */
export default function CaseOverlay({ id, closing, onClosed }) {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const surfaceRef = useRef(null);
  const sheetRef = useRef(null);
  const openTlRef = useRef(null);
  const [heroActive, setHeroActive] = useState(false);
  const [bodyReady, setBodyReady] = useState(false);

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

  // Open: surface + cover fly together; title fades in on the way.
  useLayoutEffect(() => {
    const m = getMotion();
    const root = rootRef.current;
    const sheet = sheetRef.current;
    const hero = sheet.querySelector(`[data-flip-id="${CSS.escape(id)}"]`);
    const content = sheet.querySelectorAll("[data-enter]");
    const card = flipSource(id);
    const pending = pendingRef.current;
    if (flip.pending?.id === id) flip.pending = null;

    const landed = () => {
      flip.animating = false;
      setHeroActive(true);
      setBodyReady(true); // meta / prose / gallery mount now, after the flight
      sheet.querySelector("h1")?.focus({ preventScroll: true });
    };
    flip.animating = true;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion() || !pending?.rect || !hero) {
        // No card to grow from (or reduced motion): plain fade.
        gsap.fromTo(root, { autoAlpha: 0 }, {
          autoAlpha: 1, duration: m.duration.base, ease: m.ease.focus, onComplete: landed,
        });
        return;
      }
      if (card) gsap.set(card, { visibility: "hidden" });
      gsap.set(content, { autoAlpha: 0, y: 8 });

      const tl = gsap.timeline({ onComplete: landed });
      openTlRef.current = tl;
      tl.fromTo(backdropRef.current, { autoAlpha: 0 }, {
        autoAlpha: 1, duration: m.duration.base, ease: m.ease.focus,
      }, 0);
      // The page-coloured surface grows out of the card…
      tl.fromTo(surfaceRef.current, surfaceVarsFor(pending.rect, root), {
        x: 0, y: 0, scaleX: 1, scaleY: 1, duration: m.duration.flip, ease: m.ease.flip,
      }, 0);
      // …while the cover flies to the hero spot. scale: true = transform
      // only (no width/height per frame); no absolute: the hero stays in
      // flow, so nothing reflows when the flip ends.
      tl.add(Flip.from(pending.state, {
        targets: hero, duration: m.duration.flip, ease: m.ease.flip, scale: true,
      }), 0);
      // Back + title fade in during the second half of the flight.
      tl.to(content, {
        autoAlpha: 1, y: 0, duration: m.duration.base, ease: m.ease.focus, stagger: 0.04,
      }, m.duration.flip * 0.55);
    });
    return () => {
      flip.animating = false;
      openTlRef.current = null;
      ctx.revert();
    };
  }, [id]);

  // Body (meta, prose, gallery…) mounts once the card has landed; fade it in.
  useLayoutEffect(() => {
    if (!bodyReady || prefersReducedMotion()) return;
    const m = getMotion();
    const body = sheetRef.current.querySelectorAll("[data-body]");
    if (!body.length) return;
    const tween = gsap.fromTo(body, { autoAlpha: 0, y: 8 }, {
      autoAlpha: 1, y: 0, duration: m.duration.base, ease: m.ease.focus, stagger: 0.04,
    });
    return () => tween.kill();
  }, [bodyReady]);

  // Close (triggered by the URL leaving /works/:id): the open in reverse.
  useEffect(() => {
    if (!closing) return;
    const m = getMotion();
    const root = rootRef.current;
    const sheet = sheetRef.current;
    const hero = sheet.querySelector(`[data-flip-id="${CSS.escape(id)}"]`);
    const content = sheet.querySelectorAll("[data-enter], [data-body]");
    const card = flipSource(id);
    // Browser Back can arrive mid-flight: stop the open where it is.
    openTlRef.current?.kill();
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
      tween = gsap.to(root, {
        autoAlpha: 0, duration: m.duration.base, ease: m.ease.focus, onComplete: done,
      });
    } else {
      const at = m.duration.step; // let the text clear first
      tween = gsap.timeline({ onComplete: done });
      tween.to(content, {
        autoAlpha: 0, duration: m.duration.step, ease: m.ease.focus, overwrite: "auto",
      }, 0);
      tween.add(Flip.fit(hero, card, {
        duration: m.duration.flip, ease: m.ease.flip, scale: true,
      }), at);
      tween.to(surfaceRef.current, {
        ...surfaceVarsFor(card.getBoundingClientRect(), root),
        duration: m.duration.flip, ease: m.ease.flip,
      }, at);
      tween.to(backdropRef.current, {
        autoAlpha: 0, duration: m.duration.base, ease: m.ease.focus,
      }, at);
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
      <div ref={surfaceRef} className={styles.surface} aria-hidden="true" />
      <div ref={sheetRef} className={styles.sheet}>
        <CaseView
          id={id}
          mode="overlay"
          onClose={requestClose}
          heroActive={heroActive && !closing}
          bodyReady={bodyReady}
        />
      </div>
    </div>,
    document.body
  );
}
