import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HoverPlayCard from "../HoverPlayCard/HoverPlayCard";
import { scriptFor } from "../HoverPlayCard/scripts";
import { Flip } from "../../motion/tokens";
import { flip } from "../../motion/flip";
import styles from "./WorkCard.module.css";

/**
 * Work card — Figma component set "Work Card" (node 60:44).
 *
 * Default: the whole image is out of focus except a few sharp frames
 *          (hairline white border + small label + crosshair).
 * Active:  the whole image comes into focus and the frames, labels and
 *          crosshair fade out — --duration-focus / --ease-focus.
 *
 * "Active" = mouse hover, keyboard focus (:focus-visible), or — on devices
 * without hover — the card crossing the middle of the viewport.
 * prefers-reduced-motion: always shows the sharp version (handled in CSS).
 * Title and year sit outside the image and are never blurred.
 *
 * Once in focus, the card plays its script (HoverPlayCard, content in
 * HoverPlayCard/scripts.js). Clicking grows it into the case page (FLIP).
 */

/**
 * Sharp frames, in % of the image box. Values are the Figma layout
 * (360×240 card: Window 1 = 24,40 200×72, Window 2 = 160,144 176×64).
 * Add more presets here if cards should vary.
 */
const FRAMES = [
  { left: 6.667, top: 16.667, width: 55.556, height: 30 },
  { left: 44.444, top: 60, width: 48.889, height: 26.667 },
];

/** CSS mask-position % for a layer is relative to (box − layer). */
const maskPos = (offset, size) => (size >= 100 ? 0 : (offset / (100 - size)) * 100);

const maskVars = Object.fromEntries(
  FRAMES.flatMap((f, i) => [
    [`--f${i + 1}-x`, `${maskPos(f.left, f.width)}%`],
    [`--f${i + 1}-y`, `${maskPos(f.top, f.height)}%`],
    [`--f${i + 1}-w`, `${f.width}%`],
    [`--f${i + 1}-h`, `${f.height}%`],
  ])
);

const isVideo = (url) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url ?? "");

/**
 * @param {{ work: import("../../pages/Works/Works").Work, index: number }} props
 */
export default function WorkCard({ work, index }) {
  const navigate = useNavigate();
  const location = useLocation();
  const script = scriptFor(work.id);
  const mediaRef = useRef(null);
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [centered, setCentered] = useState(false);
  const active = hovered || focused || centered;

  // Treat null / undefined / empty / whitespace-only all as "no cover".
  const cover = typeof work.cover_image === "string" ? work.cover_image.trim() : "";
  const hasCover = cover !== "";
  const hasVideo = hasCover && isVideo(cover);
  const category = work.tag || work.tags?.[0] || "";
  const frameLabel = `${String(index + 1).padStart(2, "0")}${category ? ` / ${category}` : ""}`;
  // One secondary line under the title: the year, else a single category.
  const meta = work.year || work.tags?.[0] || null;

  // Touch devices have no hover: focus the card while it crosses the
  // middle 10% band of the viewport.
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (!window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => setCentered(entry.isIntersecting),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active) v.play().catch(() => {});
    else {
      v.pause();
      v.currentTime = 0;
    }
  }, [active]);

  // Click → open the case page as an overlay that grows out of this card
  // (FLIP, see motion/CaseOverlay.jsx). Modified clicks (new tab etc.)
  // keep the normal link behaviour; clicks during an animation are ignored.
  const openCase = (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (flip.animating || !mediaRef.current) return;
    // Reset to a clean cover (no blur, frames or script) for the take-off frame.
    e.currentTarget.setAttribute("data-clean", "");
    setHovered(false);
    setFocused(false);
    setCentered(false);
    flip.pending = { id: work.id, state: Flip.getState(mediaRef.current) };
    // Block a second click before the overlay has even rendered
    // (it would push the same URL twice). CaseOverlay clears it on landing.
    flip.animating = true;
    navigate(`/works/${work.id}`, { state: { backgroundLocation: location } });
  };

  const onPointerEnter = (e) => { if (e.pointerType !== "touch") setHovered(true); };
  const onPointerLeave = (e) => { if (e.pointerType !== "touch") setHovered(false); };

  return (
    <Link
      to={`/works/${work.id}`}
      className={styles.card}
      data-active={active || undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      // Keyboard focus counts as hover; a mouse click's focus does not.
      onClick={openCase}
      onFocus={(e) => setFocused(e.currentTarget.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
    >
      <HoverPlayCard
        ref={mediaRef}
        className={hasCover ? styles.media : `${styles.media} ${styles.noCover}`}
        style={maskVars}
        script={script}
        active={active}
        waitForFocus
        data-flip-id={work.id}
        data-flip-source={work.id}
      >
        {hasCover &&
          (hasVideo ? (
            <video
              ref={videoRef}
              src={cover}
              className={styles.asset}
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img src={cover} alt="" className={styles.asset} loading="lazy" />
          ))}

        {/* Out-of-focus layer with holes where the frames are */}
        {hasCover && <div className={styles.blur} aria-hidden="true" />}

        <div className={styles.marks} aria-hidden="true">
          {FRAMES.map((f, i) => (
            <span
              key={i}
              className={styles.frame}
              style={{
                left: `${f.left}%`,
                top: `${f.top}%`,
                width: `${f.width}%`,
                height: `${f.height}%`,
              }}
            />
          ))}
          <span className={`${styles.label} ${styles.labelTag}`}>{frameLabel}</span>
          {work.year && <span className={`${styles.label} ${styles.labelYear}`}>{work.year}</span>}
          <span className={styles.cross} />
        </div>
      </HoverPlayCard>

      <div className={styles.meta}>
        <h2 className={styles.title}>{work.title}</h2>
        {meta && <span className={styles.year}>{meta}</span>}
      </div>
    </Link>
  );
}
