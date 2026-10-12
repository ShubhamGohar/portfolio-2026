import { HiCode, HiColorSwatch, HiLightningBolt, HiChatAlt2 } from 'react-icons/hi';
import { AboutData } from '@/lib/types';
import Reveal from './Reveal';
import styles from './About.module.css';

const iconMap: Record<string, React.ReactNode> = {
    code: <HiCode size={28} />,
    design: <HiColorSwatch size={28} />,
    speed: <HiLightningBolt size={28} />,
    consulting: <HiChatAlt2 size={28} />,
};

interface AboutProps {
    data: AboutData;
}

export default function About({ data }: AboutProps) {
    return (
        <section id="about" className="section">
            <div className="container">
                <Reveal className="section__header">
                    <span className="section__subtitle">About Me</span>
                    <h2 className="section__title">{data.heading}</h2>
                    <p className="section__description">{data.description}</p>
                </Reveal>

                <div className={styles.cardGrid}>
                    {(data.cards || []).map((card, i) => (
                        <Reveal key={card.title} className={`glass-card ${styles.card}`} delay={i * 0.08}>
                            <div className={styles.cardIcon}>
                                {iconMap[card.icon] || <HiCode size={28} />}
                            </div>
                            <h3 className={styles.cardTitle}>{card.title}</h3>
                            <p className={styles.cardDescription}>{card.description}</p>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
