'use client';

import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { NAV_LINKS } from '@/lib/nav-links';
import { shouldSkipWebGL } from '@/world/gate';
import styles from './Enter3D.module.css';

const MAP_EVENT = 'portfolio:open-2d-map';

function closeMobileNav() {
  document.querySelector<HTMLDetailsElement>('details[data-mobile-nav]')?.removeAttribute('open');
}

function goToWorld(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  closeMobileNav();
  if (shouldSkipWebGL()) {
    window.dispatchEvent(new Event(MAP_EVENT));
    return;
  }
  window.location.assign('/world');
}

export function Enter3DButton({
  variant,
  id,
}: {
  variant: 'nav' | 'menu' | 'fab';
  id?: string;
}) {
  return (
    <a
      id={id}
      href="/world"
      rel="nofollow"
      className={styles[variant]}
      aria-label="Explore portfolio in 3D"
      onClick={goToWorld}
    >
      3D
    </a>
  );
}

export default function Enter3D() {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    document.body.style.overflow = '';
    document.getElementById('site-nav')?.removeAttribute('inert');
    document.getElementById('site-main')?.removeAttribute('inert');
    restoreRef.current?.focus();
  }, []);

  const openMap = useCallback(() => {
    restoreRef.current = (document.activeElement as HTMLElement | null) ?? null;
    closeMobileNav();
    document.body.style.overflow = 'hidden';
    document.getElementById('site-nav')?.setAttribute('inert', '');
    document.getElementById('site-main')?.setAttribute('inert', '');
    setOpen(true);
  }, []);

  useEffect(() => {
    const onMap = () => openMap();
    window.addEventListener(MAP_EVENT, onMap);
    return () => window.removeEventListener(MAP_EVENT, onMap);
  }, [openMap]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <>
      <Enter3DButton variant="fab" />
      {open && (
        <div className={styles.overlay} role="presentation" onClick={close}>
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.dialogHead}>
              <div>
                <h2 id={titleId} className={styles.dialogTitle}>
                  Lightweight view
                </h2>
                <p className={styles.dialogLede}>
                  This is the 2D map of the same sections. 3D stays off on this visit.
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                className={styles.close}
                aria-label="Back to the 2D site"
                onClick={close}
              >
                ×
              </button>
            </div>
            <ul className={styles.list}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} onClick={close}>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
