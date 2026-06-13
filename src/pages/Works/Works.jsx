import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./Works.module.css";

const stripHtml = (html) => (html ?? "").replace(/<[^>]+>/g, "");
const isVideo = (url) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url ?? "");

function WorkCard({ work }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const tagline = stripHtml(work.description).slice(0, 130) || null;
  const hasVideo = isVideo(work.cover_image);

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
        )}
      </Link>
    </div>
  );
}

export default function Works() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("dark-page");
    return () => document.body.classList.remove("dark-page");
  }, []);

  useEffect(() => {
    supabase
      .from("projects")
      .select("id, title, description, cover_image, tags, year")
      .order("order_index", { ascending: true })
      .then(({ data }) => {
        setWorks(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Works</h1>
        {loading ? (
          <p className={styles.empty}>Loading…</p>
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
