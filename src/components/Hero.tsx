import Image from 'next/image';
import { HiDownload, HiArrowRight } from 'react-icons/hi';
import { HeroData } from '@/lib/types';
import { fallbackProfileImageUrl } from '@/lib/data';
import HeroRoles from './HeroRoles';
import styles from './Hero.module.css';

interface HeroProps {
    data: HeroData;
    profileImageUrl: string;
}

export default function Hero({ data, profileImageUrl }: HeroProps) {
    const imageSrc = profileImageUrl || fallbackProfileImageUrl;

    return (
        <section id="home" className={styles.hero}>
            <div className={styles.bgOrbs}>
                <div className={`${styles.orb} ${styles.orb1}`} />
                <div className={`${styles.orb} ${styles.orb2}`} />
                <div className={`${styles.orb} ${styles.orb3}`} />
            </div>
            <div className={styles.gridOverlay} />

            <div className={`container ${styles.heroContainer}`}>
                <div className={styles.heroContent}>
                    <span className={styles.greeting}>
                        👋 Hello, I&apos;m
                    </span>

                    <h1 className={styles.name}>
                        {data.name.split(' ').map((word, i) => (
                            <span key={i} className={i === 1 ? 'gradient-text' : ''}>
                                {word}{' '}
                            </span>
                        ))}
                    </h1>

                    <div className={styles.roleWrapper}>
                        <span className={styles.roleLabel}>I&apos;m a </span>
                        <HeroRoles roles={data.roles} className={styles.roleText} />
                    </div>

                    <p className={styles.tagline}>
                        {data.tagline}
                    </p>

                    <div className={styles.heroCta}>
                        {data.resumeURL && (
                            <a href={data.resumeURL} className="btn btn--primary" target="_blank" rel="noopener noreferrer">
                                <HiDownload size={18} />
                                Download CV
                            </a>
                        )}
                        <a href="#contact" className="btn btn--outline">
                            Let&apos;s Talk
                            <HiArrowRight size={18} />
                        </a>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.profileFrame}>
                        <div className={styles.profileGlow} />
                        <div className={styles.profileImageWrapper}>
                            <Image
                                src={imageSrc}
                                alt={data.name}
                                fill
                                fetchPriority="high"
                                loading="eager"
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
                </div>
            </div>

            <div className={styles.scrollIndicator}>
                <div className={styles.scrollMouse}>
                    <div className={styles.scrollDot} />
                </div>
                <span>Scroll Down</span>
            </div>
        </section>
    );
}
