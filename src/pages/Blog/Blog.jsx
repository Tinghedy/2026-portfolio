import { Link } from "react-router-dom";
import { posts } from "../../data/blog";
import styles from "./Blog.module.css";

export default function Blog() {
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
