'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './stack.module.css';

const SECTIONS = [
  {
    kicker: 'Shubham Gohar',
    title: (
      <>
        Fullstack, <em>layer</em> by layer.
      </>
    ),
    body: 'Fullstack Engineer with 10 years on Salesforce Commerce Cloud. Scroll to take the stack apart.',
  },
  {
    kicker: '01 · Frontend',
    title: <>The storefront people touch.</>,
    body: 'The violet layer is the SFCC frontend. In the build, this section lists the frontend skills from the CMS.',
  },
  {
    kicker: '02 · Backend',
    title: <>The services behind it.</>,
    body: 'The porcelain layer is the SFCC backend. Same rule: names and descriptions come from the CMS, nothing invented here.',
  },
  {
    kicker: '03 · Experience',
    title: (
      <>
        <em>10</em> years in orbit.
      </>
    ),
    body: 'One bead per year. The coral bead is now: Senior Experience Engineer at Publicis Sapient.',
  },
  {
    kicker: '04 · Contact',
    title: <>Let’s build the next one.</>,
    body: 'Email and socials from the CMS. The contact form stays on the 2D page.',
  },
];

export default function StackView() {
  const trackRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const track = trackRef.current;
    if (!host || !track) return;
    let dispose: (() => void) | undefined;
    let cancelled = false;
    void import('@/lab/concept-stack').then(({ mountStack }) => {
      if (cancelled) return;
      dispose = mountStack(host, track).dispose;
      requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <div className={styles.root}>
      <div ref={hostRef} className={`${styles.canvas} ${ready ? styles.canvasReady : ''}`} aria-hidden="true" />
      <header className={styles.bar}>
        <span className={styles.logo}>
          SG<span className={styles.dot} />
        </span>
        <span className={styles.tag}>Concept B · The Stack</span>
      </header>
      <div ref={trackRef} className={styles.track}>
        {SECTIONS.map((section, i) => (
          <section key={i} className={styles.section}>
            <div className={styles.copy}>
              <p className={styles.kicker}>{section.kicker}</p>
              {i === 0 ? <h1 className={styles.title}>{section.title}</h1> : <h2 className={styles.title}>{section.title}</h2>}
              <p className={styles.body}>{section.body}</p>
              {i === 0 && <p className={styles.hint}>Scroll</p>}
            </div>
          </section>
        ))}
      </div>
      <div className={styles.progress} aria-hidden="true">
        {SECTIONS.map((_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  );
}
