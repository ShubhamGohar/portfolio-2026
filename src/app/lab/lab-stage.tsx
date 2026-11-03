'use client';

import { useEffect, useRef } from 'react';
import styles from './lab.module.css';

/**
 * The WebGL module is loaded with a dynamic import from this client island.
 * Nothing on the marketing homepage imports this file, three, or gsap.
 */
export default function LabStage() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;

    void import('@/lab/scene')
      .then(({ mountLabScene }) => {
        if (cancelled) return;
        dispose = mountLabScene(host);
      })
      .catch(() => {
        // The type column stays if the scene chunk fails to load.
      });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return <div ref={hostRef} className={styles.stage} aria-hidden="true" />;
}
