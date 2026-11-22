import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import HoverPlayCard from "../HoverPlayCard/HoverPlayCard";
import { Flip } from "../../motion/tokens";
import { flip } from "../../motion/flip";
import CoverTag from "../../pages/Works/CoverTag";
import styles from "./WorkCard.module.css";

/**
 * Work card — Figma component set "Work Card" (node 60:44).
 *
 * The cover is shown as-is, with a badge in the top-left corner
 * (work.tag, colour work.tag_color — set in the admin; see CoverTag).
 *
 * "Active" = mouse hover, keyboard focus (:focus-visible), or — on devices
 * without hover — the card crossing the middle of the viewport.
 *
 * No hover script: the keyword chips looked clickable but weren't
 * (HoverPlayCard/scripts.js is kept, unused). Clicking grows the card
 * into the case page (FLIP).
 */

const isVideo = (url) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url ?? "");

/**
 * @param {{ work: import("../../pages/Works/Works").Work }} props
 */
export default function WorkCard({ work }) {
  const navigate = useNavigate();
  const location = useLocation();
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
    // Reset to a clean cover (no script) for the take-off frame.
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
      data-tooltip={work.hover_text?.trim() || undefined}
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

        <CoverTag label={work.tag} color={work.tag_color} />
      </HoverPlayCard>

      <div className={styles.meta}>
        <h2 className={styles.title}>{work.title}</h2>
        {meta && <span className={styles.year}>{meta}</span>}
      </div>
    </Link>
  );
}
