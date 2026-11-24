import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import BlogCard from "../../components/BlogCard/BlogCard";
import Reveal from "../../motion/Reveal";
import styles from "./Blog.module.css";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
            {posts.map((post, index) => (
              <Reveal key={post.slug} className={styles.cardWrapper} index={index}>
                <BlogCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
