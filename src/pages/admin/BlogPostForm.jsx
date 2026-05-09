import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { supabase } from "../../lib/supabase";
import { uploadImage } from "../../lib/uploadImage";
import styles from "./BlogPostForm.module.css";

const AUTO_SAVE_MS = 30 * 60 * 1000;

function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatTime(d) {
  return d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
}

export default function BlogPostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const slugTouched = useRef(false);
  const fileInputRef = useRef(null);
  const savedIdRef = useRef(id ?? null);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({ title: "", slug: "", date: today, summary: "", content: "" });
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  const [editorReady, setEditorReady] = useState(!id);
  const [initialContent, setInitialContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | Date
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load existing post for edit mode
  useEffect(() => {
    if (!id) return;
    supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError("Post not found."); return; }
        slugTouched.current = true;
        const loaded = {
          title: data.title ?? "",
          slug: data.slug ?? "",
          date: data.date ?? today,
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

  // Populate editor once data loads (edit mode)
  useEffect(() => {
    if (editor && initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  // Save (used for both manual and auto-save)
  const savePost = useCallback(async ({ redirect = false } = {}) => {
    const f = formRef.current;
    if (!f.title.trim()) return;

    setSaving(true);
    setSaveStatus("saving");
    setError("");

    const payload = {
      title: f.title,
      slug: f.slug || toSlug(f.title),
      date: f.date,
      summary: f.summary,
      content: f.content,
    };

    try {
      if (savedIdRef.current) {
        const { error: err } = await supabase.from("posts").update(payload).eq("id", savedIdRef.current);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase.from("posts").insert(payload).select("id").single();
        if (err) throw err;
        savedIdRef.current = data.id;
      }
      setSaveStatus(new Date());
      if (redirect) navigate("/admin/blog");
    } catch (err) {
      setError(err.message);
      setSaveStatus(null);
    } finally {
      setSaving(false);
    }
  }, [navigate]);

  // Auto-save every 30 minutes
  useEffect(() => {
    const timer = setInterval(() => savePost(), AUTO_SAVE_MS);
    return () => clearInterval(timer);
  }, [savePost]);

  // ⌘S to save
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        savePost();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [savePost]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const next = {
      ...formRef.current,
      title,
      slug: slugTouched.current ? formRef.current.slug : toSlug(title),
    };
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
      const url = await uploadImage(file, "blog/");
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
        <button type="button" onClick={() => navigate("/admin/blog")} className={styles.btnBack}>
          ← Blog
        </button>
        <span className={styles.topBarTitle}>
          {form.title || (id ? "Edit Post" : "New Post")}
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
          onClick={() => savePost({ redirect: true })}
          disabled={saving}
          className={styles.btnPublish}
        >
          {saving ? "Saving…" : "Publish"}
        </button>
      </header>

      {/* ── Settings drawer ── */}
      {showSettings && (
        <div className={styles.settingsPanel}>
          <label className={styles.settingsLabel}>
            Slug
            <input
              type="text"
              value={form.slug}
              onChange={(e) => { slugTouched.current = true; updateField("slug")(e); }}
              className={styles.settingsInput}
              placeholder="url-friendly-slug"
            />
          </label>
          <label className={styles.settingsLabel}>
            Date
            <input
              type="date"
              value={form.date}
              onChange={updateField("date")}
              className={styles.settingsInput}
            />
          </label>
          <label className={styles.settingsLabel} style={{ gridColumn: "1 / -1" }}>
            Summary
            <textarea
              value={form.summary}
              onChange={updateField("summary")}
              rows={2}
              className={styles.settingsInput}
              placeholder="One-line description shown in the blog list"
              style={{ resize: "vertical", lineHeight: "1.6" }}
            />
          </label>
        </div>
      )}

      {/* ── Toolbar ── */}
      {editor && (
        <div className={styles.toolbar}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? styles.toolbarActive : ""}
            aria-label="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? styles.toolbarActive : ""}
            aria-label="Italic"
          >
            <em>I</em>
          </button>
          <span className={styles.divider} />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? styles.toolbarActive : ""}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive("heading", { level: 3 }) ? styles.toolbarActive : ""}
          >
            H3
          </button>
          <span className={styles.divider} />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? styles.toolbarActive : ""}
          >
            • List
          </button>
          <span className={styles.divider} />
          <button
            type="button"
            onClick={setLink}
            className={editor.isActive("link") ? styles.toolbarActive : ""}
          >
            Link
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageFile}
          />
        </div>
      )}

      {/* ── Document ── */}
      <div className={styles.document}>
        <div className={styles.documentInner}>
          {error && <p className={styles.error}>{error}</p>}
          <input
            type="text"
            value={form.title}
            onChange={handleTitleChange}
            className={styles.titleInput}
            placeholder="Post title"
          />
          {editorReady && editor && (
            <EditorContent editor={editor} className={styles.editorContent} />
          )}
        </div>
      </div>
    </div>
  );
}
