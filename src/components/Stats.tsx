import { StatsData } from '@/lib/types';
import styles from './Stats.module.css';

interface StatsProps {
    data: StatsData;
}

export default function Stats({ data }: StatsProps) {
    return (
        <section className={styles.stats}>
            <div className="container">
                <div className={styles.statsGrid}>
                    {data.items.map((item) => (
                        <div key={item.label} className={styles.statItem}>
                            <span className={styles.statValue}>
                                {item.value}{item.suffix || ''}
                            </span>
                            <span className={styles.statLabel}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
