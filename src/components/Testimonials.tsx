'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { FaQuoteLeft } from 'react-icons/fa';
import { Testimonial } from '@/lib/types';
import styles from './Testimonials.module.css';

interface TestimonialsProps {
    data: Testimonial[];
}

export default function Testimonials({ data }: TestimonialsProps) {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(0);

    const next = useCallback(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % data.length);
    }, [data.length]);

    const prev = () => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + data.length) % data.length);
    };

    useEffect(() => {
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [next]);

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
    };

    if (data.length === 0) return null;

    return (
        <section id="testimonials" className="section">
            <div className="container">
                <motion.div
                    className="section__header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section__subtitle">Testimonials</span>
                    <h2 className="section__title">What People Say</h2>
                    <p className="section__description">
                        Feedback from clients and colleagues I&apos;ve worked with
                    </p>
                </motion.div>

                <div className={styles.carouselWrapper}>
                    <button className={styles.navBtn} onClick={prev} aria-label="Previous testimonial">
                        <HiChevronLeft size={24} />
                    </button>

                    <div className={styles.carousel}>
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={current}
                                className={`glass-card ${styles.testimonialCard}`}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.4, ease: 'easeInOut' }}
                            >
                                <FaQuoteLeft className={styles.quoteIcon} size={32} />
                                <p className={styles.quote}>{data[current].quote}</p>
                                <div className={styles.author}>
                                    <div className={styles.authorAvatar}>
                                        <span>{data[current].name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h4 className={styles.authorName}>{data[current].name}</h4>
                                        <p className={styles.authorRole}>
                                            {data[current].role} at {data[current].company}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <button className={styles.navBtn} onClick={next} aria-label="Next testimonial">
                        <HiChevronRight size={24} />
                    </button>
                </div>

                {/* Dots */}
                <div className={styles.dots}>
                    {data.map((_, i) => (
                        <button
                            key={i}
                            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                            aria-label={`Go to testimonial ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
