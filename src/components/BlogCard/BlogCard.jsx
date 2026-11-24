import { Link } from "react-router-dom";
import Label from "../Label/Label";
import styles from "./BlogCard.module.css";

/**
 * Blog list card: text only — Blog posts have no cover image, on the
 * list or the article page. Date, title, summary (3 lines max), tags.
 * Square, no shadow; hover draws a 1px frame (rectangle = attention).
 */
export default function BlogCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className={styles.card}>
      {post.date && <Label as="time">{post.date}</Label>}
      <h2 className={styles.title}>{post.title}</h2>
      {post.summary && <p className={styles.summary}>{post.summary}</p>}
      {post.tags?.length > 0 && (
        <ul className={styles.tags}>
          {post.tags.map((tag) => (
            <Label as="li" variant="outline" key={tag}>{tag}</Label>
          ))}
        </ul>
      )}
    </Link>
  );
}
