import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./WorkDetail.module.css";

const isVideo = (url) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url ?? "");

export default function WorkDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("dark-page");
    return () => document.body.classList.remove("dark-page");
  }, []);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setProject(data ?? null);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <main className={styles.page}>
      <p className={styles.stateText}>Loading…</p>
    </main>
  );

  if (!project) return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/works" className={styles.back}>← Back</Link>
      </div>
      <p className={styles.stateText}>Project not found.</p>
    </main>
  );

  const metaItems = [
    { label: "Year", value: project.year },
    { label: "My role", value: project.role },
    { label: "Team", value: project.team },
    project.link ? { label: "Link", value: project.link, isLink: true } : null,
  ].filter((m) => m && m.value);

  return (
    <main className={styles.page}>

      {/* ← Back (top) */}
      <div className={styles.topBar}>
        <Link to="/works" className={styles.back}>← Back</Link>
      </div>

      {/* Hero cover */}
      {project.cover_image && (
        <div className={styles.hero}>
          {isVideo(project.cover_image) ? (
            <video
              src={project.cover_image}
              className={styles.heroMedia}
              autoPlay muted loop playsInline
            />
          ) : (
            <img
              src={project.cover_image}
              alt={project.title}
              className={styles.heroMedia}
            />
          )}
        </div>
      )}

      <div className={styles.inner}>

        {/* Title */}
        <h1 className={styles.title}>{project.title}</h1>

        {/* Metadata */}
        {metaItems.length > 0 && (
          <div className={styles.metaBar}>
            {metaItems.map(({ label, value, isLink }, i) => (
              <div key={label} className={styles.metaItem}>
                <span className={styles.metaLabel}>{label}</span>
                {isLink ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.metaLink}
                  >
                    {String(value).replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  <span className={styles.metaValue}>{value}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Description — user writes "What's been done" + "Context" as H2 sections */}
        {project.description && (
          <div
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        )}

        {/* Gallery images with captions */}
        {project.images?.length > 0 && (
          <div className={styles.gallery}>
            {project.images.map((url, i) => {
              const caption = project.image_captions?.[i];
              return (
                <figure key={url} className={styles.figure}>
                  <img src={url} alt="" className={styles.figureImg} />
                  {caption && (
                    <figcaption className={styles.caption}>
                      <em>{caption}</em>
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        )}

        {/* ← Back (bottom) */}
        <Link to="/works" className={`${styles.back} ${styles.backBottom}`}>
          ← Back
        </Link>

      </div>
    </main>
  );
}
