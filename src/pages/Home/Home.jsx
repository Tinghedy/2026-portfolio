import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import styles from "./Home.module.css";

export default function Home() {
  const headingRef = useRef(null);
  const subheadingRef = useRef(null);
  const bioRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      headingRef.current,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    )
      .fromTo(
        subheadingRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      )
      .fromTo(
        bioRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 ref={headingRef} className={styles.heading} style={{ opacity: 0 }}>
            Your Name Here
          </h1>
          <h2 ref={subheadingRef} className={styles.subheading} style={{ opacity: 0 }}>
            Designer / Researcher / Something Else
          </h2>
          <p ref={bioRef} className={styles.bio} style={{ opacity: 0 }}>
            One line about who you are, what you do, and what you care about.
          </p>
          <div ref={ctaRef} style={{ opacity: 0 }}>
            <Link to="/works" className={styles.cta}>
              View Works
            </Link>
          </div>
        </div>
      </section>

      {/* Placeholder sections */}
      <section id="intro" className={styles.placeholder} />

      <section id="featured-works" className={styles.placeholder} />
    </main>
  );
}
