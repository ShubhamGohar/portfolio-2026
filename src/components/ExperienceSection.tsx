'use client';

import { motion } from 'framer-motion';
import { Experience } from '@/lib/types';
import styles from './ExperienceSection.module.css';

interface ExperienceSectionProps {
    data: Experience[];
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ExperienceSection({ data }: ExperienceSectionProps) {
    return (
        <section id="experience" className="section">
            <div className="container">
                <motion.div
                    className="section__header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section__subtitle">Career Path</span>
                    <h2 className="section__title">Work Experience</h2>
                    <p className="section__description">
                        My professional journey and the companies I&apos;ve worked with
                    </p>
                </motion.div>

                <div className={styles.timeline}>
                    <div className={styles.timelineLine} />
                    {data.map((exp, i) => (
                        <motion.div
                            key={exp._id}
                            className={`${styles.timelineItem} ${i % 2 === 0 ? styles.left : styles.right}`}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        >
                            <div className={`glass-card ${styles.timelineCard}`}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.companyLogo}>
                                        <span>{exp.company.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 className={styles.role}>{exp.role}</h3>
                                        <p className={styles.company}>{exp.company}</p>
                                    </div>
                                </div>
                                <span className={styles.date}>
                                    {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                </span>
                                <p className={styles.description}>{exp.description}</p>
                            </div>
                            <div className={styles.timelineDot} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
