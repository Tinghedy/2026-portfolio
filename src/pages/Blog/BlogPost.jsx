import { useParams, Link } from "react-router-dom";
import styles from "./BlogPost.module.css";

export default function BlogPost() {
  const { slug } = useParams();

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link to="/blog" className={styles.back}>
          ← Back to Blog
        </Link>
        <h1 className={styles.title}>{slug}</h1>
        <p className={styles.placeholder}>This page is a placeholder. Content coming soon.</p>
      </div>
    </main>
  );
}
