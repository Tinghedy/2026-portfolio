import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import CoverTag from "./CoverTag";
import styles from "./Works.module.css";

const stripHtml = (html) => (html ?? "").replace(/<[^>]+>/g, "");
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
 */

/** @param {{ work: Work }} props */
function WorkCard({ work }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const tagline = stripHtml(work.description).slice(0, 130) || null;
  const hasVideo = isVideo(work.cover_image);
  const coverTag = work.cover_image ? work.tag : null;

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
        <div className={styles.cardTop}>
          {work.year && <span className={styles.year}>{work.year}</span>}
          <h2 className={styles.title}>{work.title}</h2>
          {tagline && <p className={styles.tagline}>{tagline}</p>}
          {work.tags?.length > 0 && (
            <ul className={styles.tags}>
              {work.tags.map((tag) => (
                <li key={tag} className={styles.tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>

        {work.cover_image && (
          <div className={styles.coverOuter}>
            <div className={styles.mediaWrap}>
              {hasVideo ? (
                <video
                  ref={videoRef}
                  src={work.cover_image}
                  className={styles.media}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img src={work.cover_image} alt={work.title} className={styles.media} />
              )}
            </div>
            {coverTag && <CoverTag label={coverTag} />}
          </div>
        )}
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
          tag: includeTag ? work.tag ?? null : work.title === "Young Ones" ? "Young Ones Awards — UX" : null,
        }));

      const primaryResult = await supabase
        .from("projects")
        .select("id, title, description, cover_image, tags, year, tag")
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
