import { StatsData } from '@/lib/types';
import Reveal from './Reveal';
import StatNumber from './StatNumber';
import styles from './Stats.module.css';

interface StatsProps {
    data: StatsData;
}

export default function Stats({ data }: StatsProps) {
    return (
        <section className={styles.stats}>
            <div className="container">
                <div className={styles.statsGrid}>
                    {data.items.map((item, i) => (
                        <Reveal key={item.label} className={styles.statItem} delay={i * 0.08}>
                            <span className={styles.statValue}>
                                <StatNumber value={item.value} suffix={item.suffix} />
                            </span>
                            <span className={styles.statLabel}>{item.label}</span>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
