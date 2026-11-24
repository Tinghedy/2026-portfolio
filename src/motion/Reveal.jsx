import { useLayoutEffect, useRef } from "react";
import { gsap, getMotion } from "./tokens";

/**
 * Scroll-triggered fade-in (a "focus" motion): the element rises by
 * --spacing-md and fades in once, when its top reaches 90% of the viewport.
 * With prefers-reduced-motion it renders in place with no animation.
 *
 *   <Reveal as="section" className={styles.section}>…</Reveal>
 *
 * In a list, pass `index`: items that come in together are staggered by
 * --stagger each, at most 8 steps (M1), so a long list never waits long.
 */
const MAX_STAGGER_STEPS = 8;

export default function Reveal({ as = "div", index, children, ...rest }) {
  const Tag = as;
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const m = getMotion();
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: m.offset },
        {
          autoAlpha: 1,
          y: 0,
          duration: m.duration.focus,
          ease: m.ease.focus,
          delay: index == null ? 0 : (index % MAX_STAGGER_STEPS) * m.duration.stagger,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        }
      );
    });
    return () => mm.revert();
  }, [index]);

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
