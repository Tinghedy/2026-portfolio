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
 * - Overlay mode: data-enter blocks (top Back, title) fade in during the
 *   flight; data-body blocks (meta, prose, gallery, bottom Back) mount and
 *   fade in after landing. The fetched row is held until then, too.
 *
 * @param {{ id: string, mode?: "page" | "overlay", onClose?: () => void, heroActive?: boolean, bodyReady?: boolean }} props
 */
export function CaseView({ id, mode = "page", onClose, heroActive, bodyReady }) {
  const navigate = useNavigate();
  // Overlay: only Back + hero + title on the first frame; the rest mounts
  // after the card has landed (CaseOverlay sets bodyReady). Page mode: all at once.
  const showBody = mode !== "overlay" || Boolean(bodyReady);

  // What the /works list already had (hero + title render from this).
  const [cached] = useState(() => workCache.get(id) ?? null);
  // The full row: undefined = not back yet, null = not found.
  const [fetched, setFetched] = useState(undefined);
  const [zoomed, setZoomed] = useState(null);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) workCache.set(id, { ...workCache.get(id), ...data });
        setFetched(data ?? null);
      });
    return () => { cancelled = true; };
  }, [id]);

  // Hold the fetched row until the body is shown: swapping data in
  // mid-flight re-lays-out the page and drops frames.
  const arrived = showBody && fetched !== undefined;
  const project = arrived && fetched ? { ...cached, ...fetched } : cached;
  const loading = !cached && !arrived;

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
  // attr: data-enter (fades in with the title) or data-body (after landing).
  const back = (extra = "", attr = { "data-enter": "" }) => (
    <button onClick={goBack} className={`${styles.back} ${extra}`} {...attr}>← Back</button>
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
              <img src={cover} alt="" className={styles.heroMedia} decoding="sync" />
            ))}
          </HoverPlayCard>
        )}

        <header className={styles.header}>
          <h1 id={titleId} className={styles.title} tabIndex={-1} data-enter="">{project.title}</h1>
          {showBody && metaItems.length > 0 && (
            <p className={styles.meta} data-body="">
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

        {showBody && (
          <>
            {/* Description (Tiptap HTML): intro paragraph → h2 sections */}
            {html && (
              <div className={styles.prose} data-body="" dangerouslySetInnerHTML={{ __html: html }} />
            )}

            {/* Gallery images with captions */}
            {project.images?.length > 0 && (
              <div className={styles.prose} data-body="">
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

            <hr className={styles.rule} data-body="" />
            {back("", { "data-body": "" })}
          </>
        )}
      </article>

      <Lightbox image={zoomed} onClose={() => setZoomed(null)} />
    </main>
  );
}
