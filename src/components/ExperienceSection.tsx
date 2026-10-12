import { Experience } from '@/lib/types';
import Reveal from './Reveal';
import styles from './ExperienceSection.module.css';

interface ExperienceSectionProps {
    data: Experience[];
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function ExperienceSection({ data }: ExperienceSectionProps) {
    return (
        <section id="experience" className="section">
            <div className="container">
                <Reveal className="section__header">
                    <span className="section__subtitle">Career Path</span>
                    <h2 className="section__title">Work Experience</h2>
                    <p className="section__description">
                        My professional journey and the companies I&apos;ve worked with
                    </p>
                </Reveal>

                <div className={styles.timeline}>
                    <div className={styles.timelineLine} />
                    {data.map((exp, i) => (
                        <Reveal
                            key={exp._id}
                            className={`${styles.timelineItem} ${i % 2 === 0 ? styles.left : styles.right}`}
                            delay={i * 0.08}
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
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
