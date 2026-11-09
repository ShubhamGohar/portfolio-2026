'use client';

import { useEffect, useRef, useState } from 'react';
import type { StudioHandle } from '@/lab/concept-studio';
import styles from './studio.module.css';

const SPOTS = [
  { name: 'Work', title: 'Senior Experience Engineer', body: 'At Publicis Sapient. The desk is the current role; the build reads its description from the CMS.' },
  { name: 'Skills', title: 'Frontend + backend', body: 'The shelf holds the SFCC frontend and backend skills from the CMS, grouped by category.' },
  { name: 'Projects', title: 'Projects', body: 'The frames stay blank here. In the build each one shows a CMS project title and a 256px cover.' },
  { name: 'Experience', title: '10 years', body: 'Ten pins on the board, one per year. The coral pin is today. Roles come from the CMS experience list.' },
  { name: 'Contact', title: 'Write to me', body: 'Email and socials from the CMS. The contact form stays on the 2D page.' },
];

export default function StudioView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<StudioHandle | null>(null);
  const spotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let raf = 0;
    void import('@/lab/concept-studio').then(({ mountStudio }) => {
      if (cancelled) return;
      const handle = mountStudio(host);
      handleRef.current = handle;
      const tick = () => {
        handle.anchors().forEach((a, i) => {
          const el = spotRefs.current[i];
          if (el) el.style.transform = `translate(${a.x}px, ${a.y}px)`;
        });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  const select = (index: number | null) => {
    setActive(index);
    handleRef.current?.focus(index);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const spot = active === null ? null : SPOTS[active];

  return (
    <div className={styles.root}>
      <div ref={hostRef} className={`${styles.canvas} ${ready ? styles.canvasReady : ''}`} aria-hidden="true" />

      <header className={styles.bar}>
        <span className={styles.brand}>
          Shubham Gohar<span className={styles.brandRole}>Fullstack Engineer</span>
        </span>
        <span className={styles.tag}>Concept C · The Studio</span>
      </header>

      <section className={`${styles.hero} ${active === null ? styles.heroOn : ''}`} aria-hidden={active !== null}>
        <h1 className={styles.title}>
          Come in,
          <br />
          <em>look around.</em>
        </h1>
        <p className={styles.lede}>Ten years building on Salesforce Commerce Cloud, frontend and backend. Every object in the room opens a part of the story.</p>
      </section>

      <div className={styles.spots} aria-label="Objects in the room">
        {SPOTS.map((s, i) => (
          <button
            key={s.name}
            ref={(el) => {
              spotRefs.current[i] = el;
            }}
            type="button"
            className={`${styles.spot} ${active === i ? styles.spotOn : ''} ${active !== null && active !== i ? styles.spotDim : ''}`}
            onClick={() => select(i)}
          >
            <span className={styles.spotDot} />
            <span className={styles.spotLabel}>{s.name}</span>
          </button>
        ))}
      </div>

      <aside className={`${styles.card} ${spot ? styles.cardOn : ''}`} aria-live="polite">
        {spot && (
          <>
            <p className={styles.cardKicker}>{spot.name}</p>
            <h2 className={styles.cardTitle}>{spot.title}</h2>
            <p className={styles.cardBody}>{spot.body}</p>
            <button type="button" className={styles.back} onClick={() => select(null)}>
              ← Back to the room
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
