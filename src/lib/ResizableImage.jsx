import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useCallback, useRef } from "react";

/** Preset widths, as a percentage of the text column. */
const PRESETS = [25, 50, 75, 100];
const MIN_PERCENT = 10;

/**
 * Widths are stored as a CSS length — "50%" for anything set through this
 * extension, but plain numbers / "320px" still parse so older content that
 * was saved before the switch to percentages keeps its size.
 *
 * @param {string | number | null} width
 * @returns {string | null}
 */
function toCssWidth(width) {
  if (width === null || width === undefined || width === "") return null;
  if (typeof width === "number") return Number.isFinite(width) ? `${width}px` : null;
  const value = String(width).trim();
  if (!value) return null;
  return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

/** The width as a percentage, or null when it is a px value / unset. */
function toPercent(width) {
  const m = /^(\d+(?:\.\d+)?)%$/.exec(String(width ?? "").trim());
  return m ? Number(m[1]) : null;
}

const clampPercent = (n) => Math.min(100, Math.max(MIN_PERCENT, Math.round(n)));

function ResizableImageView({ node, updateAttributes, selected, extension }) {
  const containerRef = useRef(null);
  const dragRef = useRef({ x: 0, w: 0, parent: 1 });

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    // Resize relative to the text column, so the ratio survives the jump from
    // the editor's width to the published page's width.
    const parentWidth = el.parentElement?.offsetWidth || el.offsetWidth || 1;
    dragRef.current = { x: e.clientX, w: el.offsetWidth, parent: parentWidth };

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - dragRef.current.x;
      const nextWidth = dragRef.current.w + dx;
      updateAttributes({ width: `${clampPercent((nextWidth / dragRef.current.parent) * 100)}%` });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [updateAttributes]);

  const cssWidth = toCssWidth(node.attrs.width);
  const percent = toPercent(node.attrs.width);

  const sizeButton = (label, active, onClick) => (
    <button
      key={label}
      type="button"
      // Keep the node selected — a plain click would blur it and hide this bar.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{
        font: "inherit",
        fontSize: 11,
        lineHeight: 1,
        padding: "5px 8px",
        border: "none",
        borderRadius: 3,
        cursor: "pointer",
        background: active ? "#111" : "transparent",
        color: active ? "#fff" : "#333",
      }}
    >
      {label}
    </button>
  );

  return (
    <NodeViewWrapper style={{ display: "block", lineHeight: 0, textAlign: "center" }}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "inline-block",
          width: cssWidth ?? "100%",
          maxWidth: "100%",
          textAlign: "left",
        }}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt ?? ""}
          style={{ width: "100%", height: "auto", display: "block", borderRadius: 4 }}
          draggable={false}
        />

        {/* Selection outline */}
        {selected && (
          <div style={{
            position: "absolute", inset: 0,
            outline: "2px solid #111", borderRadius: 4,
            pointerEvents: "none",
          }} />
        )}

        {/* Size bar — presets plus the current value, shown while selected */}
        {selected && (
          <div
            contentEditable={false}
            style={{
              position: "absolute",
              bottom: "calc(100% + 8px)",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 2,
              padding: 3,
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: 5,
              boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
              whiteSpace: "nowrap",
              zIndex: 5,
            }}
          >
            {PRESETS.map((p) =>
              sizeButton(`${p}%`, percent === p, () => updateAttributes({ width: `${p}%` }))
            )}
            <span style={{ width: 1, height: 16, background: "#e0e0e0", margin: "0 2px" }} />
            {sizeButton("原始", node.attrs.width == null, () => updateAttributes({ width: null }))}
            {percent === null && node.attrs.width != null && (
              <span style={{ fontSize: 11, color: "#888", padding: "0 4px" }}>{cssWidth}</span>
            )}
            {extension?.options?.onCropRequest && (
              <>
                <span style={{ width: 1, height: 16, background: "#e0e0e0", margin: "0 2px" }} />
                {sizeButton("⧉ 裁切", false, () => extension.options.onCropRequest({
                  src: node.attrs.src,
                  replace: (nextSrc) => updateAttributes({ src: nextSrc }),
                }))}
              </>
            )}
          </div>
        )}

        {/* Resize handle */}
        <div
          data-resize-handle="true"
          onMouseDown={onMouseDown}
          style={{
            position: "absolute", right: -6, bottom: -6,
            width: 14, height: 14,
            background: "#111", border: "2px solid #fff",
            borderRadius: 3,
            opacity: selected ? 1 : 0,
            transition: "opacity 0.15s",
          }}
        />
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      /**
       * Called when the user hits 裁切 on a selected image. Receives
       * `{ src, replace }`; the host opens its own cropper and calls
       * `replace(newSrc)` once the cropped file is uploaded. Leave unset to
       * hide the button.
       */
      onCropRequest: null,
    };
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.style.width || el.getAttribute("width");
          return w ? w.trim() : null;
        },
        renderHTML: (attrs) => {
          const width = toCssWidth(attrs.width);
          return width ? { style: `width:${width}` } : {};
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
