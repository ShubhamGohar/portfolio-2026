import { HeroData } from '@/lib/types';
import { fallbackProfileImageUrl } from '@/lib/data';
import HeroRoles from './HeroRoles';
import styles from './Hero.module.css';

interface HeroProps {
    data: HeroData;
    profileImageUrl: string;
    profileImageSrcSet?: string;
    profileImageSizes?: string;
}

export default function Hero({
    data,
    profileImageUrl,
    profileImageSrcSet,
    profileImageSizes,
}: HeroProps) {
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
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M5 20h14v-2H5v2Zm7-18-5.5 5.5 1.42 1.42L11 6.84V16h2V6.84l3.08 3.08 1.42-1.42L12 2Z" />
                                </svg>
                                Download CV
                            </a>
                        )}
                        <a href="#contact" className="btn btn--outline">
                            Let&apos;s Talk
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                            </svg>
                        </a>
                    </div>
                </div>

                <div className={styles.heroVisual}>
                    <div className={styles.profileFrame}>
                        <div className={styles.profileGlow} />
                        <div className={styles.profileImageWrapper}>
                            {/* Sanity CDN srcset — skip the /_next/image hop on LCP. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                alt={data.name}
                                width={500}
                                height={500}
                                fetchPriority="high"
                                decoding="async"
                                className={styles.profileImage}
                                srcSet={profileImageSrcSet}
                                sizes={profileImageSizes}
                                src={imageSrc}
                            />
                        </div>
                        {(data.badges || ['10 Years', '50+ Projects']).map((badge, i) => {
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
        </section>
    );
}
