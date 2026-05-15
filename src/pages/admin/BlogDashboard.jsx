import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./BlogDashboard.module.css";

// ── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ post, onConfirm, onCancel }) {
  return (
    <div className={styles.dialogOverlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <p className={styles.dialogText}>
          Delete <strong>{post.title}</strong>?
        </p>
        <div className={styles.dialogActions}>
          <button onClick={onCancel} className={styles.btnCancel}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.btnConfirmDelete}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BlogDashboard ─────────────────────────────────────────────────────────────

export default function BlogDashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, date, summary, slug")
      .order("date", { ascending: false });

    if (!error) setPosts(data ?? []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("posts").delete().eq("id", deleteTarget.id);
    setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.dropdownWrapper}>
          <button
            className={styles.dropdownTrigger}
            onClick={() => setShowDropdown(s => !s)}
            aria-haspopup="listbox"
            aria-expanded={showDropdown}
          >
            Blog <span className={styles.dropdownCaret}>▾</span>
          </button>
          {showDropdown && (
            <>
              <div className={styles.dropdownBackdrop} onClick={() => setShowDropdown(false)} />
              <ul className={styles.dropdownMenu} role="listbox">
                <li
                  role="option"
                  aria-selected="false"
                  className={styles.dropdownItem}
                  onClick={() => navigate("/admin/dashboard")}
                >
                  Works
                </li>
                <li
                  role="option"
                  aria-selected="true"
                  className={`${styles.dropdownItem} ${styles.dropdownItemActive}`}
                  onClick={() => setShowDropdown(false)}
                >
                  Blog
                </li>
                <li
                  role="option"
                  aria-selected="false"
                  className={styles.dropdownItem}
                  onClick={() => navigate("/admin/notes")}
                >
                  Learning Notes
                </li>
              </ul>
            </>
          )}
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => navigate("/admin/blog/new")}
            className={styles.btnNew}
          >
            + New Post
          </button>
        </div>
      </header>

      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : posts.length === 0 ? (
        <p className={styles.empty}>No posts yet. Write one!</p>
      ) : (
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.id} className={styles.item}>
              <div className={styles.itemBody}>
                <time className={styles.date}>{post.date}</time>
                <h2 className={styles.itemTitle}>{post.title}</h2>
                {post.summary && (
                  <p className={styles.summary}>{post.summary}</p>
                )}
              </div>
              <div className={styles.itemActions}>
                <button
                  onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                  className={styles.btnEdit}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(post)}
                  className={styles.btnDelete}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleteTarget && (
        <ConfirmDialog
          post={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
}
