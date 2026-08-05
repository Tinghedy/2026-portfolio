import { useCallback, useEffect, useRef, useState } from "react";
import {
  cropToPixels,
  fitRatio,
  moveCrop,
  resizeCrop,
  shadePolygon,
} from "../../lib/cropGeometry";
import styles from "./ImageCropModal.module.css";

const RATIOS = [
  { key: "free", label: "自由", value: null },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  // 3:2 matches the Works grid tile; 4:5 is the portrait cover crop.
  { key: "3:2", label: "3:2", value: 3 / 2 },
  { key: "4:5", label: "4:5", value: 4 / 5 },
  { key: "16:9", label: "16:9", value: 16 / 9 },
];

const HANDLES = ["nw", "ne", "sw", "se"];

/** File extension → output mime; PNG keeps transparency, everything else JPEG. */
function outputType(src) {
  return /\.png(\?.*)?$/i.test(src ?? "") ? "image/png" : "image/jpeg";
}

/**
 * Crops an image down to a new file. The crop is destructive by design: it
 * uploads a new image and swaps the node's src, so the published HTML stays a
 * plain <img> and the front-end needs no changes.
 *
 * @param {{
 *   src: string,
 *   onCancel: () => void,
 *   onApply: (blob: Blob, type: string) => Promise<void> | void,
 * }} props
 */
export default function ImageCropModal({ src, onCancel, onApply }) {
  const imgRef = useRef(null);
  const boxRef = useRef(null);
  const dragRef = useRef(null);

  // Crop rect in normalized image coordinates (0–1).
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [ratio, setRatio] = useState(null);
  const [natural, setNatural] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && !busy) onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel, busy]);

  /** Re-fit the crop rect to a locked aspect ratio, keeping it inside bounds. */
  const applyRatio = (r) => {
    setRatio(r);
    setCrop((c) => fitRatio(c, r, natural));
  };

  const startDrag = useCallback((mode) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, rect, crop };

    const onMove = (moveEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (moveEvent.clientX - d.startX) / d.rect.width;
      const dy = (moveEvent.clientY - d.startY) / d.rect.height;

      setCrop(d.mode === "move"
        ? moveCrop(d.crop, dx, dy)
        : resizeCrop(d.crop, d.mode, dx, dy, ratio, natural));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [crop, ratio, natural]);

  const handleApply = async () => {
    const img = imgRef.current;
    if (!img || !natural) return;
    setBusy(true);
    setError("");
    try {
      const { sx, sy, sw, sh } = cropToPixels(crop, natural);

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      const type = outputType(src);
      const blob = await new Promise((resolve, reject) => {
        // Tainted canvases (missing CORS headers on the image) throw here.
        try {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("無法產生裁切後的圖片"))),
            type,
            type === "image/jpeg" ? 0.92 : undefined,
          );
        } catch (err) {
          reject(err);
        }
      });

      await onApply(blob, type);
    } catch (err) {
      setError(err?.name === "SecurityError"
        ? "這張圖片的來源不允許跨網域讀取，無法裁切。"
        : err?.message || "裁切失敗");
      setBusy(false);
    }
  };

  const pct = (n) => `${n * 100}%`;
  const size = natural
    ? `${Math.round(crop.w * natural.width)} × ${Math.round(crop.h * natural.height)} px`
    : "";

  return (
    <div className={styles.backdrop} onMouseDown={() => !busy && onCancel()}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <span className={styles.heading}>裁切圖片</span>
          <span className={styles.size}>{size}</span>
          <button type="button" className={styles.close} onClick={onCancel} disabled={busy}>×</button>
        </header>

        <div className={styles.ratios}>
          {RATIOS.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => applyRatio(r.value)}
              className={`${styles.ratioBtn}${ratio === r.value ? ` ${styles.ratioBtnActive}` : ""}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className={styles.canvas}>
          <div ref={boxRef} className={styles.imageBox}>
            <img
              ref={imgRef}
              src={src}
              alt=""
              crossOrigin="anonymous"
              className={styles.image}
              draggable={false}
              onLoad={(e) => setNatural({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })}
              onError={() => setError("圖片載入失敗")}
            />

            {/* Dimmed area outside the crop */}
            <div className={styles.shade} style={{ clipPath: shadePolygon(crop) }} />

            <div
              className={styles.cropRect}
              style={{ left: pct(crop.x), top: pct(crop.y), width: pct(crop.w), height: pct(crop.h) }}
              onMouseDown={startDrag("move")}
            >
              {HANDLES.map((h) => (
                <span
                  key={h}
                  className={`${styles.handle} ${styles[`handle_${h}`]}`}
                  onMouseDown={startDrag(h)}
                />
              ))}
            </div>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <footer className={styles.footer}>
          <button type="button" className={styles.btnGhost} onClick={onCancel} disabled={busy}>
            取消
          </button>
          <button type="button" className={styles.btnPrimary} onClick={handleApply} disabled={busy || !natural}>
            {busy ? "處理中…" : "套用裁切"}
          </button>
        </footer>
      </div>
    </div>
  );
}
