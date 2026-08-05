import { useState } from "react";
import PreviewFrame from "./PreviewFrame";
import work from "../../pages/Works/WorkDetail.module.css";
import styles from "./ContentPreview.module.css";

const isVideo = (url) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url ?? "");

/** Frame widths. Mobile is an iPhone-class viewport, below the 600px breakpoint. */
const DEVICES = {
  desktop: { label: "🖥 網頁版", width: "100%" },
  mobile: { label: "📱 手機版", width: 390 },
};

/**
 * Read-only rendering of a project exactly as WorkDetail draws it — same CSS
 * module, same markup — so the editor can show what the published page will
 * look like without leaving the form.
 *
 * @param {{
 *   title?: string,
 *   year?: string | number,
 *   role?: string,
 *   team?: string,
 *   link?: string,
 *   cover?: string,
 *   html?: string,
 *   images?: string[],
 *   captions?: string[],
 * }} props
 */
export default function ContentPreview({
  title,
  year,
  role,
  team,
  link,
  cover,
  html,
  images = [],
  captions = [],
}) {
  const [device, setDevice] = useState("desktop");

  const metaItems = [
    { label: "Year", value: year },
    { label: "My role", value: role },
    { label: "Team", value: team },
    link ? { label: "Link", value: link, isLink: true } : null,
  ].filter((m) => m && m.value);

  const page = (
    <div className={styles.frame}>
      {cover && (
        <div className={work.hero}>
          {isVideo(cover) ? (
            <video src={cover} className={work.heroMedia} autoPlay muted loop playsInline />
          ) : (
            <img src={cover} alt={title || ""} className={work.heroMedia} />
          )}
        </div>
      )}

      <div className={work.inner}>
        <h1 className={work.title}>{title || "Untitled"}</h1>

        {metaItems.length > 0 && (
          <div className={work.metaBar}>
            {metaItems.map(({ label, value, isLink }) => (
              <div key={label} className={work.metaItem}>
                <span className={work.metaLabel}>{label}</span>
                {isLink ? (
                  <span className={work.metaLink}>{String(value).replace(/^https?:\/\//, "")}</span>
                ) : (
                  <span className={work.metaValue}>{value}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {html?.trim() ? (
          <div className={work.prose} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className={styles.emptyNote}>還沒有內文</p>
        )}

        {images.length > 0 && (
          <div className={work.gallery}>
            {images.map((url, i) => (
              <figure key={url} className={work.figure}>
                <img src={url} alt="" className={work.figureImg} />
                {captions[i] && (
                  <figcaption className={work.caption}>
                    <em>{captions[i]}</em>
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.stage}>
      <div className={styles.deviceBar}>
        {Object.entries(DEVICES).map(([key, { label }]) => (
          <button
            key={key}
            type="button"
            onClick={() => setDevice(key)}
            className={`${styles.deviceBtn}${device === key ? ` ${styles.deviceBtnActive}` : ""}`}
          >
            {label}
          </button>
        ))}
        <span className={styles.deviceHint}>
          {device === "mobile" ? "390 px" : "自適應視窗寬度"}
        </span>
      </div>

      <div className={`${styles.viewport}${device === "mobile" ? ` ${styles.viewportMobile}` : ""}`}>
        {/* Keyed so switching device remounts the frame with the new width */}
        <PreviewFrame key={device} width={DEVICES[device].width} title={`${device} preview`}>
          {page}
        </PreviewFrame>
      </div>
    </div>
  );
}
