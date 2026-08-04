import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./Works.module.css";

const isVideo = (url) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url ?? "");

/**
 * A portfolio project as read from the Supabase `projects` table.
 *
 * @typedef {Object} Work
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} [cover_image]
 * @property {string[]} [tags]
 * @property {number} [year]
 * @property {string | null} tag  Cover-badge label; null = no badge.
 * @property {string | null} [tag_color]  Cover-badge hex color; null = default.
 */

/** @param {{ work: Work }} props */
function WorkCard({ work }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  // Treat null / undefined / empty / whitespace-only all as "no cover"
  // so those cards always fall through to the fallback tile.
  const cover = typeof work.cover_image === "string" ? work.cover_image.trim() : "";
  const hasCover = cover !== "";
  const hasVideo = isVideo(cover);
  // One secondary line only: prefer the year, else a single category.
  const meta = work.year || work.tags?.[0] || null;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) v.play().catch(() => {});
    else { v.pause(); v.currentTime = 0; }
  }, [hovered]);

  return (
    <div className={styles.cardWrapper}>
      <Link
        to={`/works/${work.id}`}
        className={styles.card}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={styles.mediaWrap}>
          {hasCover ? (
            hasVideo ? (
              <video
                ref={videoRef}
                src={cover}
                className={styles.media}
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img src={cover} alt={work.title} className={styles.media} />
            )
          ) : (
            <div className={styles.fallback}>
              <span className={styles.fallbackTitle}>{work.title}</span>
            </div>
          )}
        </div>

        <div className={styles.meta}>
          <h2 className={styles.title}>{work.title}</h2>
          {meta && <span className={styles.year}>{meta}</span>}
        </div>
      </Link>
    </div>
  );
}

export default function Works() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("dark-page");
    return () => document.body.classList.remove("dark-page");
  }, []);

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (!supabaseUrl || supabaseUrl.includes("your-project-id.supabase.co")) {
      setError("Supabase URL 尚未設定為實際專案網址，因此作品資料無法載入。");
      setWorks([]);
      setLoading(false);
      return;
    }

    const loadWorks = async () => {
      const normalizeWorks = (rows, includeTag) =>
        (rows ?? []).map((work) => ({
          ...work,
          tag: includeTag ? work.tag ?? null : null,
          tag_color: includeTag ? work.tag_color ?? null : null,
        }));

      const primaryResult = await supabase
        .from("projects")
        .select("id, title, description, cover_image, tags, year, tag, tag_color")
        .order("order_index", { ascending: true });

      if (!primaryResult.error) {
        setWorks(normalizeWorks(primaryResult.data, true));
        setLoading(false);
        return;
      }

      if (primaryResult.error.message?.includes("column projects.tag does not exist")) {
        const fallbackResult = await supabase
          .from("projects")
          .select("id, title, description, cover_image, tags, year")
          .order("order_index", { ascending: true });

        if (fallbackResult.error) {
          setError(fallbackResult.error.message);
          setWorks([]);
        } else {
          setWorks(normalizeWorks(fallbackResult.data, false));
        }
        setLoading(false);
        return;
      }

      setError(primaryResult.error.message);
      setWorks([]);
      setLoading(false);
    };

    loadWorks().catch((fetchError) => {
      setError(fetchError?.message || "Failed to load works.");
      setWorks([]);
      setLoading(false);
    });
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Works</h1>
        {loading ? (
          <p className={styles.empty}>Loading…</p>
        ) : error ? (
          <p className={styles.empty}>{error}</p>
        ) : works.length === 0 ? (
          <p className={styles.empty}>No works yet.</p>
        ) : (
          <div className={styles.grid}>
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
