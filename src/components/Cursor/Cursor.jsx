import { useEffect } from "react";
import gsap from "gsap";

export default function Cursor() {
  useEffect(() => {
    // Only run on devices with a precise pointer (mouse)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const cursor = document.querySelector(".cursor");
    if (!cursor) return;

    // GSAP-driven position tracking with lag
    const onMouseMove = (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    // Event delegation — covers elements rendered by any route
    const isTarget = (el) => el.closest("a, button, [class*='card']");

    const onMouseOver = (e) => {
      if (isTarget(e.target)) cursor.classList.add("is-hover");
    };
    const onMouseOut = (e) => {
      if (isTarget(e.target)) cursor.classList.remove("is-hover");
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
    };
  }, []);

  // This component renders nothing — it only wires up JS behaviour
  return null;
}
