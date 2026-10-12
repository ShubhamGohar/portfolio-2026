'use client';

import { useEffect, useState } from 'react';
import { onMotionReady } from '@/lib/motion';

interface HeroRolesProps {
    roles: string[];
    className: string;
}

/**
 * Always SSR the first role as real text. After motion is enabled, rotate
 * through the rest in place — never unmount to an empty string.
 */
export default function HeroRoles({ roles, className }: HeroRolesProps) {
    const first = roles[0] ?? '';
    const [index, setIndex] = useState(0);
    const [enabled, setEnabled] = useState(false);

    useEffect(() => onMotionReady(() => setEnabled(true)), []);

    useEffect(() => {
        if (!enabled || roles.length < 2) return;
        const id = window.setInterval(() => {
            setIndex((i) => (i + 1) % roles.length);
        }, 2400);
        return () => window.clearInterval(id);
    }, [enabled, roles.length]);

    return <span className={className}>{roles[index] || first}</span>;
}
