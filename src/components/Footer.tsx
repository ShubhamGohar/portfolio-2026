import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaHeart } from 'react-icons/fa';
import { ContactData } from '@/lib/types';
import styles from './Footer.module.css';

const LOGO_SRC = '/logo-white.webp';

const socialIcons: Record<string, React.ReactNode> = {
    linkedin: <FaLinkedin size={18} />,
    github: <FaGithub size={18} />,
    twitter: <FaTwitter size={18} />,
    instagram: <FaInstagram size={18} />,
};

interface FooterProps {
    contactData?: ContactData;
    logoUrl?: string;
}

export default function Footer({ contactData }: FooterProps) {
    const socials = contactData?.socials || [
        { platform: 'linkedin', url: 'https://linkedin.com/in/shubhamgohar' },
        { platform: 'github', url: 'https://github.com/shubhamgohar' },
        { platform: 'twitter', url: 'https://twitter.com/shubhamgohar' },
    ];

    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerContent}>
                    <div className={styles.footerLeft}>
                        <div className={styles.footerLogo}>
                            {/* Local 128² file + lazy: do not compete with LCP on first paint. */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={LOGO_SRC}
                                alt="Shubham Gohar"
                                width={36}
                                height={36}
                                loading="lazy"
                                decoding="async"
                                className={styles.logoImg}
                            />
                        </div>
                        <p className={styles.footerDescription}>
                            Fullstack engineer building SFCC storefronts and performant web applications.
                        </p>
                    </div>

                    <div className={styles.footerLinks}>
                        <h3 className={styles.footerHeading}>Quick Links</h3>
                        <a href="#about">About</a>
                        <a href="#projects">Projects</a>
                        <a href="#skills">Skills</a>
                        <a href="#contact">Contact</a>
                    </div>

                    <div className={styles.footerSocials}>
                        <h3 className={styles.footerHeading}>Connect</h3>
                        <div className={styles.socialRow}>
                            {socials.map((social) => (
                                <a
                                    key={social.platform}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.platform}
                                >
                                    {socialIcons[social.platform] || <FaGithub size={18} />}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Shubham Gohar. Made with <FaHeart className={styles.heart} size={12} /> All rights reserved.
                    </p>
                    <a href="#home" className={styles.backToTop} aria-label="Back to top">
                        ↑
                    </a>
                </div>
            </div>
        </footer>
    );
}
