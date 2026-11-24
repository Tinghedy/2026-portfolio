import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, getMotion, prefersReducedMotion } from "../../motion/tokens";
import styles from "./ZoomViewer.module.css";

const EDGE_PAD = 24;     // space around the canvas when it is fitted
const ZOOM_STEPS = 4;    // button clicks from "fit" to max
const DRAG_SLOP = 4;     // px before a mouse press becomes a drag (keeps clicks working)

/**
 * Fixed-size viewport for a large canvas (ref: mchiu.co.uk's workshop
 * board viewer). The canvas starts fitted inside the box; the visitor
 * pans inside it (scroll, trackpad, or mouse drag) and zooms with the
 * +/− buttons or a trackpad pinch. The page around it never grows.
 *
 *   <ZoomViewer canvasWidth={1626} canvasHeight={1960}>
 *     <div style={{ width: 1626, height: 1960 }}>…</div>
 *   </ZoomViewer>
 *
 * - Fit = whole canvas visible with 24px padding; max = fit × maxZoom.
 * - Buttons step multiplicatively (same feel per click), eased with
 *   --duration-base / --ease-focus; pinch is instant. Zoom keeps the point
 *   under the pointer (or the box centre for buttons) in place.
 * - Mouse drag pans; a press that moves < 4px stays a click, so the
 *   canvas's own buttons keep working. Touch uses native scrolling.
 *
 * @param {{ canvasWidth: number, canvasHeight: number, maxZoom?: number,
 *   label?: string, className?: string, children: import("react").ReactNode }} props
 */
