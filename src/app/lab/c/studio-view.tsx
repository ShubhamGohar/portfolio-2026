'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { StudioHandle } from '@/lab/studio/scene';
import styles from './studio.module.css';

const SPOTS = [
  {
    name: 'Work',
    hint: 'Publicis Sapient',
    title: 'Senior Experience Engineer',
    facts: ['Publicis Sapient', 'Current role'],
    body: 'The desk is the current role. In the build this card reads the role description from the CMS experience entry with no end date.',
  },
  {
    name: 'Skills',
    hint: 'SFCC, front to back',
    title: 'Frontend and backend on SFCC',
    facts: ['Salesforce Commerce Cloud', 'Frontend', 'Backend'],
    body: 'Each book on the shelf is a skill group. Names, categories and proficiency come from the CMS skills list, grouped the same way as the 2D page.',
  },
  {
    name: 'Projects',
    hint: 'From the CMS',
    title: 'Selected projects',
    facts: ['Up to six', 'Lazy covers'],
    body: 'The prints stand in for project covers. In the build each frame shows a CMS project title and a 256 px cover, loaded only when this card is open.',
  },
  {
    name: 'Experience',
    hint: '10 years',
    title: 'Ten years, one pin each',
    facts: ['Fullstack Engineer', '10 years'],
    body: 'The thread rises through ten pins to today’s rust pin. Companies, roles and dates come from the CMS experience list, newest first.',
  },
  {
    name: 'Contact',
    hint: 'Email & socials',
    title: 'Let’s talk',
    facts: ['Email', 'Socials'],
    body: 'Email and social links come from the CMS. The contact form stays on the 2D page, so there is only ever one form.',
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

function readParam(name: string) {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(name);
}

export default function StudioView() {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<StudioHandle | null>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [lit, setLit] = useState(false);
  const [full, setFull] = useState(false);
  const [chrome, setChrome] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.studioHydrated = '1';
    const hold = readParam('hold');
    const hideChrome = readParam('chrome') === '0';
    setChrome(!hideChrome);
    if (hold === 'opening') return;

    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let raf = 0;
    void import(/* webpackChunkName: "studio-scene" */ '@/lab/studio/scene')
      .then(({ mountStudio }) => {
        if (cancelled || !host) return;
        const handle = mountStudio(host, {
          onFirstFrame: () => {
            if (!cancelled) setLit(true);
          },
          onFullQuality: () => {
            if (!cancelled) setFull(true);
          },
          onHover: (index) => {
            if (!cancelled) setHover(index);
          },
        });
        handleRef.current = handle;
        const tick = () => {
          handle.anchors().forEach((a, i) => {
            const el = markerRefs.current[i];
            if (el) el.style.transform = `translate3d(${a.x.toFixed(1)}px, ${a.y.toFixed(1)}px, 0)`;
          });
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);

        if (readParam('demo') === '1') {
          const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
          void (async () => {
            await wait(900);
            if (cancelled) return;
            await handle.upgrade();
            await wait(500);
            if (cancelled) return;
            handle.beginIntro();
            await wait(3200);
            if (cancelled) return;
            handle.highlight(0);
            setHover(0);
            await wait(900);
            if (cancelled) return;
            setActive(0);
            handle.focus(0);
          })();
        }
      })
      .catch((err) => {
        console.error('studio scene failed to load', err);
      });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, []);

  const select = useCallback((index: number | null) => {
    setActive(index);
    handleRef.current?.focus(index);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(null);
      if (e.key === 'ArrowRight') select(active === null ? 0 : (active + 1) % SPOTS.length);
      if (e.key === 'ArrowLeft') select(active === null ? SPOTS.length - 1 : (active + SPOTS.length - 1) % SPOTS.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, select]);

  const spot = active === null ? null : SPOTS[active];

  return (
    <div
      className={`${styles.root} ${lit ? styles.lit : ''} ${full ? styles.full : ''} ${spot ? styles.focused : ''}`}
      data-stage={full ? 'full' : lit ? 'light' : 'poster'}
    >
      <picture className={`${styles.poster} ${lit ? styles.posterGone : ''}`}>
        <source srcSet="/lab/c/poster.avif" type="image/avif" />
        <img
          src="/lab/c/poster.webp"
          alt=""
          width={1440}
          height={900}
          fetchPriority="high"
          decoding="async"
          draggable={false}
        />
      </picture>
      <div ref={hostRef} className={`${styles.canvas} ${lit ? styles.canvasOn : ''}`} aria-hidden="true" />

      {chrome && (
        <header className={styles.bar}>
          <a className={styles.brand} href="https://www.shubhamgohar.com/">
            <span className={styles.mono}>SG</span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>Shubham Gohar</span>
              <span className={styles.brandRole}>Fullstack Engineer</span>
            </span>
          </a>
          <div className={styles.barRight}>
            <span className={styles.tag}>Lab · Concept C</span>
            <a className={styles.barLink} href="https://www.shubhamgohar.com/">
              2D site <span aria-hidden="true">↗</span>
            </a>
          </div>
        </header>
      )}

      {chrome && (
        <section className={`${styles.intro} ${spot ? styles.hidden : ''}`} aria-hidden={!!spot}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Senior Experience Engineer · Publicis Sapient
          </p>
          <h1 className={styles.title}>
            Ten years of commerce, <em>built front to back.</em>
          </h1>
          <p className={styles.lede}>Fullstack engineer on Salesforce Commerce Cloud. Step into the studio — every object opens a chapter.</p>
          <ol className={styles.index}>
            {SPOTS.map((s, i) => (
              <li key={s.name}>
                <button
                  type="button"
                  className={`${styles.indexRow} ${hover === i ? styles.indexHot : ''}`}
                  onClick={() => select(i)}
                  onPointerEnter={() => handleRef.current?.highlight(i)}
                  onPointerLeave={() => handleRef.current?.highlight(null)}
                  tabIndex={spot ? -1 : 0}
                >
                  <span className={styles.indexNum}>{pad(i + 1)}</span>
                  <span className={styles.indexName}>{s.name}</span>
                  <span className={styles.indexHint}>{s.hint}</span>
                  <span className={styles.indexArrow} aria-hidden="true">
                    →
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className={styles.keys}>
            <kbd>←</kbd>
            <kbd>→</kbd> to browse · <kbd>Esc</kbd> to step back
          </p>
        </section>
      )}

      {chrome && (
        <div className={styles.markers}>
          {SPOTS.map((s, i) => (
            <button
              key={s.name}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              type="button"
              aria-label={`Open ${s.name}`}
              className={`${styles.marker} ${active === i ? styles.markerOn : ''} ${hover === i && active !== i ? styles.markerHot : ''} ${active !== null && active !== i ? styles.markerDim : ''}`}
              onClick={() => select(i)}
              onPointerEnter={() => handleRef.current?.highlight(i)}
              onPointerLeave={() => handleRef.current?.highlight(null)}
            >
              <span className={styles.markerRing}>
                <span className={styles.markerNum}>{i + 1}</span>
              </span>
              <span className={styles.markerLabel}>{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {chrome && (
        <aside className={`${styles.card} ${spot ? styles.cardOn : ''}`} aria-live="polite" aria-hidden={!spot}>
          {spot && active !== null && (
            <div key={active} className={styles.cardInner}>
              <div className={styles.cardHead}>
                <span className={styles.cardCount}>
                  {pad(active + 1)} <span>/ {pad(SPOTS.length)}</span>
                </span>
                <span className={styles.cardSection}>{spot.name}</span>
              </div>
              <h2 className={styles.cardTitle}>{spot.title}</h2>
              <ul className={styles.facts}>
                {spot.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <p className={styles.cardBody}>{spot.body}</p>
              <div className={styles.cardFoot}>
                <button type="button" className={styles.ghost} onClick={() => select(null)}>
                  ← Studio
                </button>
                <div className={styles.pager}>
                  <button type="button" className={styles.round} aria-label="Previous" onClick={() => select((active + SPOTS.length - 1) % SPOTS.length)}>
                    ‹
                  </button>
                  <button type="button" className={styles.next} onClick={() => select((active + 1) % SPOTS.length)}>
                    {SPOTS[(active + 1) % SPOTS.length].name} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
      )}

      {chrome && (
        <nav className={`${styles.dock} ${spot ? styles.hidden : ''}`} aria-label="Chapters">
          {SPOTS.map((s, i) => (
            <button
              key={s.name}
              type="button"
              className={`${styles.dockItem} ${hover === i ? styles.dockHot : ''}`}
              onClick={() => select(i)}
              onPointerEnter={() => handleRef.current?.highlight(i)}
              onPointerLeave={() => handleRef.current?.highlight(null)}
              tabIndex={spot ? -1 : 0}
            >
              <span>{pad(i + 1)}</span>
              {s.name}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
