'use client';

import { useState } from 'react';
import styles from './Contact.module.css';

export default function ContactForm() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '', website: '' });
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
            setFormData({ name: '', email: '', message: '', website: '' });
            setTimeout(() => setStatus('idle'), 4000);
        } catch (err) {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <form className={`glass-card ${styles.contactForm}`} onSubmit={handleSubmit}>
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

            <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                    id="website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
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
        </form>
    );
}
