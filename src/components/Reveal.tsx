'use client';

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { onMotionReady } from '@/lib/motion';

type RevealState = 'static' | 'pending' | 'in';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    as?: ElementType;
}

/**
 * SSR and first paint stay fully visible. After motion is enabled, off-screen
 * nodes fade/slide in on intersect — never `opacity: 0` in the HTML.
 */
export default function Reveal({
    children,
    className,
    delay = 0,
    as: Tag = 'div',
}: RevealProps) {
    const ref = useRef<HTMLElement>(null);
    const [state, setState] = useState<RevealState>('static');
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let observer: IntersectionObserver | undefined;

        const stopMotion = onMotionReady(() => {
            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView) {
                setState('in');
                return;
            }

            setState('pending');
            observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setAnimate(true);
                        setState('in');
                        observer?.disconnect();
                    }
                },
                { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
            );
            observer.observe(el);
        });

        return () => {
            stopMotion();
            observer?.disconnect();
        };
    }, []);

    const style: CSSProperties | undefined = delay
        ? { animationDelay: `${delay}s` }
        : undefined;

    return (
        <Tag
            ref={ref}
            className={['reveal', className].filter(Boolean).join(' ')}
            data-reveal={state === 'static' ? undefined : state}
            data-reveal-animate={animate ? 'true' : undefined}
            style={style}
        >
            {children}
        </Tag>
    );
}
