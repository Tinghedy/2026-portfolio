import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Lightbox from "../../components/Lightbox/Lightbox";
import HoverPlayCard from "../../components/HoverPlayCard/HoverPlayCard";
import { workCache } from "./workCache";
import { useProseEmbeds } from "./proseEmbeds";
import Label from "../../components/Label/Label";
import CaseSidebar from "./CaseSidebar";
import { CODE_COVERS } from "./codeCovers";
import { ScrollSmoother, ScrollTrigger } from "../../motion/tokens";
import styles from "./WorkDetail.module.css";

/**
 * Presentation-only pass over the Tiptap HTML. Text and data are not
 * changed; this only adds rendering hints the stylesheet relies on:
 *   - every <img>: loading="lazy", decoding="async", zoomable (lightbox)
 *   - a <p> right after an image whose only content is <em> → data-caption
 *   - two or more top-level images in a row → wrapped in [data-image-row]
 *   - every top-level <h2>: id="section-N" → the sidebar's contents
 *   - top-level <blockquote> whose first line is all bold → data-callout
 *
 * @returns {{ html: string, headings: { id: string, text: string }[] }}
 */
function prepareHtml(html) {
  if (!html || typeof DOMParser === "undefined") return { html: html ?? "", headings: [] };
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;

  root.querySelectorAll("img").forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    img.setAttribute("data-zoomable", "");
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    if (!img.hasAttribute("alt")) img.setAttribute("alt", "");
  });

  [...root.children].forEach((el) => {
    const prev = el.previousElementSibling;
    if (el.tagName !== "P" || !prev || prev.tagName !== "IMG") return;
    const em = el.querySelector(":scope > em");
    if (em && el.children.length === 1 && el.textContent.trim() === em.textContent.trim()) {
      el.setAttribute("data-caption", "");
    }
  });

  // Callout: a top-level blockquote whose first line is all bold.
  // That line is the statement; any lines after it are supporting detail.
  // (Editable in /admin: Quote, then bold the first line.)
  root.querySelectorAll(":scope > blockquote").forEach((bq) => {
    const first = bq.firstElementChild;
    const strong = first?.tagName === "P" ? first.querySelector(":scope > strong") : null;
    if (strong && first.children.length === 1 && first.textContent.trim() === strong.textContent.trim()) {
      bq.setAttribute("data-callout", "");
      first.setAttribute("data-callout-lead", "");
    }
  });

  let node = root.firstElementChild;
  while (node) {
    if (node.tagName === "IMG" && node.nextElementSibling?.tagName === "IMG") {
      const row = doc.createElement("div");
      row.setAttribute("data-image-row", "");
      root.insertBefore(row, node);
      while (row.nextElementSibling?.tagName === "IMG") row.appendChild(row.nextElementSibling);
      node = row.nextElementSibling;
    } else {
      node = node.nextElementSibling;
    }
  }

  // Ids live in the markup: React re-renders dangerouslySetInnerHTML, so
  // ids set on the DOM afterwards would be lost.
  const headings = [...root.querySelectorAll(":scope > h2")].map((h, i) => {
    const id = `section-${i + 1}`;
    h.id = id;
    return { id, text: h.textContent.trim() || `Section ${i + 1}` };
  });

  return { html: root.innerHTML, headings };
}

const isVideo = (url) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url ?? "");

/**
 * Route element for /works/:id. Keyed by id so moving between works
 * starts from a fresh state.
 */
export default function WorkDetail() {
  const { id } = useParams();
  return <CaseView key={id} id={id} />;
}

/**
 * The case page. Rendered by the route above (mode "page"), or inside
 * CaseOverlay when opened from a card (mode "overlay").
 *
 * - Starts from workCache (filled by the /works list) so the hero and
 *   title exist on the first frame — the FLIP needs the hero right away —
 *   then fetches the full row.
 * - The hero (cover, data-flip-id={id}) is the FLIP target.
 * - Blocks marked data-enter fade in after the card lands (overlay mode).
 *
 * @param {{ id: string, mode?: "page" | "overlay", onClose?: () => void, heroActive?: boolean }} props
 */
