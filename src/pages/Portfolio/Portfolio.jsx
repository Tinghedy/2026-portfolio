import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Portfolio.module.css";

gsap.registerPlugin(ScrollTrigger);

const education = [
  {
    period: "2022 – 2026",
    institution: "University Name",
    degree: "Bachelor of Something",
    note: "Additional note or GPA if desired.",
  },
  {
    period: "2019 – 2022",
    institution: "Previous School",
    degree: "Diploma / Certificate",
    note: "",
  },
];

const experience = [
  {
    period: "2025 – Present",
    org: "Company / Studio Name",
    role: "Role Title",
    note: "One sentence describing responsibilities or achievements.",
  },
  {
    period: "2024",
    org: "Another Org",
    role: "Intern / Freelance / etc.",
    note: "Brief description of the work done here.",
  },
];

const awards = [
  { year: "2025", title: "Award Name", issuer: "Issuing Organization" },
  { year: "2024", title: "Another Award", issuer: "Issuing Organization" },
  { year: "2023", title: "Recognition Title", issuer: "Issuing Organization" },
];

function AnimatedSection({ children, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

export default function Portfolio() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>

        {/* Bio */}
        <AnimatedSection className={styles.section}>
          <h1 className={styles.name}>Your Name</h1>
          <p className={styles.bio}>
            A paragraph about who you are, your background, design philosophy, and what
            drives your work. Replace this with your actual bio when ready.
          </p>
          <p className={styles.bio}>
            Second paragraph if needed. Keep it concise — two short paragraphs is usually
            enough for a portfolio page.
          </p>
        </AnimatedSection>

        {/* Education */}
        <AnimatedSection className={styles.section}>
          <h2 className={styles.sectionTitle}>Education</h2>
          <dl className={styles.timeline}>
            {education.map((item, i) => (
              <div key={i} className={styles.timelineItem}>
                <dt className={styles.period}>{item.period}</dt>
                <dd className={styles.timelineBody}>
                  <strong className={styles.org}>{item.institution}</strong>
                  <span className={styles.role}>{item.degree}</span>
                  {item.note && <span className={styles.note}>{item.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </AnimatedSection>

        {/* Experience */}
        <AnimatedSection className={styles.section}>
          <h2 className={styles.sectionTitle}>Experience</h2>
          <dl className={styles.timeline}>
            {experience.map((item, i) => (
              <div key={i} className={styles.timelineItem}>
                <dt className={styles.period}>{item.period}</dt>
                <dd className={styles.timelineBody}>
                  <strong className={styles.org}>{item.org}</strong>
                  <span className={styles.role}>{item.role}</span>
                  {item.note && <span className={styles.note}>{item.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </AnimatedSection>

        {/* Awards */}
        <AnimatedSection className={styles.section}>
          <h2 className={styles.sectionTitle}>Awards</h2>
          <ul className={styles.awardList}>
            {awards.map((award, i) => (
              <li key={i} className={styles.awardItem}>
                <span className={styles.awardYear}>{award.year}</span>
                <span className={styles.awardTitle}>{award.title}</span>
                <span className={styles.awardIssuer}>{award.issuer}</span>
              </li>
            ))}
          </ul>
        </AnimatedSection>

        {/* PDF Download */}
        <AnimatedSection className={`${styles.section} ${styles.downloadSection}`}>
          <a href="#" className={styles.downloadBtn} aria-label="Download CV as PDF">
            Download CV (PDF)
          </a>
        </AnimatedSection>

      </div>
    </main>
  );
}
