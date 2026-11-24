import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Label from "../../components/Label/Label";
import styles from "./BlogPost.module.css";

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <button onClick={() => navigate("/blog")} className={styles.back}>← Back</button>
      </div>
      <p className={styles.stateText}>Post not found.</p>
    </main>
  );

  return (
    <main className={styles.page}>

      {/* ← Back (top) */}
      <div className={styles.topBar}>
        <button onClick={() => navigate("/blog")} className={styles.back}>← Back</button>
      </div>

      <div className={styles.inner}>

        {/* Date + tags */}
        <div className={styles.meta}>
          {post.date && <Label as="time">{post.date}</Label>}
          {post.tags?.length > 0 && (
            <ul className={styles.tags}>
              {post.tags.map((t) => (
                <Label as="li" variant="outline" key={t}>{t}</Label>
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
        <button
          onClick={() => navigate("/blog")}
          className={`${styles.back} ${styles.backBottom}`}
        >
          ← Back
        </button>

      </div>
    </main>
  );
}
