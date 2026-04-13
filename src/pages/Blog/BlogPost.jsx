import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./BlogPost.module.css";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("posts")
      .select("title, date, content")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        setPost(data ?? null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <main className={styles.page}><div className={styles.inner} /></main>;

  if (!post) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <Link to="/blog" className={styles.back}>← Back to Blog</Link>
          <p className={styles.placeholder}>Post not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to="/blog" className={styles.back}>← Back to Blog</Link>
        <time className={styles.date}>{post.date}</time>
        <h1 className={styles.title}>{post.title}</h1>
        {post.content && (
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </div>
    </main>
  );
}
