import { useEffect, useRef, useState } from "react";
import styles from "./DrawingCanvas.module.css";

const COLORS = [
  "#111111", "#6b6b6b", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#a855f7",
];

const SIZES = [
  { label: "S", pen: 2, marker: 8,  eraser: 16 },
  { label: "M", pen: 5, marker: 16, eraser: 32 },
  { label: "L", pen: 12, marker: 28, eraser: 56 },
];

export default function DrawingCanvas({ onInsert, onClose }) {
  const canvasRef = useRef(null);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#111111");
  const [sizeIdx, setSizeIdx] = useState(1);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);

  // White background on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e);
    const sz = SIZES[sizeIdx];

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = sz.eraser;
      ctx.globalAlpha = 1;
    } else if (tool === "marker") {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = sz.marker;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = sz.pen;
      ctx.globalAlpha = 1;
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
    lastPos.current = pos;
  };

  const endDraw = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleInsert = () => {
    canvasRef.current.toBlob((blob) => onInsert(blob), "image/png");
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>

          {/* Tools */}
          <div className={styles.toolGroup}>
            <button
              className={`${styles.toolBtn} ${tool === "pen" ? styles.toolActive : ""}`}
              onClick={() => setTool("pen")}
              title="Pen"
            >✏️</button>
            <button
              className={`${styles.toolBtn} ${tool === "marker" ? styles.toolActive : ""}`}
              onClick={() => setTool("marker")}
              title="Marker"
            >🖊️</button>
            <button
              className={`${styles.toolBtn} ${tool === "eraser" ? styles.toolActive : ""}`}
              onClick={() => setTool("eraser")}
              title="Eraser"
            >🧹</button>
          </div>

          <div className={styles.sep} />

          {/* Colors */}
          <div className={styles.toolGroup}>
            {COLORS.map((c) => (
              <button
                key={c}
                className={`${styles.colorBtn} ${color === c && tool !== "eraser" ? styles.colorActive : ""}`}
                style={{ background: c }}
                onClick={() => { setColor(c); if (tool === "eraser") setTool("pen"); }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => { setColor(e.target.value); if (tool === "eraser") setTool("pen"); }}
              className={styles.colorPicker}
              title="Custom colour"
            />
          </div>

          <div className={styles.sep} />

          {/* Sizes */}
          <div className={styles.toolGroup}>
            {SIZES.map((s, i) => (
              <button
                key={s.label}
                className={`${styles.sizeBtn} ${sizeIdx === i ? styles.toolActive : ""}`}
                onClick={() => setSizeIdx(i)}
                title={s.label}
              >
                <span className={styles.sizeDot} style={{ width: 4 + i * 5, height: 4 + i * 5 }} />
              </button>
            ))}
          </div>

          <div className={styles.spacer} />

          {/* Actions */}
          <button className={styles.btnClear} onClick={clearCanvas}>Clear</button>
        </div>

        {/* ── Canvas ── */}
        <canvas
          ref={canvasRef}
          width={1400}
          height={860}
          className={styles.canvas}
          style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose}>Cancel</button>
          <button className={styles.btnInsert} onClick={handleInsert}>Insert Drawing</button>
        </div>
      </div>
    </div>
  );
}
