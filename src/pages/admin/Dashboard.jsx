import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "../../lib/supabase";
import { deleteImageByUrl } from "../../lib/uploadImage";
import styles from "./Dashboard.module.css";

// ── Sortable card ────────────────────────────────────────────────────────────

function SortableCard({ project, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.card}>
      <button
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        title="Drag to reorder"
      >
        ⠿
      </button>

      {project.cover_image ? (
        <img src={project.cover_image} alt={project.title} className={styles.cover} />
      ) : (
        <div className={styles.coverPlaceholder} />
      )}

      <div className={styles.cardBody}>
        <span className={styles.year}>{project.year}</span>
        <h2 className={styles.cardTitle}>{project.title}</h2>
        {project.tags?.length > 0 && (
          <ul className={styles.tags}>
            {project.tags.map((t) => (
              <li key={t} className={styles.tag}>{t}</li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.cardActions}>
        <button onClick={() => onEdit(project.id)} className={styles.btnEdit}>
          Edit
        </button>
        <button onClick={() => onDelete(project)} className={styles.btnDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ project, onConfirm, onCancel }) {
  return (
    <div className={styles.dialogOverlay} onClick={onCancel}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <p className={styles.dialogText}>
          Delete <strong>{project.title}</strong>?<br />
          <span className={styles.dialogSub}>This will also remove all uploaded images.</span>
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

// ── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, year, tags, cover_image, order_index")
      .order("order_index", { ascending: true });

    if (!error) setProjects(data ?? []);
    setLoading(false);
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);

    setProjects(reordered); // optimistic

    await Promise.all(
      reordered.map((project, index) =>
        supabase.from("projects").update({ order_index: index }).eq("id", project.id)
      )
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { cover_image, images = [], id } = deleteTarget;

    // Delete storage files
    const urls = [cover_image, ...images].filter(Boolean);
    await Promise.all(urls.map(deleteImageByUrl));

    // Delete DB record
    await supabase.from("projects").delete().eq("id", id);

    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeleteTarget(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Works</h1>
        <div className={styles.headerActions}>
          <button onClick={() => navigate("/admin/blog")} className={styles.btnBlog}>
            Blog
          </button>
          <button onClick={() => navigate("/admin/new")} className={styles.btnNew}>
            + New
          </button>
          <button onClick={handleSignOut} className={styles.btnSignOut}>
            Sign out
          </button>
        </div>
      </header>

      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : projects.length === 0 ? (
        <p className={styles.empty}>No projects yet. Add one!</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className={styles.grid}>
              {projects.map((project) => (
                <SortableCard
                  key={project.id}
                  project={project}
                  onEdit={(id) => navigate(`/admin/edit/${id}`)}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {deleteTarget && (
        <ConfirmDialog
          project={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
}
