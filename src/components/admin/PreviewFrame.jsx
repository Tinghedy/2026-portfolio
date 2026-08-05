import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children inside an iframe so the page's own media queries resolve
 * against the frame's width instead of the browser window — that is what makes
 * the mobile / desktop toggle show a real responsive layout rather than a
 * narrow column of the desktop one.
 *
 * All stylesheets from the host document are cloned into the frame, so CSS
 * modules and web fonts apply exactly as they do on the live site.
 *
 * @param {{ width: number | string, title?: string, children: React.ReactNode }} props
 */
export default function PreviewFrame({ width, title = "Preview", children }) {
  const frameRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const inject = () => {
      const doc = frame.contentDocument;
      if (!doc) return;

      doc.head.replaceChildren();
      const meta = doc.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1";
      doc.head.appendChild(meta);

      // about:blank has no base URL of its own, so relative asset paths in the
      // cloned CSS (and in the previewed markup) would not resolve.
      const base = doc.createElement("base");
      base.href = document.baseURI;
      doc.head.appendChild(base);

      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        const clone = node.cloneNode(true);
        // `node.href` is already resolved against the host document.
        if (clone.tagName === "LINK") clone.href = node.href;
        doc.head.appendChild(clone);
      });

      doc.documentElement.style.background = "#000";
      doc.body.style.margin = "0";
      doc.body.style.background = "#000";
      doc.body.style.color = "#fff";
      // The site hides the native cursor for its custom one; inside the
      // preview we want the real pointer back.
      const cursorFix = doc.createElement("style");
      cursorFix.textContent = "*{cursor:auto !important}";
      doc.head.appendChild(cursorFix);

      setMountNode(doc.body);
    };

    // about:blank frames are usually ready immediately, but Safari/Firefox can
    // still fire load afterwards — handle both.
    inject();
    frame.addEventListener("load", inject);
    return () => frame.removeEventListener("load", inject);
  }, []);

  return (
    <>
      <iframe
        ref={frameRef}
        title={title}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          maxWidth: "100%",
          height: "100%",
          border: "none",
          background: "#000",
          display: "block",
        }}
      />
      {mountNode && createPortal(children, mountNode)}
    </>
  );
}
