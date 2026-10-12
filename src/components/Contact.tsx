import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';
import { ContactData } from '@/lib/types';
import ContactForm from './ContactForm';
import Reveal from './Reveal';
import styles from './Contact.module.css';

const socialIcons: Record<string, React.ReactNode> = {
    linkedin: <FaLinkedin size={20} />,
    github: <FaGithub size={20} />,
    twitter: <FaTwitter size={20} />,
    instagram: <FaInstagram size={20} />,
};

interface ContactProps {
    data: ContactData;
}

export default function Contact({ data }: ContactProps) {
    return (
        <section id="contact" className="section">
            <div className="container">
                <Reveal className="section__header">
                    <span className="section__subtitle">Get In Touch</span>
                    <h2 className="section__title">Let&apos;s Work Together</h2>
                    <p className="section__description">
                        Have a project in mind? Let&apos;s discuss and bring your ideas to life.
                    </p>
                </Reveal>

                <div className={styles.contactGrid}>
                    <div className={styles.contactInfo}>
                        <div className={`glass-card ${styles.infoCard}`}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <HiMail size={22} />
                                </div>
                                <div>
                                    <span className={styles.infoLabel}>Email</span>
                                    <a href={`mailto:${data.email}`} className={styles.infoValue}>{data.email}</a>
                                </div>
                            </div>

                            <div className={styles.infoItem}>
                                <div className={styles.infoIcon}>
                                    <HiPhone size={22} />
                                </div>
                                <div>
                                    <span className={styles.infoLabel}>Phone</span>
                                    <a href={`tel:${data.phone.replace(/\s/g, '')}`} className={styles.infoValue}>{data.phone}</a>
                                </div>
                            </div>

                            {data.address && (
                                <div className={styles.infoItem}>
                                    <div className={styles.infoIcon}>
                                        <HiLocationMarker size={22} />
                                    </div>
                                    <div>
                                        <span className={styles.infoLabel}>Location</span>
                                        <span className={styles.infoValue}>{data.address}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.socials}>
                            {data.socials.map((social) => (
                                <a
                                    key={social.platform}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialLink}
                                    aria-label={social.platform}
                                >
                                    {socialIcons[social.platform] || <FaGithub size={20} />}
                                </a>
                            ))}
                        </div>
                    </div>

                    <ContactForm />
                </div>
            </div>
        </section>
    );
}
