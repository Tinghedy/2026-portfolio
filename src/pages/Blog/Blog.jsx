import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./Blog.module.css";

const isVideo = (url) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url ?? "");

function BlogCard({ post }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const hasVideo = isVideo(post.cover_image);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) v.play().catch(() => {});
    else { v.pause(); v.currentTime = 0; }
  }, [hovered]);

  return (
    <div className={styles.cardWrapper}>
      <Link
        to={`/blog/${post.slug}`}
        className={styles.card}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={styles.cardTop}>
          {post.date && <span className={styles.year}>{post.date}</span>}
          <h2 className={styles.title}>{post.title}</h2>
          {post.summary && <p className={styles.tagline}>{post.summary}</p>}
          {post.tags?.length > 0 && (
            <ul className={styles.tags}>
              {post.tags.map((tag) => (
                <li key={tag} className={styles.tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>

        {post.cover_image && (
          <div className={styles.mediaWrap}>
            {hasVideo ? (
              <video
                ref={videoRef}
                src={post.cover_image}
                className={styles.media}
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img src={post.cover_image} alt={post.title} className={styles.media} />
            )}
          </div>
        )}
      </Link>
    </div>
  );
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("dark-page");
    return () => document.body.classList.remove("dark-page");
  }, []);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .order("date", { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Blog</h1>
        {loading ? (
          <p className={styles.empty}>Loading…</p>
        ) : posts.length === 0 ? (
          <p className={styles.empty}>No posts yet.</p>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
