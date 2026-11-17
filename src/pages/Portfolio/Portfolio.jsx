import Reveal from "../../motion/Reveal";
import styles from "./Portfolio.module.css";

const education = [
  {
    period: "2024 – 2026",
    institution: "National Cheng Kung University",
    degree: "M.S. Industrial Design",
    note: "Thesis: Participatory Design for Older Adults' Digital Learning",
  },
  {
    period: "2016 – 2020",
    institution: "National Sun Yat-sen University",
    degree: "B.A. Chinese Literature",
    note: "",
  },
];

const experience = [
  {
    period: "2024 – Present",
    org: "NSTC Research Project — TaigíEDU",
    role: "UI/UX Designer & Research Assistant",
    note: "Ran 10 participatory workshops with teachers nationwide, designed a 10-module Taiwanese-language teaching platform, and built its React front end and admin back office.",
  },
  {
    period: "2026",
    org: "Uanuan Steel",
    role: "Brand & Web Designer (Contract)",
    note: "Brought scroll-driven motion to the brand site with GSAP and Shopify Liquid, and built an AI-assisted product photography workflow for two launch campaigns.",
  },
  {
    period: "2025 – 2026",
    org: "Initsoc",
    role: "UI/UX Designer (Contract)",
    note: "Designed a WeChat Mini Program for a U.S. financial data brand — from wireframes to high-fidelity screens, plus its design system.",
  },
  {
    period: "2024",
    org: "Dosth Group",
    role: "Visual Designer (Contract)",
    note: "Built founding brand identities for 10 early-stage startups, with visual systems that kept deliverables consistent.",
  },
  {
    period: "2023",
    org: "couchspace",
    role: "UI/UX Designer (Contract)",
    note: "Restructured the information architecture of Taiwan's first meditation-and-counseling app, and replaced password logins with social sign-in.",
  },
  {
    period: "2023",
    org: "CyberLink",
    role: "Content Designer (Contract)",
    note: "Designed 275 in-app banner templates for Promeo, tailored to the Japanese, European, and North American markets.",
  },
];

const awards = [
  {
    year: "2025",
    title: "Innovation Gold Award (1st Place)",
    issuer: "E Ink Innovation Design Workshop",
  },
  {
    year: "2025",
    title: "1st Place · Acer Maker Award",
    issuer: "Taipei Metro Hackathon",
  },
  {
    year: "2021",
    title: "3rd Place",
    issuer: "Kaohsiung Classic Upgrade Proposal Competition",
  },
];

export default function Portfolio() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>

        {/* Bio */}
        <Reveal as="section" className={styles.section}>
          <h1 className={styles.name}>Yating Liang</h1>
          <p className={styles.bio}>
            I'm a UI/UX designer finishing a master's in Industrial Design at National Cheng
            Kung University, where my thesis studies how participatory design can make digital
            learning work for older adults. I like the parts of design where research turns into
            something people can actually use — workshops into requirements, requirements into
            interfaces, interfaces into working code.
          </p>
          <p className={styles.bio}>
            That last step is why I build as well as design: React, GSAP, and design systems are
            part of how I think, not a separate skill set. My work spans a Taiwanese-language
            teaching platform, a meditation app, a financial Mini Program, and an award-winning
            transit concept for the Taipei Metro.
          </p>
        </Reveal>

        {/* Education */}
        <Reveal as="section" className={styles.section}>
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
        </Reveal>

        {/* Experience */}
        <Reveal as="section" className={styles.section}>
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
        </Reveal>

        {/* Awards */}
        <Reveal as="section" className={styles.section}>
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
        </Reveal>

        {/* PDF Download */}
        <Reveal as="section" className={`${styles.section} ${styles.downloadSection}`}>
          <a href="#" className={styles.downloadBtn} aria-label="Download CV as PDF">
            Download CV (PDF)
          </a>
        </Reveal>

      </div>
    </main>
  );
}