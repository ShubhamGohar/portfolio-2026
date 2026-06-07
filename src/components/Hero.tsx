'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { HiDownload, HiArrowRight } from 'react-icons/hi';
import { HeroData } from '@/lib/types';
import { optimizedImageUrl } from '@/lib/sanity';
import { fallbackProfileImageUrl } from '@/lib/data';
import styles from './Hero.module.css';

interface HeroProps {
    data: HeroData;
}

export default function Hero({ data }: HeroProps) {
    const roleSequence = data.roles.flatMap((role) => [role, 2000]);

    return (
        <section id="home" className={styles.hero}>
            {/* Animated background */}
            <div className={styles.bgOrbs}>
                <div className={`${styles.orb} ${styles.orb1}`} />
                <div className={`${styles.orb} ${styles.orb2}`} />
                <div className={`${styles.orb} ${styles.orb3}`} />
            </div>
            <div className={styles.gridOverlay} />

            <div className={`container ${styles.heroContainer}`}>
                <motion.div
                    className={styles.heroContent}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <motion.span
                        className={styles.greeting}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        👋 Hello, I&apos;m
                    </motion.span>

                    <motion.h1
                        className={styles.name}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                    >
                        {data.name.split(' ').map((word, i) => (
                            <span key={i} className={i === 1 ? 'gradient-text' : ''}>
                                {word}{' '}
                            </span>
                        ))}
                    </motion.h1>

                    <motion.div
                        className={styles.roleWrapper}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <span className={styles.roleLabel}>I&apos;m a </span>
                        <TypeAnimation
                            sequence={roleSequence}
                            wrapper="span"
                            speed={50}
                            className={styles.roleText}
                            repeat={Infinity}
                        />
                    </motion.div>

                    <motion.p
                        className={styles.tagline}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        {data.tagline}
                    </motion.p>

                    <motion.div
                        className={styles.heroCta}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        {data.resumeURL && (
                            <a href={data.resumeURL} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                                <HiDownload size={18} />
                                Download CV
                            </a>
                        )}
                        <a href="#contact" className="btn btn--outline" onClick={(e) => {
                            e.preventDefault();
                            document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            Let&apos;s Talk
                            <HiArrowRight size={18} />
                        </a>
                    </motion.div>
                </motion.div>

                <motion.div
                    className={styles.heroVisual}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    <div className={styles.profileFrame}>
                        <div className={styles.profileGlow} />
                        <div className={styles.profileImageWrapper}>
                            <Image
                                src={
                                    data.profileImage?.asset
                                        ? optimizedImageUrl(data.profileImage, 500, 500)
                                        : fallbackProfileImageUrl
                                }
                                alt={data.name}
                                fill
                                priority
                                fetchPriority="high"
                                sizes="(max-width: 768px) 280px, 500px"
                                className={styles.profileImage}
                            />
                        </div>
                        {(data.badges || ['7+ Years', '50+ Projects']).map((badge, i) => {
                            const positions = [
                                { top: '10%', right: '-10%' },
                                { bottom: '15%', left: '-10%' },
                                { top: '55%', right: '-12%' },
                            ];
                            return (
                                <div key={i} className={styles.floatingBadge} style={positions[i] || positions[0]}>
                                    <span>{badge}</span>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className={styles.scrollIndicator}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                <div className={styles.scrollMouse}>
                    <div className={styles.scrollDot} />
                </div>
                <span>Scroll Down</span>
            </motion.div>
        </section>
    );
}
