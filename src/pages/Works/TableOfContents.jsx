import styles from "./TableOfContents.module.css";

const num = (i) => String(i + 1).padStart(2, "0");

/**
 * Table of contents list. The surrounding chrome (sticky sidebar on desktop,
 * collapsible block on narrow screens) lives in WorkDetail.
 *
 * @param {{
 *   headings: { id: string, text: string }[],
 *   activeId: string | null,
 *   onSelect: (id: string) => void,
 *   onBackToTop: () => void,
 *   showHeading?: boolean,
 * }} props
 */
export default function TableOfContents({
  headings,
  activeId,
  onSelect,
  onBackToTop,
  showHeading = true,
}) {
  if (headings.length === 0) return null;

  return (
    <nav aria-label="目錄" className={styles.toc}>
      {showHeading && <p className={styles.heading}>Table of Contents</p>}

      <ol className={styles.list}>
        {headings.map(({ id, text }, i) => {
          const isActive = id === activeId;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => { e.preventDefault(); onSelect(id); }}
                aria-current={isActive ? "location" : undefined}
                className={`${styles.item}${isActive ? ` ${styles.itemActive}` : ""}`}
              >
                <span className={styles.num}>{`${num(i)}.`}</span>
                <span className={styles.text}>{text}</span>
              </a>
            </li>
          );
        })}
      </ol>

      <button type="button" onClick={onBackToTop} className={styles.top}>
        ↑ 回到頂端
      </button>
    </nav>
  );
}
