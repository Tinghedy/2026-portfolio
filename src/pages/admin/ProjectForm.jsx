import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { supabase } from "../../lib/supabase";
import { uploadImage, uploadMedia, deleteImageByUrl } from "../../lib/uploadImage";
import styles from "./ProjectForm.module.css";

const AUTO_SAVE_MS = 30 * 60 * 1000;

function formatTime(d) {
  return d.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
}

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
          <button type="button" onClick={() => remove(tag)} aria-label={`Remove ${tag}`}>×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder="Type and press Enter…"
        className={styles.tagInput}
      />
    </div>
  );
}

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const inlineImageRef = useRef(null);
  const coverInputRef = useRef(null);
  const savedIdRef = useRef(id ?? null);

  const [form, setForm] = useState({
    title: "",
    year: new Date().getFullYear(),
    tags: [],
    description: "",
    role: "",
    team: "",
    link: "",
  });
  const formRef = useRef(form);
  useEffect(() => { formRef.current = form; }, [form]);

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingCaptions, setExistingCaptions] = useState([]);
  const [newCaptions, setNewCaptions] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const removedRef = useRef(removedImages);
  useEffect(() => { removedRef.current = removedImages; }, [removedImages]);

  const [editorReady, setEditorReady] = useState(!isEdit);
  const [initialContent, setInitialContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load existing project
  useEffect(() => {
    if (!isEdit) return;
    supabase.from("projects").select("*").eq("id", id).single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError("Project not found."); return; }
        const loaded = {
          title: data.title ?? "",
          year: data.year ?? new Date().getFullYear(),
          tags: data.tags ?? [],
          description: data.description ?? "",
          role: data.role ?? "",
          team: data.team ?? "",
          link: data.link ?? "",
        };
        setForm(loaded);
        formRef.current = loaded;
        setCoverPreview(data.cover_image ?? "");
        setExistingImages(data.images ?? []);
        setExistingCaptions(data.image_captions ?? []);
        setInitialContent(data.description ?? "");
        setEditorReady(true);
      });
  }, [id, isEdit]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: {}, italic: {}, heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: false, resize: { enabled: true, minWidth: 80 } }),
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setForm(prev => ({ ...prev, description: html }));
      formRef.current = { ...formRef.current, description: html };
      setSaveStatus(null);
    },
  });

  useEffect(() => {
    if (editor && initialContent) editor.commands.setContent(initialContent);
  }, [editor, initialContent]);

  // Text-only auto-save (no file uploads)
  const saveTextOnly = useCallback(async () => {
    const f = formRef.current;
    if (!f.title.trim()) return;
    setSaveStatus("saving");
    const payload = { title: f.title, year: Number(f.year), tags: f.tags, description: f.description };
    try {
      if (savedIdRef.current) {
        const { error: err } = await supabase.from("projects").update(payload).eq("id", savedIdRef.current);
        if (err) throw err;
      } else {
        const { data: maxData } = await supabase.from("projects").select("order_index").order("order_index", { ascending: false }).limit(1);
        const maxOrder = maxData?.[0]?.order_index ?? -1;
        const { data, error: err } = await supabase.from("projects").insert({ ...payload, order_index: maxOrder + 1 }).select("id").single();
        if (err) throw err;
        savedIdRef.current = data.id;
      }
      setSaveStatus(new Date());
    } catch (err) {
      setError(err.message);
      setSaveStatus(null);
    }
  }, []);

  // Full save with file uploads
  const saveProject = useCallback(async ({ redirect = false } = {}) => {
    const f = formRef.current;
    if (!f.title.trim()) return;
    setSaving(true);
    setSaveStatus("saving");
    setError("");
    try {
      let coverUrl = coverPreview;
      if (coverFile) coverUrl = await uploadMedia(coverFile, "covers/");
      const newUrls = await Promise.all(imageFiles.map((file) => uploadImage(file, "gallery/")));
      await Promise.all(removedRef.current.map(deleteImageByUrl));
      const allCaptions = [...existingCaptions, ...newCaptions];
      const payload = {
        title: f.title,
        year: Number(f.year),
        tags: f.tags,
        description: f.description,
        role: f.role,
        team: f.team,
        link: f.link,
        cover_image: coverUrl,
        images: [...existingImages, ...newUrls],
        image_captions: allCaptions,
      };
      if (savedIdRef.current) {
        const { error: err } = await supabase.from("projects").update(payload).eq("id", savedIdRef.current);
        if (err) throw err;
      } else {
        const { data: maxData } = await supabase.from("projects").select("order_index").order("order_index", { ascending: false }).limit(1);
        const maxOrder = maxData?.[0]?.order_index ?? -1;
        const { data, error: err } = await supabase.from("projects").insert({ ...payload, order_index: maxOrder + 1 }).select("id").single();
        if (err) throw err;
        savedIdRef.current = data.id;
      }
      setSaveStatus(new Date());
      if (redirect) navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message);
      setSaveStatus(null);
    } finally {
      setSaving(false);
    }
  }, [coverFile, coverPreview, imageFiles, existingImages, existingCaptions, newCaptions, navigate]);

  // Auto-save text every 30 min
  useEffect(() => {
    const timer = setInterval(() => saveTextOnly(), AUTO_SAVE_MS);
    return () => clearInterval(timer);
  }, [saveTextOnly]);

  // ⌘S / Ctrl+S
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveProject]);

  const handleTitleChange = (e) => {
    const next = { ...formRef.current, title: e.target.value };
    setForm(next);
    formRef.current = next;
    setSaveStatus(null);
  };

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("URL:", prev ?? "https://");
    if (url === null) return;
    if (url === "") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  const handleInlineImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    e.target.value = "";
    setUploading(true);
    try {
      const url = await uploadImage(file, "projects/");
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
        <button type="button" onClick={() => navigate("/admin/dashboard")} className={styles.btnBack}>
          ← Dashboard
        </button>
        <span className={styles.topBarTitle}>
          {form.title || (isEdit ? "Edit Project" : "New Project")}
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
          onClick={() => saveProject({ redirect: true })}
          disabled={saving}
          className={styles.btnPublish}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </header>

      {/* ── Settings drawer ── */}
      {showSettings && (
        <div className={styles.settingsPanel}>
          <div className={styles.settingsRow}>
            <label className={styles.settingsLabel}>
              Year
              <input
                type="number"
                value={form.year}
                onChange={(e) => { const next = { ...formRef.current, year: e.target.value }; setForm(next); formRef.current = next; }}
                min="2000"
                max="2099"
                className={styles.settingsInput}
                style={{ maxWidth: "110px" }}
              />
            </label>
            <div className={styles.settingsLabel}>
              Tags
              <TagsInput
                tags={form.tags}
                onChange={(tags) => { const next = { ...formRef.current, tags }; setForm(next); formRef.current = next; }}
              />
            </div>
          </div>
          <div className={styles.settingsRow}>
            <label className={styles.settingsLabel}>
              My role
              <input
                type="text"
                value={form.role}
                onChange={(e) => { const next = { ...formRef.current, role: e.target.value }; setForm(next); formRef.current = next; }}
                placeholder="e.g. UX Designer"
                className={styles.settingsInput}
              />
            </label>
            <label className={styles.settingsLabel}>
              Team
              <input
                type="text"
                value={form.team}
                onChange={(e) => { const next = { ...formRef.current, team: e.target.value }; setForm(next); formRef.current = next; }}
                placeholder="e.g. 3 people"
                className={styles.settingsInput}
              />
            </label>
          </div>
          <div className={styles.settingsRow} style={{ gridTemplateColumns: "1fr" }}>
            <label className={styles.settingsLabel}>
              Link
              <input
                type="url"
                value={form.link}
                onChange={(e) => { const next = { ...formRef.current, link: e.target.value }; setForm(next); formRef.current = next; }}
                placeholder="https://…"
                className={styles.settingsInput}
              />
            </label>
          </div>
          <div className={styles.settingsRow} style={{ gridTemplateColumns: "1fr" }}>
            <div className={styles.settingsLabel}>
              Gallery
              <div className={styles.galleryList}>
                {existingImages.map((url, i) => (
                  <div key={url} className={styles.galleryItem}>
                    <div className={styles.imgThumb}>
                      <img src={url} alt="" />
                      <button
                        type="button"
                        onClick={() => {
                          setExistingImages(prev => prev.filter((_, idx) => idx !== i));
                          setExistingCaptions(prev => prev.filter((_, idx) => idx !== i));
                          setRemovedImages(prev => [...prev, url]);
                        }}
                        className={styles.imgRemove}
                      >×</button>
                    </div>
                    <input
                      type="text"
                      value={existingCaptions[i] ?? ""}
                      onChange={(e) => setExistingCaptions(prev => { const next = [...prev]; next[i] = e.target.value; return next; })}
                      placeholder="Caption (optional)"
                      className={styles.captionInput}
                    />
                  </div>
                ))}
                {imageFiles.map((file, i) => (
                  <div key={i} className={styles.galleryItem}>
                    <div className={styles.imgThumb}>
                      <img src={URL.createObjectURL(file)} alt="" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFiles(prev => prev.filter((_, idx) => idx !== i));
                          setNewCaptions(prev => prev.filter((_, idx) => idx !== i));
                        }}
                        className={styles.imgRemove}
                      >×</button>
                    </div>
                    <input
                      type="text"
                      value={newCaptions[i] ?? ""}
                      onChange={(e) => setNewCaptions(prev => { const next = [...prev]; next[i] = e.target.value; return next; })}
                      placeholder="Caption (optional)"
                      className={styles.captionInput}
                    />
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  setImageFiles(prev => [...prev, ...files]);
                  setNewCaptions(prev => [...prev, ...files.map(() => "")]);
                }}
                className={styles.fileInput}
              />
            </div>
          </div>
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
          <button type="button" onClick={() => inlineImageRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "Image"}
          </button>
          <input ref={inlineImageRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleInlineImage} />
        </div>
      )}

      {/* ── Document ── */}
      <div className={styles.document}>
        <div className={styles.documentInner}>
          {error && <p className={styles.error}>{error}</p>}

          {/* Cover image / video zone */}
          <div
            className={styles.coverZone}
            onClick={() => coverInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && coverInputRef.current?.click()}
            aria-label="Upload cover image or video"
          >
            {coverPreview ? (
              <>
                {coverFile?.type?.startsWith("video/") || /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(coverPreview) ? (
                  <video
                    src={coverPreview}
                    className={styles.coverZoneImg}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : (
                  <img src={coverPreview} alt="Cover" className={styles.coverZoneImg} />
                )}
                <div className={styles.coverZoneOverlay}>
                  <span>點擊更換封面</span>
                  <button
                    type="button"
                    className={styles.coverZoneRemove}
                    onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(""); }}
                  >
                    移除
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.coverZonePlaceholder}>
                <span className={styles.coverZoneIcon}>＋</span>
                <span>新增封面圖片 / 影片</span>
              </div>
            )}
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); } e.target.value = ""; }}
          />

          <input
            type="text"
            value={form.title}
            onChange={handleTitleChange}
            className={styles.titleInput}
            placeholder="Project title"
          />
          {editorReady && editor && (
            <EditorContent editor={editor} className={styles.editorContent} />
          )}
        </div>
      </div>
    </div>
  );
}
