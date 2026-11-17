import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { matchPath, useLocation } from "react-router-dom";
import CaseOverlay from "./CaseOverlay";
import { gsap, ScrollTrigger, ScrollSmoother, getMotion, prefersReducedMotion } from "./tokens";

/**
 * Shell for the public site: smooth scrolling + page transitions.
 *
 * - ScrollSmoother: catch-up time = --duration-focus, ease = --ease-focus.
 *   Fixed-position UI (Navbar, cursor) must stay OUTSIDE this component,
 *   because the content element is transformed.
 * - Page change: the old page fades out (--duration-base), the route
 *   swaps, scroll resets to top, the new page fades in (--duration-focus).
 *   Both use --ease-focus.
 * - prefers-reduced-motion: no smoother, no transition; the new page
 *   simply replaces the old one at the top of the document.
 *
 * Case pages opened from a work card render as CaseOverlay on top of the
 * current page (URL still /works/:id); see motion/CaseOverlay.jsx.
 *
 * Usage: children is a render function that receives the location to
 * render, so the old page can stay on screen while it fades out:
 *   <PublicLayout>{(loc) => <Routes location={loc}>…</Routes>}</PublicLayout>
 */
export default function PublicLayout({ children }) {
  // A case page opened from a card carries the page it was opened over
  // (state.backgroundLocation). That page keeps rendering underneath and
  // the case page appears as an overlay (CaseOverlay) instead.
  const routeLocation = useLocation();
  const backgroundLocation = routeLocation.state?.backgroundLocation;
  const location = backgroundLocation ?? routeLocation;
  const overlayId = backgroundLocation
    ? matchPath("/works/:id", routeLocation.pathname)?.params.id ?? null
    : null;
  const [overlay, setOverlay] = useState(null);
  if (overlayId && overlay?.id !== overlayId) setOverlay({ id: overlayId, closing: false });
  else if (!overlayId && overlay && !overlay.closing) setOverlay({ ...overlay, closing: true });
  const closeOverlay = useCallback(() => setOverlay(null), []);

  const [shown, setShown] = useState(location);
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const pageRef = useRef(null);
  const smootherRef = useRef(null);
  const lastPath = useRef(location.pathname);

  // We reset scroll on every page change ourselves; the browser's own
  // restore on Back/Forward would jump past scroll triggers (e.g. the
  // home → works auto-switch) and fire them again.
  useEffect(() => {
    if (!("scrollRestoration" in history)) return;
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => { history.scrollRestoration = prev; };
  }, []);

  // Smooth scrolling — only while the user has not asked for reduced motion.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const m = getMotion();
      smootherRef.current = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: m.duration.focus,
        ease: m.ease.focus,
        smoothTouch: 0, // touch devices keep native scrolling
        // ScrollSmoother scrolls any newly focused element into view. Only
        // do that for elements inside the smoothed content — focus moving
        // into the case overlay (a portal) must not scroll the page behind.
        onFocusIn: (_self, e) => (contentRef.current?.contains(e.target) ? undefined : false),
      });
      ScrollTrigger.refresh();
      return () => {
        smootherRef.current?.kill();
        smootherRef.current = null;
      };
    });
    return () => mm.revert();
  }, []);

  // Same page (only search/hash changed) or reduced motion: swap at once,
  // during render (React's "adjust state when a prop changes" pattern).
  const instant =
    location.key !== shown.key &&
    (location.pathname === shown.pathname || prefersReducedMotion());
  if (instant) setShown(location);

  // Route changed → fade the current page out, then swap.
  useEffect(() => {
    if (location.key === shown.key || location.pathname === shown.pathname) return;
    if (prefersReducedMotion()) return;
    const m = getMotion();
    const tween = gsap.to(pageRef.current, {
      autoAlpha: 0,
      duration: m.duration.base,
      ease: m.ease.focus,
      overwrite: "auto",
      onComplete: () => setShown(location),
    });
    return () => tween.kill();
  }, [location, shown]);

  // New page mounted → reset scroll, re-measure triggers, fade in.
  // Keyed on pathname, so a search/hash change does not jump to the top.
  useLayoutEffect(() => {
    // Skip the initial mount (also safe under StrictMode's double effects).
    if (lastPath.current === shown.pathname) return;
    lastPath.current = shown.pathname;
    if (smootherRef.current) smootherRef.current.scrollTop(0);
    else window.scrollTo(0, 0);
    ScrollTrigger.refresh();

    if (prefersReducedMotion()) {
      gsap.set(pageRef.current, { clearProps: "opacity,visibility" });
      return;
    }
    const m = getMotion();
    gsap.fromTo(
      pageRef.current,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: m.duration.focus,
        ease: m.ease.focus,
        overwrite: "auto",
        clearProps: "opacity,visibility",
      }
    );
  }, [shown.pathname]);

  return (
    <div ref={wrapperRef} id="smooth-wrapper">
      <div ref={contentRef} id="smooth-content">
        <div ref={pageRef}>{children(shown)}</div>
      </div>
      {overlay && (
        <CaseOverlay
          key={overlay.id}
          id={overlay.id}
          closing={overlay.closing}
          onClosed={closeOverlay}
        />
      )}
    </div>
  );
}
