import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { supabase } from "../../lib/supabase";
import styles from "./ProjectForm.module.css";

// ── Tiptap rich editor (reused from ProjectForm) ─────────────────────────────

function RichEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: {}, italic: {}, heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className={styles.editor}>
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
        <button
          type="button"
          onClick={setLink}
          className={editor.isActive("link") ? styles.toolbarActive : ""}
          aria-label="Link"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? styles.toolbarActive : ""}
          aria-label="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive("heading", { level: 3 }) ? styles.toolbarActive : ""}
          aria-label="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? styles.toolbarActive : ""}
          aria-label="Bullet list"
        >
          • List
        </button>
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}

// ── Slug generator ────────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── BlogPostForm ──────────────────────────────────────────────────────────────

export default function BlogPostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const slugTouched = useRef(false);

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: today,
    summary: "",
    content: "",
  });

  const [editorReady, setEditorReady] = useState(!isEdit);
  const [initialContent, setInitialContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("Post not found.");
          return;
        }
        slugTouched.current = true;
        setForm({
          title: data.title ?? "",
          slug: data.slug ?? "",
          date: data.date ?? today,
          summary: data.summary ?? "",
          content: data.content ?? "",
        });
        setInitialContent(data.content ?? "");
        setEditorReady(true);
      });
  }, [id, isEdit]);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched.current ? prev.slug : toSlug(title),
    }));
  };

  const handleSlugChange = (e) => {
    slugTouched.current = true;
    setForm((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title,
      slug: form.slug,
      date: form.date,
      summary: form.summary,
      content: form.content,
    };

    try {
      if (isEdit) {
        const { error } = await supabase.from("posts").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(payload);
        if (error) throw error;
      }
      navigate("/admin/blog");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.topBar}>
          <button
            type="button"
            onClick={() => navigate("/admin/blog")}
            className={styles.btnBack}
          >
            ← Blog
          </button>
          <h1 className={styles.heading}>
            {isEdit ? "Edit Post" : "New Post"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <label className={styles.label}>
            Title
            <input
              type="text"
              value={form.title}
              onChange={handleTitleChange}
              required
              className={styles.input}
              placeholder="Post title"
            />
          </label>

          {/* Slug */}
          <label className={styles.label}>
            Slug
            <input
              type="text"
              value={form.slug}
              onChange={handleSlugChange}
              required
              className={styles.input}
              placeholder="url-friendly-slug"
            />
          </label>

          {/* Date */}
          <label className={styles.label}>
            Date
            <input
              type="date"
              {...field("date")}
              required
              className={styles.input}
              style={{ maxWidth: "180px" }}
            />
          </label>

          {/* Summary */}
          <label className={styles.label}>
            Summary
            <textarea
              {...field("summary")}
              rows={2}
              className={styles.input}
              placeholder="One-line description shown in the blog list"
              style={{ resize: "vertical", lineHeight: "1.6" }}
            />
          </label>

          {/* Content */}
          <div className={styles.label}>
            Content
            {editorReady && (
              <RichEditor
                content={initialContent}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, content: html }))
                }
              />
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formFooter}>
            <button
              type="button"
              onClick={() => navigate("/admin/blog")}
              className={styles.btnCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={styles.btnSave}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Publish"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
