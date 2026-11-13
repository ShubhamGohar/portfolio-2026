'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ContactForm from '@/components/ContactForm';
import { shouldSkipWebGL } from '@/world/gate';
import type { Station, StationItem, StudioIntro } from '@/world/stations';
import styles from './world.module.css';

type StudioHandle = {
  focus: (index: number | null) => void;
  highlight: (index: number | null) => void;
  anchors: () => { x: number; y: number; visible: boolean }[];
  dispose: () => void;
};

const pad = (n: number) => String(n).padStart(2, '0');

function leaveTo2D() {
  window.location.assign('/');
}

export default function WorldView({
  intro,
  stations,
}: {
  intro: StudioIntro;
  stations: Station[];
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<StudioHandle | null>(null);
  const markerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [itemIndex, setItemIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [lit, setLit] = useState(false);
  const [full, setFull] = useState(false);
  const [ready, setReady] = useState(false);
  const [mapOnly, setMapOnly] = useState(false);

  useEffect(() => {
    if (shouldSkipWebGL()) {
      setMapOnly(true);
      setReady(true);
      return;
    }

    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let raf = 0;

    void import(
      /* webpackChunkName: "studio-scene", webpackPrefetch: false */ '@/world/studio/scene'
    )
      .then(({ mountStudio }) => {
        if (cancelled || !host) return;
        const handle = mountStudio(host, {
          onFirstFrame: () => {
            if (!cancelled) setLit(true);
          },
          onFullQuality: () => {
            if (!cancelled) setFull(true);
          },
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onHover: (index) => {
            if (cancelled) return;
            const stationIndex = stations.findIndex((station) => station.sceneIndex === index);
            setHover(stationIndex >= 0 ? stationIndex : null);
          },
        });
        handleRef.current = handle;
        const tick = () => {
          const anchors = handle.anchors();
          stations.forEach((station, i) => {
            const el = markerRefs.current[i];
            const anchor = anchors[station.sceneIndex];
            if (el && anchor) {
              el.style.transform = `translate3d(${anchor.x.toFixed(1)}px, ${anchor.y.toFixed(1)}px, 0)`;
            }
          });
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      })
      .catch((err) => {
        console.error('studio scene failed to load', err);
        if (!cancelled) {
          setMapOnly(true);
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [stations]);

  const select = useCallback((index: number | null) => {
    setActive(index);
    setItemIndex(0);
    setShowForm(false);
    const sceneIndex = index === null ? null : stations[index]?.sceneIndex ?? null;
    handleRef.current?.focus(sceneIndex);
  }, [stations]);

  const openContactForm = useCallback(() => {
    const index = stations.findIndex((station) => station.id === 'contact');
    if (index < 0) return;
    setActive(index);
    setItemIndex(0);
    setShowForm(true);
    handleRef.current?.focus(stations[index].sceneIndex);
  }, [stations]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (active !== null) select(null);
        else leaveTo2D();
        return;
      }
      const typing =
        event.target instanceof HTMLElement &&
        Boolean(event.target.closest('input, textarea, select'));
      if (typing) return;
      if (!stations.length) return;
      const current = active === null ? null : stations[active];
      const gallery = current?.variant === 'gallery' ? current.items : undefined;
      if (gallery && gallery.length > 1 && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
        event.preventDefault();
        setItemIndex((index) =>
          event.key === 'ArrowRight'
            ? (index + 1) % gallery.length
            : (index + gallery.length - 1) % gallery.length,
        );
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        select(active === null ? 0 : (active + 1) % stations.length);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        select(active === null ? stations.length - 1 : (active + stations.length - 1) % stations.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, select, stations]);

  const spot = active === null ? null : stations[active];
  const showWebGL = !mapOnly;

  return (
    <div
      className={`${styles.root} ${lit ? styles.lit : ''} ${full ? styles.full : ''} ${spot ? styles.focused : ''}`}
      data-stage={full ? 'full' : lit ? 'light' : 'poster'}
    >
      <picture className={`${styles.poster} ${lit ? styles.posterGone : ''}`}>
        <source srcSet="/world/poster.avif" type="image/avif" />
        <img
          src="/world/poster.webp"
          alt=""
          width={1440}
          height={900}
          fetchPriority="high"
          decoding="async"
          draggable={false}
        />
      </picture>
      <div
        ref={hostRef}
        className={`${styles.canvas} ${lit ? styles.canvasOn : ''}`}
        aria-hidden="true"
        hidden={!showWebGL}
      />

      <header className={styles.bar}>
        {/* Full load back to the 2D root layout so the WebGL context is torn down. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className={styles.brand} href="/">
          <span className={styles.mono}>SG</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Shubham Gohar</span>
            <span className={styles.brandRole}>{intro.role}</span>
          </span>
        </a>
        <div className={styles.barRight}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className={styles.barLink} href="/" aria-label="Back to the 2D site">
            2D site
          </a>
        </div>
      </header>

      <div
        className={`${styles.loadCue} ${ready ? styles.loadCueGone : ''}`}
        role="status"
        aria-live="polite"
        aria-hidden={ready}
      >
        <span className={styles.loadLamp} aria-hidden="true">
          <svg viewBox="0 0 40 56" width="40" height="56">
            <defs>
              <linearGradient id="studioCone" x1="20" y1="22" x2="20" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e7b394" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#c8603f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className={styles.loadCone} d="M14 24h12l10 32H4z" fill="url(#studioCone)" />
            <rect x="19" y="4" width="2" height="10" rx="1" fill="#c69c62" />
            <path d="M12 16h16l-3 10H15z" fill="#1d1e21" stroke="#c69c62" strokeWidth="1.2" />
            <ellipse className={styles.loadGlow} cx="20" cy="28" rx="7" ry="4" fill="#e7b394" />
          </svg>
        </span>
        <span className={styles.loadCopy}>
          <span className={styles.loadEyebrow}>The Studio</span>
          <span className={styles.loadLine}>
            {ready ? 'The studio is ready' : lit ? 'Settling the room…' : 'Lighting the studio…'}
          </span>
          <span className={styles.loadTrack} aria-hidden="true">
            <span
              className={styles.loadFill}
              style={{ width: ready ? '100%' : lit ? '72%' : '38%' }}
            />
          </span>
        </span>
      </div>

      <section className={`${styles.intro} ${spot ? styles.hidden : ''}`} aria-hidden={!!spot}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDot} />
          {intro.eyebrow}
        </p>
        <h1 className={styles.title}>
          {intro.title}
          {intro.titleEm ? <em> {intro.titleEm}</em> : null}
        </h1>
        <p className={styles.lede}>
          {mapOnly
            ? `${intro.lede} This is the lightweight view — 3D stays off on this visit.`
            : intro.lede}
        </p>
        <ol className={styles.index}>
          {stations.map((station, i) => (
            <li key={station.id}>
              <button
                type="button"
                className={`${styles.indexRow} ${hover === i ? styles.indexHot : ''}`}
                onClick={() => select(i)}
                onPointerEnter={() => handleRef.current?.highlight(station.sceneIndex)}
                onPointerLeave={() => handleRef.current?.highlight(null)}
                tabIndex={spot ? -1 : 0}
              >
                <span className={styles.indexNum}>{pad(i + 1)}</span>
                <span className={styles.indexName}>{station.name}</span>
                <span className={styles.indexHint}>{station.hint}</span>
                <span className={styles.indexArrow} aria-hidden="true">
                  →
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className={styles.keys}>
          <kbd>←</kbd>
          <kbd>→</kbd> to browse · <kbd>Esc</kbd> back to 2D
        </p>
      </section>

      {showWebGL && (
        <div className={styles.markers}>
          {stations.map((station, i) => (
            <button
              key={station.id}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              type="button"
              aria-label={`Open ${station.name}`}
              className={`${styles.marker} ${active === i ? styles.markerOn : ''} ${hover === i && active !== i ? styles.markerHot : ''} ${active !== null && active !== i ? styles.markerDim : ''}`}
              onClick={() => select(i)}
              onPointerEnter={() => handleRef.current?.highlight(station.sceneIndex)}
              onPointerLeave={() => handleRef.current?.highlight(null)}
            >
              <span className={styles.markerRing}>
                <span className={styles.markerNum}>{i + 1}</span>
              </span>
              <span className={styles.markerLabel}>{station.name}</span>
            </button>
          ))}
        </div>
      )}

      <aside
        className={`${styles.card} ${spot ? styles.cardOn : ''} ${spot?.variant === 'gallery' ? styles.cardGallery : ''} ${showForm ? styles.cardForm : ''}`}
        aria-live={showForm ? 'off' : 'polite'}
        aria-hidden={!spot}
      >
        {spot && active !== null && (
          <div key={spot.id} className={styles.cardInner}>
            <div className={styles.cardHead}>
              <span className={styles.cardCount}>
                {pad(active + 1)} <span>/ {pad(stations.length)}</span>
              </span>
              <span className={styles.cardSection}>{spot.name}</span>
            </div>
            {spot.variant === 'gallery' && spot.items?.length ? (
              <ProjectGallery items={spot.items} index={itemIndex} onIndex={setItemIndex} />
            ) : showForm && spot.id === 'contact' ? (
              <>
                <h2 className={styles.cardTitle}>{spot.title}</h2>
                <ContactForm variant="studio" idPrefix="studio-" />
                <button type="button" className={styles.ghost} onClick={() => setShowForm(false)}>
                  ← Details
                </button>
              </>
            ) : (
              <>
                <h2 className={styles.cardTitle}>{spot.title}</h2>
                {spot.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className={styles.portrait}
                    src={spot.imageUrl}
                    alt={spot.imageAlt || ''}
                    width={72}
                    height={72}
                  />
                ) : null}
                {spot.facts.length > 0 && (
                  <ul className={styles.facts}>
                    {spot.facts.map((fact) => (
                      <li key={fact}>{fact}</li>
                    ))}
                  </ul>
                )}
                {spot.body ? <p className={styles.cardBody}>{spot.body}</p> : null}
                {spot.items && spot.items.length > 0 && (
                  <ul className={styles.itemList}>
                    {spot.items.map((item) => (
                      <li key={`${item.heading}-${item.meta || ''}`}>
                        {item.href ? (
                          <a className={styles.itemLink} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img className={styles.itemThumb} src={item.imageUrl} alt="" width={256} height={160} />
                            ) : null}
                            <p className={styles.itemHeading}>{item.heading}</p>
                            {item.meta ? <p className={styles.itemMeta}>{item.meta}</p> : null}
                            {item.text ? <p className={styles.itemText}>{item.text}</p> : null}
                          </a>
                        ) : (
                          <>
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img className={styles.itemThumb} src={item.imageUrl} alt="" width={256} height={160} />
                            ) : null}
                            <p className={styles.itemHeading}>{item.heading}</p>
                            {item.meta ? <p className={styles.itemMeta}>{item.meta}</p> : null}
                            {item.text ? <p className={styles.itemText}>{item.text}</p> : null}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {spot.links && spot.links.length > 0 && (
                  <div className={styles.links}>
                    {spot.links.map((link) =>
                      link.action === 'contact-form' ? (
                        <button
                          key={link.label}
                          type="button"
                          onClick={openContactForm}
                        >
                          {link.label}
                        </button>
                      ) : link.href ? (
                        <a
                          key={link.href + link.label}
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                        >
                          {link.label}
                        </a>
                      ) : null,
                    )}
                  </div>
                )}
              </>
            )}
            <div className={styles.cardFoot}>
              <button type="button" className={styles.ghost} onClick={() => select(null)}>
                ← Studio
              </button>
              <div className={styles.pager}>
                <button
                  type="button"
                  className={styles.round}
                  aria-label="Previous section"
                  onClick={() => select((active + stations.length - 1) % stations.length)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={styles.next}
                  onClick={() => select((active + 1) % stations.length)}
                >
                  {stations[(active + 1) % stations.length].name} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      <nav className={`${styles.dock} ${spot ? styles.hidden : ''}`} aria-label="Sections">
        {stations.map((station, i) => (
          <button
            key={station.id}
            type="button"
            className={`${styles.dockItem} ${hover === i ? styles.dockHot : ''}`}
            onClick={() => select(i)}
            onPointerEnter={() => handleRef.current?.highlight(station.sceneIndex)}
            onPointerLeave={() => handleRef.current?.highlight(null)}
            tabIndex={spot ? -1 : 0}
          >
            <span>{pad(i + 1)}</span>
            {station.name}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ProjectGallery({
  items,
  index,
  onIndex,
}: {
  items: StationItem[];
  index: number;
  onIndex: (next: number) => void;
}) {
  const item = items[index] ?? items[0];
  const count = items.length;
  const go = (dir: number) => onIndex((index + dir + count) % count);

  return (
    <div className={styles.gallery}>
      <div className={styles.galleryStage}>
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.galleryImage}
            src={item.imageUrl}
            alt={item.heading}
            width={800}
            height={450}
          />
        ) : (
          <div className={styles.galleryFallback} aria-hidden="true" />
        )}
        {count > 1 ? (
          <>
            <button
              type="button"
              className={styles.galleryNav}
              aria-label="Previous project"
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.galleryNav} ${styles.galleryNavNext}`}
              aria-label="Next project"
              onClick={() => go(1)}
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      <p className={styles.galleryKicker}>
        {item.meta ? <span>{item.meta}</span> : <span>Featured</span>}
        <span className={styles.galleryIndex}>
          {pad(index + 1)} / {pad(count)}
        </span>
      </p>
      <h2 className={styles.galleryTitle}>{item.heading}</h2>
      {item.text ? <p className={styles.galleryBody}>{item.text}</p> : null}
      {item.tags && item.tags.length > 0 ? (
        <ul className={styles.galleryTags}>
          {item.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      ) : null}
      {item.extraLinks && item.extraLinks.length > 0 ? (
        <div className={styles.links}>
          {item.extraLinks.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
      {count > 1 ? (
        <div className={styles.galleryDots} role="tablist" aria-label="Projects">
          {items.map((project, i) => (
            <button
              key={project.heading}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={project.heading}
              className={`${styles.galleryDot} ${i === index ? styles.galleryDotOn : ''}`}
              onClick={() => onIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
