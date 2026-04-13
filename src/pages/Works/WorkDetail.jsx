import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./WorkDetail.module.css";

export default function WorkDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <p className={styles.placeholder}>Loading…</p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <Link to="/works" className={styles.back}>← Back to Works</Link>
          <p className={styles.placeholder}>Project not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to="/works" className={styles.back}>← Back to Works</Link>

        <header className={styles.header}>
          <div className={styles.meta}>
            <span className={styles.year}>{project.year}</span>
            {project.tags?.length > 0 && (
              <ul className={styles.tags}>
                {project.tags.map((t) => (
                  <li key={t} className={styles.tag}>{t}</li>
                ))}
              </ul>
            )}
          </div>
          <h1 className={styles.title}>{project.title}</h1>
        </header>

        {project.cover_image && (
          <div className={styles.coverWrap}>
            <img src={project.cover_image} alt={project.title} className={styles.cover} />
          </div>
        )}

        {project.description && (
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        )}

        {project.images?.length > 0 && (
          <div className={styles.gallery}>
            {project.images.map((url) => (
              <img key={url} src={url} alt="" className={styles.galleryImg} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
