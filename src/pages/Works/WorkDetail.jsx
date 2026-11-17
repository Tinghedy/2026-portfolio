import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Lightbox from "../../components/Lightbox/Lightbox";
import HoverPlayCard from "../../components/HoverPlayCard/HoverPlayCard";
import { scriptFor } from "../../components/HoverPlayCard/scripts";
import { workCache } from "./workCache";
import styles from "./WorkDetail.module.css";

/**
 * Presentation-only pass over the Tiptap HTML. Text and data are not
 * changed; this only adds rendering hints the stylesheet relies on:
 *   - every <img>: loading="lazy", decoding="async", zoomable (lightbox)
 *   - a <p> right after an image whose only content is <em> → data-caption
 *   - two or more top-level images in a row → wrapped in [data-image-row]
 */
function prepareHtml(html) {
  if (!html || typeof DOMParser === "undefined") return html ?? "";
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

  return root.innerHTML;
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
 * - The hero (cover + script, data-flip-id={id}) is the FLIP target.
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

  const html = useMemo(() => prepareHtml(project?.description), [project?.description]);

  // One handler for every zoomable image on the page (prose + gallery).
  const zoomFrom = (e) => {
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    const img = e.target.closest?.("img[data-zoomable]");
    if (!img) return;
    e.preventDefault();
    setZoomed({ src: img.currentSrc || img.src, alt: img.alt });
  };

  const goBack = onClose ?? (() => navigate("/works"));
  const back = (extra = "") => (
    <button onClick={goBack} className={`${styles.back} ${extra}`} data-enter="">← Back</button>
  );

  if (loading && !project) return (
    <main className={styles.page}>
      <article className={styles.article}>
        <p className={styles.stateText}>Loading…</p>
      </article>
    </main>
  );

  if (!project) return (
    <main className={styles.page}>
      <article className={styles.article}>
        {back()}
        <p className={styles.stateText}>Project not found.</p>
      </article>
    </main>
  );

  const metaItems = [
    { label: "Year", value: project.year },
    { label: "My role", value: project.role },
    { label: "Team", value: project.team },
    project.link ? { label: "Link", value: project.link, isLink: true } : null,
  ].filter((m) => m && m.value);

  const cover = typeof project.cover_image === "string" ? project.cover_image.trim() : "";
  const script = scriptFor(id);
  const titleId = `case-title-${id}`;

  // In the overlay the sheet carries the background (it fades in after
  // the card lands), so the page itself must stay transparent.
  const pageClass = mode === "overlay" ? `${styles.page} ${styles.inOverlay}` : styles.page;

  return (
    <main className={pageClass}>
      <article className={styles.article} onClick={zoomFrom} onKeyDown={zoomFrom}>
        {back()}

        {/* Hero: FLIP target, replays the card's script once */}
        {(cover || script) && (
          <HoverPlayCard
            className={styles.hero}
            script={script}
            mode="once"
            active={mode === "overlay" ? Boolean(heroActive) : true}
            waitForFocus={mode === "page"}
            data-flip-id={id}
          >
            {cover && (isVideo(cover) ? (
              <video src={cover} className={styles.heroMedia} muted autoPlay loop playsInline />
            ) : (
              <img src={cover} alt="" className={styles.heroMedia} />
            ))}
          </HoverPlayCard>
        )}

        <header className={styles.header} data-enter="">
          <h1 id={titleId} className={styles.title} tabIndex={-1}>{project.title}</h1>
          {metaItems.length > 0 && (
            <p className={styles.meta}>
              {metaItems.map(({ label, value, isLink }) => (
                <span key={label} className={styles.metaItem}>
                  {label !== "Year" && <span className={styles.metaLabel}>{label} </span>}
                  {isLink ? (
                    <a href={value} target="_blank" rel="noopener noreferrer">
                      {String(value).replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    value
                  )}
                </span>
              ))}
            </p>
          )}
        </header>

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

        <hr className={styles.rule} data-enter="" />
        {back()}
      </article>

      <Lightbox image={zoomed} onClose={() => setZoomed(null)} />
    </main>
  );
}
