'use client';

import { motion } from 'framer-motion';
import { HiArrowUp } from 'react-icons/hi';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram, FaHeart } from 'react-icons/fa';
import { ContactData } from '@/lib/types';
import styles from './Footer.module.css';

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

export default function Footer({ contactData, logoUrl }: FooterProps) {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className={styles.logoImg} />
                            ) : (
                                <span className={styles.logoIcon}>S</span>
                            )}
                            <span className={styles.logoText}>Shubham Gohar</span>
                        </div>
                        <p className={styles.footerDescription}>
                            Frontend Engineer crafting beautiful, performant web experiences.
                        </p>
                    </div>

                    <div className={styles.footerLinks}>
                        <h4 className={styles.footerHeading}>Quick Links</h4>
                        <a href="#about" onClick={(e) => { e.preventDefault(); document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' }); }}>About</a>
                        <a href="#projects" onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }); }}>Projects</a>
                        <a href="#skills" onClick={(e) => { e.preventDefault(); document.querySelector('#skills')?.scrollIntoView({ behavior: 'smooth' }); }}>Skills</a>
                        <a href="#contact" onClick={(e) => { e.preventDefault(); document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Contact</a>
                    </div>

                    <div className={styles.footerSocials}>
                        <h4 className={styles.footerHeading}>Connect</h4>
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
                    <motion.button
                        className={styles.backToTop}
                        onClick={scrollToTop}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Back to top"
                    >
                        <HiArrowUp size={18} />
                    </motion.button>
                </div>
            </div>
        </footer>
    );
}
