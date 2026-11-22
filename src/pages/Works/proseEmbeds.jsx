import { useLayoutEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import MetroIAMap from "../../components/MetroIAMap";
import MetroHomeModes from "../../components/MetroHomeModes";

/**
 * Interactive stand-ins for specific images in a case study's Tiptap HTML.
 * The description keeps the plain <img> (admin editor, fallback); on the
 * public page that image is swapped for the component. Match by src.
 * Components get their own React root, so they must not need app context
 * (router, auth…).
 */
const EMBEDS = [
  { src: "/images/metrosense/metrosense-03-original-ia.webp", Component: MetroIAMap },
  { src: "/images/metrosense/metrosense-04-home-dual-mode-board.webp", Component: MetroHomeModes },
];

/**
 * Swaps matching <img>s under rootRef for their components. Runs after
 * every render, so it also catches prose that mounts late or is re-set by
 * dangerouslySetInnerHTML.
 */
export function useProseEmbeds(rootRef) {
  const mounted = useRef([]); // { host, root }

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const list = mounted.current;

    // Roots whose host a fresh innerHTML has thrown away.
    for (let i = list.length - 1; i >= 0; i--) {
      if (!list[i].host.isConnected) {
        const { root } = list[i];
        list.splice(i, 1);
        queueMicrotask(() => root.unmount());
      }
    }

    EMBEDS.forEach(({ src }, index) => {
      el.querySelectorAll(`img[src="${CSS.escape(src)}"]`).forEach((img) => {
        const host = document.createElement("div");
        host.setAttribute("data-embed", String(index));
        img.replaceWith(host);
      });
    });

    // Mount every host that has no root yet (new, or after a StrictMode remount).
    el.querySelectorAll("[data-embed]").forEach((host) => {
      if (list.some((m) => m.host === host)) return;
      const embed = EMBEDS[Number(host.getAttribute("data-embed"))];
      if (!embed) return;
      const root = createRoot(host);
      root.render(<embed.Component />);
      list.push({ host, root });
    });
  });

  // Unmount on leave (deferred: React is mid-commit here).
  useLayoutEffect(() => {
    const list = mounted.current;
    return () => {
      const roots = list.splice(0).map((m) => m.root);
      queueMicrotask(() => roots.forEach((r) => r.unmount()));
    };
  }, []);
}
