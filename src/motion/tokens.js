/**
 * Motion tokens for GSAP, read from the CSS custom properties in
 * public/tokens.css. CSS is the single source of truth: no duration or
 * ease value is hard-coded in JS. Every GSAP tween on the site should get
 * its timing from here, e.g.
 *
 *   const m = getMotion();
 *   gsap.to(el, { autoAlpha: 1, duration: m.duration.focus, ease: m.ease.focus });
 *
 * Two families (see docs/design-system.md):
 *   step  — blocks / rectangles moving cell by cell → ease.step
 *   focus — things coming into focus, fades, page changes → ease.focus
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { CustomEase } from "gsap/CustomEase";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase, Flip);

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;

/** "550ms" | "0.55s" → seconds (GSAP units). */
function toSeconds(value, name) {
  const v = value.trim();
  const n = parseFloat(v);
  if (Number.isNaN(n)) throw new Error(`[motion] ${name} is not a duration: "${value}"`);
  return v.endsWith("ms") ? n / 1000 : n;
}

/**
 * CSS `steps(n, end|start|jump-end|jump-start)` → easing function.
 * GSAP's built-in "steps(n)" is NOT the same as CSS steps(n, end)
 * (it has n+1 plateaus and reaches 1 at 80% for n=4), so we build the
 * exact CSS curve instead.
 */
function cssSteps(n, position) {
  const start = position === "start" || position === "jump-start";
  return (p) => {
    if (p >= 1) return 1;
    if (p <= 0) return start ? 1 / n : 0;
    return Math.min(1, (Math.floor(p * n) + (start ? 1 : 0)) / n);
  };
}

/** CSS easing string → GSAP ease (function or registered CustomEase). */
function toEase(value, name) {
  const v = value.trim();
  const steps = /^steps\(\s*(\d+)\s*(?:,\s*([\w-]+))?\s*\)$/.exec(v);
  if (steps) return cssSteps(parseInt(steps[1], 10), steps[2] || "end");
  const bezier = /^cubic-bezier\(([^)]+)\)$/.exec(v);
  if (bezier) {
    // CustomEase accepts the four cubic-bezier numbers directly.
    const nums = bezier[1].split(",").map((s) => parseFloat(s));
    return CustomEase.create(name, nums.join(","));
  }
  if (v === "linear") return "none";
  throw new Error(`[motion] ${name} is not a supported easing: "${value}"`);
}

let cache = null;

/**
 * Lazily read the tokens (the stylesheet must have loaded, so call this
 * from effects / event handlers, not at module top level).
 * @returns {{
 *   duration: { step: number, base: number, focus: number },
 *   ease: { step: Function, focus: Function|string, fall: Function|string, flip: Function|string },
 *   offset: number,
 * }}
 * `offset` = --spacing-md in px: the travel distance for reveal motion.
 */
export function getMotion() {
  if (cache) return cache;
  const css = getComputedStyle(document.documentElement);
  const read = (prop) => {
    const value = css.getPropertyValue(prop);
    if (!value.trim()) {
      throw new Error(`[motion] ${prop} is missing — is /tokens.css linked in index.html?`);
    }
    return value;
  };
  cache = {
    duration: {
      step: toSeconds(read("--duration-step"), "--duration-step"),
      base: toSeconds(read("--duration-base"), "--duration-base"),
      focus: toSeconds(read("--duration-focus"), "--duration-focus"),
    },
    ease: {
      step: toEase(read("--ease-step"), "ease-step"),
      focus: toEase(read("--ease-focus"), "ease-focus"),
      fall: toEase(read("--ease-fall"), "ease-fall"),
      flip: toEase(read("--ease-flip"), "ease-flip"),
    },
    offset: parseFloat(read("--spacing-md")),
  };
  return cache;
}

export { gsap, ScrollTrigger, ScrollSmoother, Flip };
