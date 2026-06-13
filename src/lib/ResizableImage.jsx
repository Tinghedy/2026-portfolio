import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import { useCallback, useRef } from "react";

function ResizableImageView({ node, updateAttributes, selected }) {
  const containerRef = useRef(null);
  const dragRef = useRef({ x: 0, w: 0 });

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = containerRef.current;
    if (!el) return;
    dragRef.current = { x: e.clientX, w: el.offsetWidth };

    const maxWidth = el.parentElement?.offsetWidth ?? 99999;

    const onMove = (e) => {
      const dx = e.clientX - dragRef.current.x;
      const newWidth = Math.min(maxWidth, Math.max(80, dragRef.current.w + dx));
      updateAttributes({ width: Math.round(newWidth) });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [updateAttributes]);

  const width = node.attrs.width;

  return (
    <NodeViewWrapper style={{ display: "block", lineHeight: 0 }}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          display: "inline-block",
          width: width ? `${width}px` : "100%",
          maxWidth: "100%",
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

        {/* Resize handle */}
        <div
          onMouseDown={onMouseDown}
          title="Drag to resize"
          style={{
            position: "absolute", right: -6, bottom: -6,
            width: 14, height: 14,
            background: "#111", border: "2px solid #fff",
            borderRadius: 3, cursor: "se-resize",
            opacity: selected ? 1 : 0,
            transition: "opacity 0.15s",
          }}
        />
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const w = el.style.width || el.getAttribute("width");
          return w ? parseInt(w) : null;
        },
        renderHTML: (attrs) => attrs.width ? { style: `width:${attrs.width}px` } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
