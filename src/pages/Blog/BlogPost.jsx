import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./BlogPost.module.css";

const isVideo = (url) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url ?? "");

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("dark-page");
    return () => document.body.classList.remove("dark-page");
  }, []);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        setPost(data ?? null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <main className={styles.page}>
      <p className={styles.stateText}>Loading…</p>
    </main>
  );

  if (!post) return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/blog" className={styles.back}>← Back</Link>
      </div>
      <p className={styles.stateText}>Post not found.</p>
    </main>
  );

  return (
    <main className={styles.page}>

      {/* ← Back (top) */}
      <div className={styles.topBar}>
        <Link to="/blog" className={styles.back}>← Back</Link>
      </div>

      {/* Hero cover */}
      {post.cover_image && (
        <div className={styles.hero}>
          {isVideo(post.cover_image) ? (
            <video
              src={post.cover_image}
              className={styles.heroMedia}
              autoPlay muted loop playsInline
            />
          ) : (
            <img src={post.cover_image} alt={post.title} className={styles.heroMedia} />
          )}
        </div>
      )}

      <div className={styles.inner}>

        {/* Date + tags */}
        <div className={styles.meta}>
          {post.date && <time className={styles.date}>{post.date}</time>}
          {post.tags?.length > 0 && (
            <ul className={styles.tags}>
              {post.tags.map((t) => (
                <li key={t} className={styles.tag}>{t}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Title */}
        <h1 className={styles.title}>{post.title}</h1>

        {/* Content */}
        {post.content && (
          <div
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* ← Back (bottom) */}
        <Link to="/blog" className={`${styles.back} ${styles.backBottom}`}>
          ← Back
        </Link>

      </div>
    </main>
  );
}
