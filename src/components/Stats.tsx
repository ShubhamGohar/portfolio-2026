'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { StatsData } from '@/lib/types';
import styles from './Stats.module.css';

interface StatsProps {
    data: StatsData;
}

function AnimatedCounter({ value, suffix }: { value: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    const duration = 2000;
                    const startTime = Date.now();

                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(Math.floor(eased * value));

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };

                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [value]);

    return (
        <span ref={ref}>
            {count}{suffix || ''}
        </span>
    );
}

export default function Stats({ data }: StatsProps) {
    return (
        <section className={styles.stats}>
            <div className="container">
                <div className={styles.statsGrid}>
                    {data.items.map((item, i) => (
                        <motion.div
                            key={item.label}
                            className={styles.statItem}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <span className={styles.statValue}>
                                <AnimatedCounter value={item.value} suffix={item.suffix} />
                            </span>
                            <span className={styles.statLabel}>{item.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
