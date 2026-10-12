'use client';

import { useEffect } from 'react';
import { DESKTOP_MQ, enableMotion } from '@/lib/motion';

/**
 * Turns on section/orb/title motion after first paint.
 * Desktop: right after hydrate. Phone: after `load` + idle so LCP is not competing.
 */
export default function EnableMotion() {
    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const start = () => enableMotion();

        if (window.matchMedia(DESKTOP_MQ).matches) {
            start();
            return;
        }

        const idleStart = () => {
            const ric = window.requestIdleCallback;
            if (typeof ric === 'function') {
                ric(start, { timeout: 2500 });
            } else {
                window.setTimeout(start, 300);
            }
        };

        if (document.readyState === 'complete') {
            idleStart();
            return;
        }

        window.addEventListener('load', idleStart, { once: true });
        return () => window.removeEventListener('load', idleStart);
    }, []);

    return null;
}
