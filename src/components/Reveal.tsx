'use client';

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { onMotionReady } from '@/lib/motion';

type Phase = 'shown' | 'pending' | 'enter';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    as?: ElementType;
}

function isNearView(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    return rect.top < vh * 1.2 && rect.bottom > -80;
}

/**
 * SSR and first paint stay fully visible. Off-screen nodes fade in once.
 * After that the node is locked visible — scroll/IO/keyframes cannot hide it again.
 */
export default function Reveal({
    children,
    className,
    delay = 0,
    as: Tag = 'div',
}: RevealProps) {
    const ref = useRef<HTMLElement>(null);
    const locked = useRef(false);
    const [phase, setPhase] = useState<Phase>('shown');
    const [played, setPlayed] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const lockShown = () => {
            locked.current = true;
            setPlayed(true);
            setPhase('shown');
        };

        if (locked.current) {
            lockShown();
            return;
        }

        let observer: IntersectionObserver | undefined;
        let finishTimer = 0;

        const stopMotion = onMotionReady(() => {
            if (locked.current) return;

            if (isNearView(el)) {
                lockShown();
                return;
            }

            setPhase('pending');
            observer = new IntersectionObserver(
                ([entry]) => {
                    if (!entry.isIntersecting || locked.current) return;
                    observer?.disconnect();
                    observer = undefined;
                    setPhase('enter');
                    finishTimer = window.setTimeout(
                        lockShown,
                        Math.round(delay * 1000) + 650,
                    );
                },
                { threshold: 0, rootMargin: '80px 0px 80px 0px' },
            );
            observer.observe(el);
        });

        const onEnd = (event: TransitionEvent) => {
            if (event.target !== el) return;
            if (event.propertyName !== 'opacity') return;
            lockShown();
        };
        el.addEventListener('transitionend', onEnd);

        return () => {
            stopMotion();
            observer?.disconnect();
            window.clearTimeout(finishTimer);
            el.removeEventListener('transitionend', onEnd);
        };
    }, [delay]);

    const style: CSSProperties | undefined =
        delay && phase === 'enter' ? { transitionDelay: `${delay}s` } : undefined;

    return (
        <Tag
            ref={ref}
            className={['reveal', className].filter(Boolean).join(' ')}
            data-reveal={phase === 'shown' ? undefined : phase}
            data-reveal-played={played ? 'true' : undefined}
            style={style}
        >
            {children}
        </Tag>
    );
}
