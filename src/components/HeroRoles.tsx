'use client';

import { useSyncExternalStore } from 'react';
import { TypeAnimation } from 'react-type-animation';

interface HeroRolesProps {
    roles: string[];
    className: string;
}

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** Types after hydration so SSR can show the first role immediately. */
export default function HeroRoles({ roles, className }: HeroRolesProps) {
    const hydrated = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
    const first = roles[0] ?? '';

    if (!hydrated || roles.length === 0) {
        return <span className={className}>{first}</span>;
    }

    return (
        <TypeAnimation
            sequence={roles.flatMap((role) => [role, 2000])}
            wrapper="span"
            speed={50}
            className={className}
            repeat={Infinity}
        />
    );
}
