import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import styles from "./NotesDashboard.module.css";

function ConfirmDialog({ note, onConfirm, onCancel }) {
  return (
    <div className={styles.dialogOverlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <p className={styles.dialogText}>
          Delete <strong>{note.title}</strong>?
        </p>
        <div className={styles.dialogActions}>
          <button onClick={onCancel} className={styles.btnCancel}>Cancel</button>
          <button onClick={onConfirm} className={styles.btnConfirmDelete}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function NotesDashboard() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    supabase
      .from("notes")
      .select("id, title, date, tags, summary")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setNotes(data ?? []);
        setLoading(false);
      });
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from("notes").delete().eq("id", deleteTarget.id);
    setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id));
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
            Learning Notes <span className={styles.dropdownCaret}>▾</span>
          </button>
          {showDropdown && (
            <>
              <div className={styles.dropdownBackdrop} onClick={() => setShowDropdown(false)} />
              <ul className={styles.dropdownMenu} role="listbox">
                <li role="option" aria-selected="false" className={styles.dropdownItem} onClick={() => navigate("/admin/dashboard")}>
                  Works
                </li>
                <li role="option" aria-selected="false" className={styles.dropdownItem} onClick={() => navigate("/admin/blog")}>
                  Blog
                </li>
                <li role="option" aria-selected="true" className={`${styles.dropdownItem} ${styles.dropdownItemActive}`} onClick={() => setShowDropdown(false)}>
                  Learning Notes
                </li>
              </ul>
            </>
          )}
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => navigate("/admin/notes/new")} className={styles.btnNew}>
            + New Note
          </button>
        </div>
      </header>

      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : notes.length === 0 ? (
        <p className={styles.empty}>No notes yet. Write one!</p>
      ) : (
        <div className={styles.grid}>
          {notes.map((note) => (
            <div key={note.id} className={styles.card}>
              <div className={styles.cardBody}>
                <time className={styles.date}>{note.date}</time>
                <h2 className={styles.cardTitle}>{note.title}</h2>
                {note.summary && <p className={styles.summary}>{note.summary}</p>}
                {note.tags?.length > 0 && (
                  <ul className={styles.tags}>
                    {note.tags.map((t) => (
                      <li key={t} className={styles.tag}>#{t}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={styles.cardActions}>
                <button onClick={() => navigate(`/admin/notes/edit/${note.id}`)} className={styles.btnEdit}>
                  Edit
                </button>
                <button onClick={() => setDeleteTarget(note)} className={styles.btnDelete}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          note={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
}
