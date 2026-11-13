import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import './HandwrittenHello.css';

/*
 * HandwrittenHello
 * A pen writes "hello" stroke by stroke, draws an underline, then reveals an intro line.
 *
 * Props
 *  - line:       text under the handwriting (string or null to hide)
 *  - delay:      seconds before the pen starts (default 0.35)
 *  - speed:      SVG units per second for the pen (default 420; higher = faster)
 *  - replayKey:  change this value to replay the animation
 *  - onComplete: called when the intro line has finished revealing
 *  - className:  extra class for the wrapper
 *
 * Color follows `currentColor` for the ink and `--hello-nib` for the pen tip,
 * so it picks up whatever text color the hero section already uses.
 */

const STROKES = [
  // h
  'M18 150 C52 142 92 98 98 60 C102 32 78 24 72 52 C66 84 64 124 64 150 C72 118 92 98 108 102 C122 106 114 138 120 148 C126 158 142 150 152 134',
  // e
  'M152 134 C168 128 188 120 184 106 C180 92 156 96 152 120 C148 146 172 156 196 144',
  // l
  'M196 144 C226 128 250 88 250 58 C250 32 228 30 226 58 C224 88 224 128 234 146 C242 158 260 150 270 140',
  // l
  'M270 140 C296 122 320 88 320 58 C320 32 298 30 296 58 C294 88 294 128 304 146 C312 158 330 150 342 138',
  // o
  'M342 138 C346 118 362 100 380 100 C400 100 404 130 390 146 C376 160 352 152 354 128 C356 110 376 102 394 106 C408 110 420 104 432 96',
];
const UNDERLINE = 'M40 172 C140 164 290 160 440 168';

export default function HandwrittenHello({
  line = "I'm Hedy. I design things that feel obvious.",
  delay = 0.35,
  speed = 420,
  replayKey,
  onComplete,
  className = '',
}) {
  const rootRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const paths = gsap.utils.toArray('.hh-stroke', root);
      const nib = root.querySelector('.hh-nib');
      const lineEl = root.querySelector('.hh-line');
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const lens = paths.map((p) => p.getTotalLength());
      // Hidden until its turn: a round linecap would otherwise show a dot at each unwritten stroke's start
      paths.forEach((p, i) =>
        gsap.set(p, { strokeDasharray: lens[i], strokeDashoffset: lens[i], autoAlpha: 0 })
      );

      if (reduce) {
        gsap.set(paths, { strokeDashoffset: 0, autoAlpha: 1 });
        gsap.set(nib, { autoAlpha: 0 });
        if (lineEl) gsap.set(lineEl, { clipPath: 'inset(0 0% 0 0)' });
        onCompleteRef.current?.();
        return;
      }

      const tl = gsap.timeline({ delay });
      tl.set(nib, { autoAlpha: 1 });

      paths.forEach((p, i) => {
        const L = lens[i];
        const isUnderline = i === paths.length - 1;
        const state = { d: 0 };
        if (isUnderline) tl.to({}, { duration: 0.26 }); // pen lifts before the underline
        tl.to(state, {
          d: L,
          duration: Math.max(0.25, L / speed),
          ease: 'sine.inOut', // slow at stroke ends, faster mid-stroke
          onStart: () => gsap.set(p, { autoAlpha: 1 }),
          onUpdate: () => {
            p.style.strokeDashoffset = L - state.d;
            const pt = p.getPointAtLength(state.d);
            nib.setAttribute('cx', pt.x);
            nib.setAttribute('cy', pt.y);
          },
        });
      });

      tl.to(nib, { autoAlpha: 0, duration: 0.2 });
      if (lineEl) {
        tl.fromTo(
          lineEl,
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1.6, ease: 'steps(36)' },
          '<'
        );
      }
      tl.eventCallback('onComplete', () => onCompleteRef.current?.());
    }, root);

    return () => ctx.revert();
  }, [replayKey, delay, speed]);

  return (
    <div ref={rootRef} className={`hh-root ${className}`}>
      <svg className="hh-svg" viewBox="0 0 470 190" role="img" aria-label="hello">
        {STROKES.map((d, i) => (
          <path key={i} className="hh-stroke" d={d} />
        ))}
        <path className="hh-stroke" d={UNDERLINE} />
        <circle className="hh-nib" r="5" cx="18" cy="150" />
      </svg>
      {line && <p className="hh-line">{line}</p>}
    </div>
  );
}
