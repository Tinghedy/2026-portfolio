import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, getMotion, prefersReducedMotion } from "../../motion/tokens";
import { typeAndStack } from "./scripts";
import styles from "./HoverPlayCard.module.css";

/**
 * Plays a small HTML "script" (typing + UI blocks) on top of a cover.
 * The component only controls playback; the content comes from `script`
 * (see scripts.js). Without a script it just renders the cover.
 *
 *   <HoverPlayCard script={scriptFor(id)} active={hovered} waitForFocus>
 *     {cover layers}
 *   </HoverPlayCard>
 *
 * - active=true  → (wait --duration-focus if waitForFocus) → play
 * - active=false → pause, fade the scene out (--duration-base), seek(0)
 * - off-screen   → paused (IntersectionObserver), resumes when back
 * - mode="loop"  → repeats with a 2s hold; mode="once" → stops at "done"
 * - reduced motion → no animation: jumps straight to the finished state
 * - unmount      → gsap.context().revert() kills the timeline
 */
export default function HoverPlayCard({
  script,
  active = false,
  mode = "loop",
  waitForFocus = false,
  className = "",
  children,
  ref,
  ...rest
}) {
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const tlRef = useRef(null);
  const delayRef = useRef(null);
  const startedRef = useRef(false);
  const [inView, setInView] = useState(true);
  const loop = mode === "loop";

  const setRefs = (el) => {
    rootRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  // Build the timeline (paused) once per script.
  useLayoutEffect(() => {
    if (!script || !sceneRef.current) return;
    const ctx = gsap.context((self) => {
      const m = getMotion();
      const tl = gsap.timeline({ paused: true, repeat: loop ? -1 : 0, repeatDelay: m.duration.base });
      const build = script.build ?? typeAndStack;
      build(tl, self.selector, { query: script.query, blocks: script.blocks, loop, offset: 12 });
      tlRef.current = tl;
    }, sceneRef.current);
    return () => {
      delayRef.current?.kill();
      ctx.revert();
      tlRef.current = null;
      startedRef.current = false;
    };
  }, [script, loop]);

  // Pause while off-screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!script || !el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [script]);

  // Playback control.
  useEffect(() => {
    const tl = tlRef.current;
    const scene = sceneRef.current;
    if (!tl || !scene) return;
    const m = getMotion();
    delayRef.current?.kill();

    if (prefersReducedMotion()) {
      gsap.killTweensOf(scene);
      gsap.set(scene, { autoAlpha: 1 });
      // suppressEvents=false so the typing tween's onUpdate fills in the text
      if (active) tl.pause("done", false); else tl.pause(0);
      startedRef.current = false;
      return;
    }

    if (active && inView) {
      gsap.killTweensOf(scene);
      gsap.set(scene, { autoAlpha: 1 });
      if (!startedRef.current) {
        startedRef.current = true;
        tl.pause(0);
        delayRef.current = gsap.delayedCall(waitForFocus ? m.duration.focus : 0, () => tl.play(0));
      } else {
        tl.play(); // resuming after being off-screen
      }
    } else if (active && !inView) {
      tl.pause();
    } else {
      tl.pause();
      if (!startedRef.current) return;
      startedRef.current = false;
      gsap.to(scene, {
        autoAlpha: 0,
        duration: m.duration.base,
        ease: m.ease.focus,
        onComplete: () => {
          tl.pause(0);
          gsap.set(scene, { autoAlpha: 1 });
        },
      });
    }
  }, [active, inView, waitForFocus]);

  return (
    <div ref={setRefs} className={`${styles.root} ${className}`} {...rest}>
      {children}
      {script && (
        <div ref={sceneRef} className={styles.scene} aria-hidden="true">
          <div className={styles.panel} data-hp="panel">
            <div className={styles.input}>
              <span data-hp="text" />
              <span className={styles.caret} />
            </div>
            <div className={styles.blocks}>
              {script.blocks.map((b) => (
                <span key={b} className={styles.block} data-hp="block">{b}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
