import { FaQuoteLeft } from 'react-icons/fa';
import { Testimonial } from '@/lib/types';
import Reveal from './Reveal';
import styles from './Testimonials.module.css';

interface TestimonialsProps {
    data: Testimonial[];
}

export default function Testimonials({ data }: TestimonialsProps) {
    if (data.length === 0) return null;

    return (
        <section id="testimonials" className="section">
            <div className="container">
                <Reveal className="section__header">
                    <span className="section__subtitle">Testimonials</span>
                    <h2 className="section__title">What People Say</h2>
                    <p className="section__description">
                        Feedback from clients and colleagues I&apos;ve worked with
                    </p>
                </Reveal>

                <div className={styles.list}>
                    {data.map((item, i) => (
                        <Reveal key={item._id} className={`glass-card ${styles.testimonialCard}`} delay={i * 0.08}>
                            <FaQuoteLeft className={styles.quoteIcon} size={32} />
                            <p className={styles.quote}>{item.quote}</p>
                            <div className={styles.author}>
                                <div className={styles.authorAvatar}>
                                    <span>{item.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <h4 className={styles.authorName}>{item.name}</h4>
                                    <p className={styles.authorRole}>
                                        {item.role} at {item.company}
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
