'use client';

import { useEffect, useRef, useState } from 'react';
import { onMotionReady } from '@/lib/motion';

interface StatNumberProps {
    value: number;
    suffix?: string;
}

/** SSR and first paint show the final number. Count-up only if still off-screen when motion starts. */
export default function StatNumber({ value, suffix }: StatNumberProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const [count, setCount] = useState(value);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let frame = 0;
        let observer: IntersectionObserver | undefined;
        let played = false;

        const animateFromZero = () => {
            if (played) return;
            played = true;
            setCount(0);
            const duration = 1600;
            const startTime = performance.now();
            const tick = (now: number) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setCount(Math.floor(eased * value));
                if (progress < 1) frame = requestAnimationFrame(tick);
            };
            frame = requestAnimationFrame(tick);
        };

        const stopMotion = onMotionReady(() => {
            if (played) return;
            const rect = el.getBoundingClientRect();
            const visible = rect.top < window.innerHeight && rect.bottom > 0;
            if (visible) {
                played = true;
                return;
            }

            observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        observer?.disconnect();
                        observer = undefined;
                        animateFromZero();
                    }
                },
                { threshold: 0.4 },
            );
            observer.observe(el);
        });

        return () => {
            stopMotion();
            observer?.disconnect();
            if (frame) cancelAnimationFrame(frame);
        };
    }, [value]);

    return (
        <span ref={ref}>
            {count}{suffix || ''}
        </span>
    );
}
