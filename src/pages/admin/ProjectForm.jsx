import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { supabase } from "../../lib/supabase";
import { uploadImage, deleteImageByUrl } from "../../lib/uploadImage";
import styles from "./ProjectForm.module.css";

// ── Tiptap editor ────────────────────────────────────────────────────────────

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
          aria-label="Heading"
        >
          H2
        </button>
      </div>
      <EditorContent editor={editor} className={styles.editorContent} />
    </div>
  );
}

// ── Tag input ────────────────────────────────────────────────────────────────

function TagsInput({ tags, onChange }) {
  const [input, setInput] = useState("");

  const add = () => {
    const tag = input.trim();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
  };

  const remove = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className={styles.tagsWrapper}>
      {tags.map((tag) => (
        <span key={tag} className={styles.tagPill}>
          {tag}
          <button type="button" onClick={() => remove(tag)} aria-label={`Remove ${tag}`}>
            ×
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="Type and press Enter…"
        className={styles.tagInput}
      />
    </div>
  );
}

// ── Image preview row ────────────────────────────────────────────────────────

function ImageGrid({ existingUrls, newFiles, onRemoveExisting, onRemoveNew }) {
  return (
    <div className={styles.imageGrid}>
      {existingUrls.map((url) => (
        <div key={url} className={styles.imgThumb}>
          <img src={url} alt="" />
          <button
            type="button"
            onClick={() => onRemoveExisting(url)}
            className={styles.imgRemove}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      ))}
      {newFiles.map((file, i) => (
        <div key={i} className={styles.imgThumb}>
          <img src={URL.createObjectURL(file)} alt="" />
          <button
            type="button"
            onClick={() => onRemoveNew(i)}
            className={styles.imgRemove}
            aria-label="Remove image"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main form ────────────────────────────────────────────────────────────────

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    year: new Date().getFullYear(),
    tags: [],
    description: "",
  });

  // Cover
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  // Gallery
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  // Editor readiness (wait for project data in edit mode)
  const [editorReady, setEditorReady] = useState(!isEdit);
  const [initialContent, setInitialContent] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setError("Project not found.");
          return;
        }
        setForm({
          title: data.title ?? "",
          year: data.year ?? new Date().getFullYear(),
          tags: data.tags ?? [],
          description: data.description ?? "",
        });
        setCoverPreview(data.cover_image ?? "");
        setExistingImages(data.images ?? []);
        setInitialContent(data.description ?? "");
        setEditorReady(true);
      });
  }, [id, isEdit]);

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Upload cover
      let coverUrl = coverPreview;
      if (coverFile) coverUrl = await uploadImage(coverFile, "covers/");

      // Upload gallery
      const newUrls = await Promise.all(
        imageFiles.map((f) => uploadImage(f, "gallery/"))
      );

      // Delete removed images from storage
      await Promise.all(removedImages.map(deleteImageByUrl));

      const payload = {
        ...form,
        cover_image: coverUrl,
        images: [...existingImages, ...newUrls],
      };

      if (isEdit) {
        const { error } = await supabase.from("projects").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data: maxData } = await supabase
          .from("projects")
          .select("order_index")
          .order("order_index", { ascending: false })
          .limit(1);

        const maxOrder = maxData?.[0]?.order_index ?? -1;

        const { error } = await supabase
          .from("projects")
          .insert({ ...payload, order_index: maxOrder + 1 });
        if (error) throw error;
      }

      navigate("/admin/dashboard");
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
            onClick={() => navigate("/admin/dashboard")}
            className={styles.btnBack}
          >
            ← Dashboard
          </button>
          <h1 className={styles.heading}>{isEdit ? "Edit Project" : "New Project"}</h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <label className={styles.label}>
            Title
            <input
              type="text"
              {...field("title")}
              required
              className={styles.input}
              placeholder="Project title"
            />
          </label>

          {/* Year */}
          <label className={styles.label}>
            Year
            <input
              type="number"
              {...field("year")}
              min="2000"
              max="2099"
              className={styles.input}
              style={{ maxWidth: "120px" }}
            />
          </label>

          {/* Tags */}
          <div className={styles.label}>
            Tags
            <TagsInput
              tags={form.tags}
              onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
            />
          </div>

          {/* Cover image */}
          <div className={styles.label}>
            Cover Image
            {coverPreview && (
              <div className={styles.coverPreview}>
                <img src={coverPreview} alt="Cover preview" />
                <button
                  type="button"
                  onClick={() => { setCoverFile(null); setCoverPreview(""); }}
                  className={styles.removeCover}
                >
                  Remove
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className={styles.fileInput}
            />
          </div>

          {/* Gallery images */}
          <div className={styles.label}>
            Gallery Images
            <ImageGrid
              existingUrls={existingImages}
              newFiles={imageFiles}
              onRemoveExisting={(url) => {
                setExistingImages((prev) => prev.filter((u) => u !== url));
                setRemovedImages((prev) => [...prev, url]);
              }}
              onRemoveNew={(i) =>
                setImageFiles((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryChange}
              className={styles.fileInput}
            />
          </div>

          {/* Description (Tiptap) */}
          <div className={styles.label}>
            Description
            {editorReady && (
              <RichEditor
                content={initialContent}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, description: html }))
                }
              />
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formFooter}>
            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className={styles.btnCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={styles.btnSave}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
