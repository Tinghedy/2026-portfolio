import { useEffect, useRef } from "react";
import styles from "./Lightbox.module.css";

/**
 * Full-screen view of one image at its original size (fit to viewport).
 * Native <dialog>: Esc closes, focus is trapped, and it renders in the
 * top layer (unaffected by ScrollSmoother's transform).
 *
 * @param {{ image: { src: string, alt?: string } | null, onClose: () => void }} props
 */
export default function Lightbox({ image, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (image && !d.open) d.showModal();
    if (!image && d.open) d.close();
  }, [image]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-label={image?.alt || "圖片原尺寸"}
      onClose={onClose}
      onClick={onClose}
    >
      {image && <img src={image.src} alt={image.alt ?? ""} className={styles.image} />}
      <button type="button" className={styles.close} onClick={onClose} autoFocus>
        關閉
      </button>
    </dialog>
  );
}
