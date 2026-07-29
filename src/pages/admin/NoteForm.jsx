import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { supabase } from "../../lib/supabase";
import { uploadImage } from "../../lib/uploadImage";
import DrawingCanvas from "../../components/DrawingCanvas/DrawingCanvas";
import FigmaImportModal from "../../components/admin/FigmaImportModal";
import AIAssistantBar from "../../components/admin/AIAssistantBar";
import styles from "./BlogPostForm.module.css";

const AUTO_SAVE_MS = 30 * 60 * 1000;

function formatTime(d) {
  return d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
}

export default function NoteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const savedIdRef = useRef(id ?? null);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({ title: "", date: today, tags: "", summary: "", content: "" });
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  const [editorReady, setEditorReady] = useState(!id);
  const [initialContent, setInitialContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [showFigmaModal, setShowFigmaModal] = useState(false);

  const handleImportFigmaImages = (images) => {
    if (!editor || !images?.length) return;
    images.forEach((img) => {
      editor.chain().focus().setImage({ src: img.url }).run();
    });
  };

  // Load existing note
  useEffect(() => {
    if (!id) return;
    supabase.from("notes").select("*").eq("id", id).single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError("Note not found."); return; }
        const loaded = {
          title: data.title ?? "",
          date: data.date ?? today,
          tags: (data.tags ?? []).join(", "),
          summary: data.summary ?? "",
          content: data.content ?? "",
        };
        setForm(loaded);
        formRef.current = loaded;
        setInitialContent(data.content ?? "");
        setEditorReady(true);
      });
  }, [id]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: {}, italic: {}, heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm(prev => ({ ...prev, content: html }));
      formRef.current = { ...formRef.current, content: html };
      setSaveStatus(null);
    },
  });

  useEffect(() => {
    if (editor && initialContent) editor.commands.setContent(initialContent);
  }, [editor, initialContent]);

  const parseTags = (raw) =>
    raw.split(",").map(t => t.trim()).filter(Boolean);

  const saveNote = useCallback(async ({ redirect = false } = {}) => {
    const f = formRef.current;
    if (!f.title.trim()) return;
    setSaving(true);
    setSaveStatus("saving");
    setError("");
    const payload = {
      title: f.title,
      date: f.date,
      tags: parseTags(f.tags),
      summary: f.summary,
      content: f.content,
    };
    try {
      if (savedIdRef.current) {
        const { error: err } = await supabase.from("notes").update(payload).eq("id", savedIdRef.current);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase.from("notes").insert(payload).select("id").single();
        if (err) throw err;
        savedIdRef.current = data.id;
      }
      setSaveStatus(new Date());
      if (redirect) navigate("/admin/notes");
    } catch (err) {
      setError(err.message);
      setSaveStatus(null);
    } finally {
      setSaving(false);
    }
  }, [navigate]);

  // Auto-save every 30 min
  useEffect(() => {
    const timer = setInterval(() => saveNote(), AUTO_SAVE_MS);
    return () => clearInterval(timer);
  }, [saveNote]);

  // ⌘S
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveNote();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveNote]);

  const handleTitleChange = (e) => {
    const next = { ...formRef.current, title: e.target.value };
    setForm(next);
    formRef.current = next;
    setSaveStatus(null);
  };

  const updateField = (key) => (e) => {
    const next = { ...formRef.current, [key]: e.target.value };
    setForm(next);
    formRef.current = next;
  };

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    e.target.value = "";
    setUploading(true);
    try {
      const url = await uploadImage(file, "notes/");
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrawingInsert = async (blob) => {
    setShowDrawing(false);
    if (!editor) return;
    setUploading(true);
    try {
      const file = new File([blob], `drawing-${Date.now()}.png`, { type: "image/png" });
      const url = await uploadImage(file, "notes/drawings/");
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const statusText =
    saveStatus === "saving" ? "儲存中..." :
    saveStatus instanceof Date ? `已自動儲存 ${formatTime(saveStatus)}` : "";

  return (
    <div className={styles.page}>
      {/* ── Top bar ── */}
      <header className={styles.topBar}>
        <button type="button" onClick={() => navigate("/admin/notes")} className={styles.btnBack}>
          ← Notes
        </button>
        <span className={styles.topBarTitle}>
          {form.title || (id ? "Edit Note" : "New Note")}
        </span>
        {statusText && <span className={styles.saveStatus}>{statusText}</span>}
        <button
          type="button"
          onClick={() => setShowSettings(s => !s)}
          className={`${styles.btnSettings}${showSettings ? ` ${styles.btnSettingsActive}` : ""}`}
        >
          ⚙ Settings
        </button>
        <button
          type="button"
          onClick={() => saveNote({ redirect: true })}
          disabled={saving}
          className={styles.btnPublish}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </header>

      {/* ── Settings drawer ── */}
      {showSettings && (
        <div className={styles.settingsPanel}>
          <label className={styles.settingsLabel}>
            Date
            <input type="date" value={form.date} onChange={updateField("date")} className={styles.settingsInput} />
          </label>
          <label className={styles.settingsLabel}>
            Tags
            <input
              type="text"
              value={form.tags}
              onChange={updateField("tags")}
              className={styles.settingsInput}
              placeholder="tag1, tag2, tag3"
            />
          </label>
          <label className={styles.settingsLabel} style={{ gridColumn: "1 / -1" }}>
            Summary
            <textarea
              value={form.summary}
              onChange={updateField("summary")}
              rows={2}
              className={styles.settingsInput}
              placeholder="One-line description"
              style={{ resize: "vertical", lineHeight: "1.6" }}
            />
          </label>
        </div>
      )}

      {/* ── Toolbar ── */}
      {editor && (
        <div className={styles.toolbar}>
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? styles.toolbarActive : ""} aria-label="Bold">
            <strong>B</strong>
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive("italic") ? styles.toolbarActive : ""} aria-label="Italic">
            <em>I</em>
          </button>
          <span className={styles.divider} />
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive("heading", { level: 2 }) ? styles.toolbarActive : ""}>H2</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive("heading", { level: 3 }) ? styles.toolbarActive : ""}>H3</button>
          <span className={styles.divider} />
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? styles.toolbarActive : ""}>• List</button>
          <span className={styles.divider} />
          <button type="button" onClick={setLink} className={editor.isActive("link") ? styles.toolbarActive : ""}>Link</button>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "Image"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageFile} />
          <span className={styles.divider} />
          <button type="button" onClick={() => setShowDrawing(true)} disabled={uploading}>
            ✏ Draw
          </button>
          <span className={styles.divider} />
          <button type="button" onClick={() => setShowFigmaModal(true)} style={{ color: "#0d99ff", fontWeight: 500 }}>
            🎨 Figma 匯入
          </button>
        </div>
      )}

      {/* ── Document ── */}
      <div className={styles.document}>
        <div className={styles.documentInner}>
          <AIAssistantBar
            title={form.title}
            content={editor?.getText() ?? ""}
            onApplyOutline={(outline) => {
              if (editor) {
                const formatted = outline.replace(/\n/g, "<br>");
                editor.chain().focus().setContent(editor.getHTML() + "<br>" + formatted).run();
              }
            }}
            onApplyPolish={(polished) => {
              if (editor) editor.chain().focus().setContent(polished.replace(/\n/g, "<br>")).run();
            }}
            onApplySummary={(summary) => {
              const next = { ...formRef.current, summary };
              setForm(next);
              formRef.current = next;
            }}
            onApplyTags={(tags) => {
              const currentTags = (form.tags || "").split(",").map((s) => s.trim()).filter(Boolean);
              const merged = Array.from(new Set([...currentTags, ...tags])).join(", ");
              const next = { ...formRef.current, tags: merged };
              setForm(next);
              formRef.current = next;
            }}
          />

          {error && <p className={styles.error}>{error}</p>}
          <input
            type="text"
            value={form.title}
            onChange={handleTitleChange}
            className={styles.titleInput}
            placeholder="Note title"
          />
          {editorReady && editor && (
            <EditorContent editor={editor} className={styles.editorContent} />
          )}
        </div>
      </div>

      {/* ── Drawing canvas modal ── */}
      {showDrawing && (
        <DrawingCanvas
          onInsert={handleDrawingInsert}
          onClose={() => setShowDrawing(false)}
        />
      )}

      <FigmaImportModal
        isOpen={showFigmaModal}
        onClose={() => setShowFigmaModal(false)}
        onImportImages={handleImportFigmaImages}
      />
    </div>
  );
}