export function CaseView({ id, mode = "page", onClose, heroActive }) {
  const navigate = useNavigate();
  const [project, setProject] = useState(() => workCache.get(id) ?? null);
  const [loading, setLoading] = useState(() => !workCache.has(id));
  const [zoomed, setZoomed] = useState(null);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          workCache.set(id, { ...workCache.get(id), ...data });
          setProject((prev) => ({ ...prev, ...data }));
        } else {
          setProject((prev) => prev ?? null);
        }
        setLoading(false);
      });
  }, [id]);

  const { html, headings } = useMemo(() => prepareHtml(project?.description), [project?.description]);
  const articleRef = useRef(null);
  const layoutRef = useRef(null);

  // Page mode under ScrollSmoother: content is moved with transforms, so
  // CSS sticky can't hold the sidebar — pin it with ScrollTrigger instead.
  // (The overlay sheet scrolls natively; CSS sticky works there.)
  useLayoutEffect(() => {
    if (mode !== "page" || !ScrollSmoother.get()) return;
    const layout = layoutRef.current;
    const aside = layout?.querySelector("aside");
    if (!layout || !aside || getComputedStyle(aside).display === "none") return;
    const st = ScrollTrigger.create({ trigger: layout, start: "top top", end: "bottom bottom", pin: aside, pinSpacing: false });
    return () => st.kill();
  }, [mode, html]);
  useProseEmbeds(articleRef); // e.g. MetroSense IA image → interactive map

  // One handler for every zoomable image on the page (prose + gallery).
  const zoomFrom = (e) => {
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    const img = e.target.closest?.("img[data-zoomable]");
    if (!img) return;
    e.preventDefault();
    setZoomed({ src: img.currentSrc || img.src, alt: img.alt });
  };

  const goBack = onClose ?? (() => navigate("/works"));
  const back = () => (
    <button onClick={goBack} className={styles.back} data-enter="">← Works</button>
  );

  if (loading && !project) return (
    <main className={styles.page}>
      <div className={styles.main}>
        <p className={styles.stateText}>Loading…</p>
      </div>
    </main>
  );

  if (!project) return (
    <main className={styles.page}>
      <div className={styles.main}>
        {back()}
        <p className={styles.stateText}>Project not found.</p>
      </div>
    </main>
  );

  // Info grid under the title (ref: meganyap.me's Team / Role / Timeline / Skills)
  const info = [
    { label: "Year", value: project.year },
    { label: "Role", value: project.role },
    { label: "Team", value: project.team },
  ].filter((m) => m.value);
  const link = typeof project.link === "string" ? project.link.trim() : "";

  const cover = typeof project.cover_image === "string" ? project.cover_image.trim() : "";
  // Some projects draw their banner in code (responsive art from Figma)
  const codeCover = CODE_COVERS[id];
  // Admin "Tags" field, shown above the title
  const tags = (project.tags ?? []).map((t) => String(t).trim()).filter(Boolean);
  const titleId = `case-title-${id}`;

  // In the overlay the sheet carries the background, so the page itself
  // stays transparent. `isPage` leaves room for the fixed navbar.
  const pageClass = [styles.page, mode === "overlay" ? styles.inOverlay : styles.isPage].join(" ");

  return (
    <main className={pageClass}>
      <div ref={layoutRef} className={styles.layout}>
        <CaseSidebar headings={headings} onBack={goBack} rootRef={articleRef} />

        <article ref={articleRef} className={styles.main} onClick={zoomFrom} onKeyDown={zoomFrom}>
          {/* Small screens: no sidebar, so the back link sits on top */}
          <div className={styles.mobileBack}>{back()}</div>

          {/* Banner: FLIP target. The wrapper holds the size; the hero
              inside is what grows out of the card. */}
          {(cover || codeCover) && (
            <div className={codeCover?.wide ? `${styles.banner} ${styles.bannerWide}` : styles.banner}>
              <HoverPlayCard
                className={styles.hero}
                mode="once"
                active={mode === "overlay" ? Boolean(heroActive) : true}
                waitForFocus={mode === "page"}
                data-flip-id={id}
              >
                {codeCover ? (
                  <codeCover.Component />
                ) : isVideo(cover) ? (
                  <video src={cover} className={styles.heroMedia} muted autoPlay loop playsInline />
                ) : (
                  <img src={cover} alt="" className={styles.heroMedia} />
                )}
              </HoverPlayCard>
            </div>
          )}

          <header className={styles.header} data-enter="">
            {tags.length > 0 && (
              <ul className={styles.tags} aria-label="Tags">
                {tags.map((t) => (
                  <Label as="li" key={t} variant="fill" size="lg">{t}</Label>
                ))}
              </ul>
            )}
            <h1 id={titleId} className={styles.title} tabIndex={-1}>{project.title}</h1>
            {link && (
              <a className={styles.cta} href={link} target="_blank" rel="noopener noreferrer">
                {link.replace(/^https?:\/\//, "").replace(/\/$/, "")} <span aria-hidden="true">→</span>
              </a>
            )}
          </header>

          {info.length > 0 && (
            <dl className={styles.info} data-enter="">
              {info.map(({ label, value }) => (
                <div key={label} className={styles.infoItem}>
                  <dt className={styles.infoLabel}>{label}</dt>
                  <dd className={styles.infoValue}>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Description (Tiptap HTML): intro paragraph → h2 sections */}
          {html && (
            <div className={styles.prose} data-enter="" dangerouslySetInnerHTML={{ __html: html }} />
          )}

          {/* Gallery images with captions */}
          {project.images?.length > 0 && (
            <div className={styles.prose} data-enter="">
              {project.images.map((url, i) => {
                const caption = project.image_captions?.[i];
                return (
                  <figure key={url} className={styles.figure}>
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      data-zoomable=""
                      tabIndex={0}
                      role="button"
                    />
                    {caption && <figcaption>{caption}</figcaption>}
                  </figure>
                );
              })}
            </div>
          )}
        </article>
      </div>

      <Lightbox image={zoomed} onClose={() => setZoomed(null)} />
    </main>
  );
}
