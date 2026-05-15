import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import styles from "./Notes.module.css";

const CARD_COLORS = [
  "#D6EAF8", "#D5F5E3", "#E8DAEF",
  "#FDEBD0", "#FADBD8", "#D1F2EB",
];

function NoteCard({ note, color, onClick }) {
  return (
    <article
      className={styles.card}
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      <div className={styles.cardTop}>
        <span className={styles.cardDate}>{note.date}</span>
      </div>
      <h2 className={styles.cardTitle}>{note.title}</h2>
      {note.summary && (
        <p className={styles.cardSummary}>{note.summary}</p>
      )}
      {note.tags?.length > 0 && (
        <div className={styles.cardTags}>
          {note.tags.map((tag) => (
            <span key={tag} className={styles.cardTag}>#{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("all");
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    supabase
      .from("notes")
      .select("id, title, date, tags, summary, content")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (!error) setNotes(data ?? []);
        setLoading(false);
      });
  }, []);

  // Esc to close modal
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSelectedNote(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedNote ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedNote]);

  const allTags = ["all", ...new Set(notes.flatMap((n) => n.tags ?? []))];

  const filtered =
    activeTag === "all"
      ? notes
      : notes.filter((n) => (n.tags ?? []).includes(activeTag));

  const colorOf = (note) => {
    const idx = notes.indexOf(note);
    return CARD_COLORS[idx % CARD_COLORS.length];
  };

  return (
    <>
      <main className={`${styles.page} ${selectedNote ? styles.blurred : ""}`}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>Learning Notes</h1>
            <p className={styles.subtitle}>閱讀摘記 · 設計學習筆記</p>
          </div>
        </header>

        {allTags.length > 1 && (
          <div className={styles.tagBar}>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`${styles.tagBtn} ${activeTag === tag ? styles.tagActive : ""}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag === "all" ? "All" : `#${tag}`}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className={styles.empty}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>No notes yet.</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                color={colorOf(note)}
                onClick={() => setSelectedNote(note)}
              />
            ))}
          </div>
        )}
      </main>

      {selectedNote && (
        <div className={styles.overlay} onClick={() => setSelectedNote(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div
                className={styles.modalDot}
                style={{ backgroundColor: colorOf(selectedNote) }}
              />
              <h2 className={styles.modalTitle}>{selectedNote.title}</h2>
              <button
                className={styles.modalClose}
                onClick={() => setSelectedNote(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className={styles.modalDate}>📅 {selectedNote.date}</p>

            {selectedNote.content ? (
              <div
                className={styles.modalBody}
                dangerouslySetInnerHTML={{ __html: selectedNote.content }}
              />
            ) : selectedNote.summary ? (
              <p className={styles.modalBody}>{selectedNote.summary}</p>
            ) : null}

            {selectedNote.tags?.length > 0 && (
              <div className={styles.modalTags}>
                {selectedNote.tags.map((tag) => (
                  <span key={tag} className={styles.cardTag}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
