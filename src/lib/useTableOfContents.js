import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Clears the fixed navbar when jumping to a heading. */
const SCROLL_MARGIN = "6rem";

/**
 * Band near the top of the viewport. A heading counts as "current" while it
 * sits inside it, which is what keeps the highlight in step with reading
 * position without listening to scroll.
 */
const OBSERVER_MARGIN = "-72px 0px -65% 0px";

/**
 * ASCII slug for a heading. Returns "" when there is nothing usable — Chinese
 * headings land here, and the caller falls back to a positional id.
 *
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return (text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Turn heading texts into stable, unique ids: slug where possible, `section-N`
 * where the text has nothing sluggable (e.g. Chinese), `-2` suffixes on clashes.
 *
 * @param {string[]} texts
 * @returns {{ id: string, text: string }[]}
 */
export function buildHeadings(texts) {
  const used = new Set();
  return texts.map((raw, i) => {
    const text = (raw ?? "").trim();
    const base = slugify(text) || `section-${i + 1}`;
    let id = base;
    let n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return { id, text: text || `Section ${i + 1}` };
  });
}

/**
 * Read the h2s out of an HTML string and hand back the same HTML with ids (and
 * the anchor offset) written onto those headings.
 *
 * The ids have to live in the markup rather than be assigned to the rendered
 * nodes afterwards: React rewrites the whole `dangerouslySetInnerHTML` subtree
 * on later renders, which would throw away anything set from an effect.
 *
 * @param {unknown} html
 * @returns {{ headings: { id: string, text: string }[], html: string }}
 */
export function annotateHeadings(html) {
  const source = html == null ? "" : String(html);
  if (!source || typeof DOMParser === "undefined") return { headings: [], html: source };

  const doc = new DOMParser().parseFromString(source, "text/html");
  const nodes = Array.from(doc.querySelectorAll("h2"));
  if (nodes.length === 0) return { headings: [], html: source };

  const headings = buildHeadings(nodes.map((el) => el.textContent ?? ""));
  nodes.forEach((el, i) => {
    el.id = headings[i].id;
    // Inline so the content-area stylesheet stays exactly as it is.
    el.style.scrollMarginTop = SCROLL_MARGIN;
  });

  return { headings, html: doc.body.innerHTML };
}

/**
 * "instant" rather than "auto": index.css sets `html { scroll-behavior: smooth }`,
 * and "auto" defers to that, which would animate anyway.
 */
const scrollBehavior = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";

/**
 * Builds a table of contents from the h2s in `content` — nothing is maintained
 * by hand — and tracks which section the reader is on.
 *
 * Returns the content back as `contentHtml`, with ids on the headings; render
 * that instead of the original so the anchors exist.
 *
 * @param {string | null | undefined} content  The project's description HTML.
 * @returns {{
 *   headings: { id: string, text: string }[],
 *   contentHtml: string,
 *   activeId: string | null,
 *   goToHeading: (id: string) => void,
 *   goToTop: () => void,
 * }}
 */
export function useTableOfContents(content) {
  // Derived during render — the list never lags a frame behind the content.
  const { headings, html: contentHtml } = useMemo(() => annotateHeadings(content), [content]);
  const [activeId, setActiveId] = useState(null);
  const hashHandled = useRef(false);

  // ── Track the current section ──
  useEffect(() => {
    if (headings.length === 0) return;

    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        // Topmost heading in the band wins; with none in it, keep the last one
        // we passed so the highlight never blanks out mid-section.
        const current = headings.find((h) => visible.has(h.id));
        setActiveId((prev) => current?.id ?? prev ?? headings[0].id);
      },
      { rootMargin: OBSERVER_MARGIN, threshold: 0 },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  const goToHeading = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    // Shareable link, without stacking a history entry per click.
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }, []);

  const goToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  // ── Deep link: honour #hash once the headings exist ──
  useEffect(() => {
    if (hashHandled.current || headings.length === 0) return;
    hashHandled.current = true;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id && headings.some((h) => h.id === id)) {
      // A frame later, so images above have taken their space.
      requestAnimationFrame(() => goToHeading(id));
    }
  }, [headings, goToHeading]);

  return { headings, contentHtml, activeId, goToHeading, goToTop };
}
