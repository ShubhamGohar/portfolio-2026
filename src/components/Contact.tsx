'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiMail, HiPhone, HiLocationMarker, HiPaperAirplane } from 'react-icons/hi';
import { FaLinkedin, FaGithub, FaTwitter, FaInstagram } from 'react-icons/fa';
import { ContactData } from '@/lib/types';
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
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMsg('');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'Failed to send message.');
            }

            setStatus('sent');
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setStatus('idle'), 4000);
        } catch (err) {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <section id="contact" className="section">
            <div className="container">
                <motion.div
                    className="section__header"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section__subtitle">Get In Touch</span>
                    <h2 className="section__title">Let&apos;s Work Together</h2>
                    <p className="section__description">
                        Have a project in mind? Let&apos;s discuss and bring your ideas to life.
                    </p>
                </motion.div>

                <div className={styles.contactGrid}>
                    {/* Contact Info */}
                    <motion.div
                        className={styles.contactInfo}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
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

                        {/* Socials */}
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
                    </motion.div>

                    {/* Contact Form */}
                    <motion.form
                        className={`glass-card ${styles.contactForm}`}
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className={styles.formGroup}>
                            <label htmlFor="name" className={styles.formLabel}>Name</label>
                            <input
                                id="name"
                                type="text"
                                className={styles.formInput}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.formLabel}>Email</label>
                            <input
                                id="email"
                                type="email"
                                className={styles.formInput}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="message" className={styles.formLabel}>Message</label>
                            <textarea
                                id="message"
                                className={`${styles.formInput} ${styles.formTextarea}`}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Tell me about your project..."
                                rows={5}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className={`btn btn--primary ${styles.submitBtn}`}
                            disabled={status === 'sending'}
                        >
                            {status === 'sending' ? 'Sending...' :
                                status === 'sent' ? '✓ Message Sent!' :
                                    status === 'error' ? '✗ Failed to Send' :
                                        <>
                                            <HiPaperAirplane size={18} />
                                            Send Message
                                        </>
                            }
                        </button>

                        {status === 'error' && errorMsg && (
                            <p className={styles.errorMsg}>{errorMsg}</p>
                        )}
                        {status === 'sent' && (
                            <p className={styles.successMsg}>Thank you! I&apos;ll get back to you soon.</p>
                        )}
                    </motion.form>
                </div>
            </div>
        </section>
    );
}
