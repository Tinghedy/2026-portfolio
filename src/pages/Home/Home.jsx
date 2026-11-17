import styles from "./Home.module.css";

export default function Home() {
  return (
    <main>
      {/* Hero — HELLO → HEDY 開場動畫（public/hero.html） */}
      <section className={styles.hero}>
        <iframe
          src="/hero.html"
          title="Hedy Liang — HELLO → HEDY"
          className={styles.heroFrame}
        />
      </section>

      {/* Placeholder sections */}
      <section id="intro" className={styles.placeholder} />
      <section id="featured-works" className={styles.placeholder} />
    </main>
  );
}
