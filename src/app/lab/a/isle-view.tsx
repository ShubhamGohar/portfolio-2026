'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { IsleHandle } from '@/lab/concept-isle';
import styles from './isle.module.css';

const STATIONS = [
  { name: 'Home', title: 'Shubham Gohar', body: 'Fullstack Engineer. Ten years building commerce on Salesforce Commerce Cloud, frontend and backend.' },
  { name: 'Work', title: 'Publicis Sapient', body: 'Senior Experience Engineer. The desk is the current role; the panel lists the CMS description.' },
  { name: 'Experience', title: '10 years', body: 'One pillar per year, rising to today. In the build, each pillar opens a role from the CMS experience list.' },
  { name: 'Skills', title: 'Frontend + backend', body: 'Teal blocks are the storefront side, indigo blocks are the server side of SFCC. Names come from the CMS skills list.' },
  { name: 'Projects', title: 'Projects', body: 'The frames stay blank in the mockup. In the build they show CMS project titles and a 256px cover, one at a time.' },
  { name: 'Contact', title: 'Say hello', body: 'Email and socials from the CMS. The contact form stays on the 2D page.' },
];

export default function IsleView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<IsleHandle | null>(null);
  const [active, setActive] = useState(0);
  const [arrived, setArrived] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    void import('@/lab/concept-isle').then(({ mountIsle }) => {
      if (cancelled) return;
      handleRef.current = mountIsle(host, () => setArrived(true));
      requestAnimationFrame(() => setReady(true));
    });
    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  const go = useCallback((index: number) => {
    setActive(index);
    setArrived(false);
    handleRef.current?.goTo(index);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(Math.min(active + 1, STATIONS.length - 1));
      if (e.key === 'ArrowLeft') go(Math.max(active - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, go]);

  const station = STATIONS[active];

  return (
    <div className={styles.root}>
      <div ref={hostRef} className={`${styles.canvas} ${ready ? styles.canvasReady : ''}`} aria-hidden="true" />

      <header className={styles.bar}>
        <span className={styles.mark}>SG</span>
        <span className={styles.barName}>Shubham Gohar</span>
        <span className={styles.barTag}>Concept A · The Isle</span>
      </header>

      <section className={`${styles.hero} ${active === 0 ? styles.heroOn : ''}`} aria-hidden={active !== 0}>
        <p className={styles.kicker}>Fullstack Engineer · SFCC</p>
        <h1 className={styles.title}>
          Ten years of <em>commerce</em>, front to back.
        </h1>
        <p className={styles.lede}>Senior Experience Engineer at Publicis Sapient. Pick a stop below and ride over.</p>
      </section>

      <aside className={`${styles.card} ${arrived && active !== 0 ? styles.cardOn : ''}`} aria-live="polite">
        <p className={styles.cardKicker}>
          {String(active).padStart(2, '0')} · {station.name}
        </p>
        <h2 className={styles.cardTitle}>{station.title}</h2>
        <p className={styles.cardBody}>{station.body}</p>
      </aside>

      <nav className={styles.chips} aria-label="Stations">
        {STATIONS.map((s, i) => (
          <button
            key={s.name}
            type="button"
            className={`${styles.chip} ${i === active ? styles.chipOn : ''}`}
            aria-current={i === active}
            onClick={() => go(i)}
          >
            <span className={styles.chipNum}>{String(i).padStart(2, '0')}</span>
            {s.name}
          </button>
        ))}
      </nav>
    </div>
  );
}
