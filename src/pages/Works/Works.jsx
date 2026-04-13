import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { supabase } from "../../lib/supabase";
import styles from "./Works.module.css";

gsap.registerPlugin(ScrollTrigger);

const stripHtml = (html) => (html ?? "").replace(/<[^>]+>/g, "");

function WorkCard({ work }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const tagline = stripHtml(work.description).slice(0, 100) || "—";

  return (
    <li ref={cardRef} style={{ opacity: 0 }}>
      <Link to={`/works/${work.id}`} className={styles.card}>
        <div className={styles.cover}>
          {work.cover_image ? (
            <img src={work.cover_image} alt={work.title} className={styles.coverImg} />
          ) : (
            <div className={styles.imgPlaceholder} />
          )}
        </div>
        <div className={styles.cardBody}>
          <span className={styles.year}>{work.year}</span>
          <h2 className={styles.title}>{work.title}</h2>
          <p className={styles.tagline}>{tagline}</p>
          {work.tags?.length > 0 && (
            <ul className={styles.tags}>
              {work.tags.map((tag) => (
                <li key={tag} className={styles.tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </Link>
    </li>
  );
}

export default function Works() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("projects")
      .select("id, title, description, cover_image, tags, year")
      .order("order_index", { ascending: true })
      .then(({ data }) => {
        setWorks(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <h1 className={styles.pageTitle}>Works</h1>
        {loading ? (
          <p className={styles.empty}>Loading…</p>
        ) : works.length === 0 ? (
          <p className={styles.empty}>No works yet.</p>
        ) : (
          <ul className={styles.list}>
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
