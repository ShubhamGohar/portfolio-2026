'use client';

import { motion } from 'framer-motion';
import { HiCode, HiColorSwatch, HiLightningBolt, HiChatAlt2 } from 'react-icons/hi';
import { AboutData } from '@/lib/types';
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
                <motion.div
                    className="section__header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section__subtitle">About Me</span>
                    <h2 className="section__title">{data.heading}</h2>
                    <p className="section__description">{data.description}</p>
                </motion.div>

                <div className={styles.cardGrid}>
                    {(data.cards || []).map((card, i) => (
                        <motion.div
                            key={card.title}
                            className={`glass-card ${styles.card}`}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <div className={styles.cardIcon}>
                                {iconMap[card.icon] || <HiCode size={28} />}
                            </div>
                            <h3 className={styles.cardTitle}>{card.title}</h3>
                            <p className={styles.cardDescription}>{card.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