export default function ZoomViewer({ canvasWidth, canvasHeight, maxZoom = 5, label = "Zoomable diagram", className = "", children }) {
  const viewRef = useRef(null);
  const scrollRef = useRef(null);
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const st = useRef({ scale: 1, base: 1, max: 1, vpW: 0, vpH: 0, tween: null });
  const [btn, setBtn] = useState({ canIn: false, canOut: false, ready: false });

  const pads = (s) => {
    const { vpW, vpH } = st.current;
    return {
      x: Math.max(EDGE_PAD, (vpW - canvasWidth * s) / 2),
      y: Math.max(EDGE_PAD, (vpH - canvasHeight * s) / 2),
    };
  };

  const apply = useCallback((s) => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    st.current.scale = s;
    const p = pads(s);
    canvas.style.transform = `scale(${s})`;
    wrap.style.width = `${canvasWidth * s}px`;
    wrap.style.height = `${canvasHeight * s}px`;
    wrap.style.margin = `${p.y}px ${p.x}px`;
    const { base, max } = st.current;
    setBtn((b) => {
      const next = { canIn: s < max - 1e-3, canOut: s > base + 1e-3, ready: true };
      return b.canIn === next.canIn && b.canOut === next.canOut && b.ready ? b : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasWidth, canvasHeight]);

  /** Set scale, keeping the viewport point (ax, ay) over the same canvas point. */
  const zoomSnap = useCallback((s, ax, ay) => {
    const sc = scrollRef.current;
    if (!sc) return;
    const { vpW, vpH, scale: old } = st.current;
    ax ??= vpW / 2;
    ay ??= vpH / 2;
    const po = pads(old);
    const cx = (sc.scrollLeft + ax - po.x) / old;
    const cy = (sc.scrollTop + ay - po.y) / old;
    apply(s);
    const pn = pads(s);
    sc.scrollLeft = cx * s + pn.x - ax;
    sc.scrollTop = cy * s + pn.y - ay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apply]);

  const zoomTo = (target) => {
    const s0 = st.current;
    s0.tween?.kill();
    if (prefersReducedMotion()) return zoomSnap(target);
    const m = getMotion();
    const proxy = { s: s0.scale };
    s0.tween = gsap.to(proxy, {
      s: target,
      duration: m.duration.base,
      ease: m.ease.focus,
      onUpdate: () => zoomSnap(proxy.s),
    });
  };

  const ratio = () => Math.pow(st.current.max / st.current.base, 1 / ZOOM_STEPS);
  const zoomIn = () => zoomTo(Math.min(st.current.max, st.current.scale * ratio()));
  const zoomOut = () => zoomTo(Math.max(st.current.base, st.current.scale / ratio()));

  // Fit on mount and whenever the box changes size.
  useLayoutEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const state = st.current;
    const fit = () => {
      const s = state;
      s.vpW = view.clientWidth;
      s.vpH = view.clientHeight;
      if (!s.vpW || !s.vpH) return;
      s.base = Math.min((s.vpW - EDGE_PAD * 2) / canvasWidth, (s.vpH - EDGE_PAD * 2) / canvasHeight);
      s.max = s.base * maxZoom;
      apply(s.base);
      const sc = scrollRef.current;
      sc.scrollLeft = (sc.scrollWidth - s.vpW) / 2;
      sc.scrollTop = (sc.scrollHeight - s.vpH) / 2;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(view);
    return () => {
      ro.disconnect();
      state.tween?.kill();
    };
  }, [canvasWidth, canvasHeight, maxZoom, apply]);

  // Trackpad pinch arrives as wheel + ctrlKey. Needs passive: false.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const onWheel = (e) => {
      if (!e.ctrlKey) return; // normal scroll pans
      e.preventDefault();
      const s = st.current;
      s.tween?.kill();
      const next = Math.min(s.max, Math.max(s.base, s.scale * Math.exp(-e.deltaY * 0.01)));
      if (Math.abs(next - s.scale) < 1e-4) return;
      const r = sc.getBoundingClientRect();
      zoomSnap(next, e.clientX - r.left, e.clientY - r.top);
    };
    sc.addEventListener("wheel", onWheel, { passive: false });
    return () => sc.removeEventListener("wheel", onWheel);
  }, [zoomSnap]);

  // Mouse drag to pan. A press that barely moves stays a click.
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    let drag = null;
    const onDown = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, left: sc.scrollLeft, top: sc.scrollTop, moved: false, id: e.pointerId };
    };
    const onMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < DRAG_SLOP) return;
      if (!drag.moved) {
        drag.moved = true;
        sc.setPointerCapture(drag.id);
        sc.dataset.dragging = "";
      }
      sc.scrollLeft = drag.left - dx;
      sc.scrollTop = drag.top - dy;
    };
    const onUp = () => {
      if (drag?.moved) {
        delete sc.dataset.dragging;
        // swallow the click that follows a drag
        const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
        sc.addEventListener("click", stop, { capture: true, once: true });
        setTimeout(() => sc.removeEventListener("click", stop, { capture: true }), 0);
      }
      drag = null;
    };
    sc.addEventListener("pointerdown", onDown);
    sc.addEventListener("pointermove", onMove);
    sc.addEventListener("pointerup", onUp);
    sc.addEventListener("pointercancel", onUp);
    return () => {
      sc.removeEventListener("pointerdown", onDown);
      sc.removeEventListener("pointermove", onMove);
      sc.removeEventListener("pointerup", onUp);
      sc.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div ref={viewRef} className={`${styles.viewer} ${className}`} role="region" aria-label={label}>
      <div ref={scrollRef} className={styles.scroll}>
        <div ref={wrapRef} className={styles.wrap}>
          <div
            ref={canvasRef}
            className={styles.canvas}
            style={{ width: canvasWidth, height: canvasHeight, opacity: btn.ready ? 1 : 0 }}
          >
            {children}
          </div>
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.btn} onClick={zoomIn} disabled={!btn.canIn} aria-label="Zoom in">+</button>
        <button type="button" className={styles.btn} onClick={zoomOut} disabled={!btn.canOut} aria-label="Zoom out">−</button>
      </div>
    </div>
  );
}
