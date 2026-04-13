import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./Blog.module.css";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("posts")
      .select("slug, title, date, summary")
      .order("date", { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <main className={styles.page}><div className={styles.inner} /></main>;

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Blog</h1>
        <ul className={styles.list}>
          {posts.map((post, i) => (
            <li
              key={post.slug}
              className={styles.item}
              style={{ "--i": i }}
            >
              <Link to={`/blog/${post.slug}`} className={styles.link}>
                <time className={styles.date}>{post.date}</time>
                <h2 className={styles.title}>{post.title}</h2>
                <p className={styles.summary}>{post.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
