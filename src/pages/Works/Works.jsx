import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import WorkCard from "../../components/WorkCard/WorkCard";
import Reveal from "../../motion/Reveal";
import { workCache } from "./workCache";
import styles from "./Works.module.css";

/**
 * A portfolio project as read from the Supabase `projects` table.
 *
 * @typedef {Object} Work
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} [cover_image]
 * @property {string[]} [tags]
 * @property {number} [year]
 * @property {string | null} tag  Cover-badge label; null = no badge.
 * @property {string | null} [tag_color]  Cover-badge hex color; null = default.
 * @property {string | null} [hover_text]  Cursor tooltip text; null = none.
 */

export default function Works() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (!supabaseUrl || supabaseUrl.includes("your-project-id.supabase.co")) {
      setError("Supabase URL 尚未設定為實際專案網址，因此作品資料無法載入。");
      setWorks([]);
      setLoading(false);
      return;
    }

    const loadWorks = async () => {
      const normalizeWorks = (rows, includeTag) =>
        (rows ?? []).map((work) => {
          const w = {
            ...work,
            tag: includeTag ? work.tag ?? null : null,
            tag_color: includeTag ? work.tag_color ?? null : null,
          };
          workCache.set(w.id, { ...workCache.get(w.id), ...w });
          return w;
        });

      const BASE = "id, title, description, cover_image, tags, year, tag, tag_color";
      let primaryResult = await supabase
        .from("projects")
        .select(`${BASE}, hover_text`)
        .order("order_index", { ascending: true });

      // hover_text migration not applied yet: load without it.
      if (primaryResult.error?.message?.includes("hover_text")) {
        primaryResult = await supabase
          .from("projects")
          .select(BASE)
          .order("order_index", { ascending: true });
      }

      if (!primaryResult.error) {
        setWorks(normalizeWorks(primaryResult.data, true));
        setLoading(false);
        return;
      }

      if (primaryResult.error.message?.includes("column projects.tag does not exist")) {
        const fallbackResult = await supabase
          .from("projects")
          .select("id, title, description, cover_image, tags, year")
          .order("order_index", { ascending: true });

        if (fallbackResult.error) {
          setError(fallbackResult.error.message);
          setWorks([]);
        } else {
          setWorks(normalizeWorks(fallbackResult.data, false));
        }
        setLoading(false);
        return;
      }

      setError(primaryResult.error.message);
      setWorks([]);
      setLoading(false);
    };

    loadWorks().catch((fetchError) => {
      setError(fetchError?.message || "Failed to load works.");
      setWorks([]);
      setLoading(false);
    });
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Works</h1>
        {loading ? (
          <p className={styles.empty}>Loading…</p>
        ) : error ? (
          <p className={styles.empty}>{error}</p>
        ) : works.length === 0 ? (
          <p className={styles.empty}>No works yet.</p>
        ) : (
          <div className={styles.grid}>
            {works.map((work) => (
              <Reveal key={work.id} className={styles.cell}>
                <WorkCard work={work} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
