import styles from './Navbar.module.css';

const LOGO_SRC = '/logo-white.webp';

const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Experience', href: '#experience' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' },
];

export default function Navbar() {
    return (
        <nav className={styles.navbar}>
            <div className={`container ${styles.navContainer}`}>
                <a href="#home" className={styles.logo}>
                    {/* Local file — avoid next/image optimizer competing with LCP. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={LOGO_SRC}
                        alt="Shubham Gohar"
                        width={38}
                        height={38}
                        className={styles.logoImg}
                    />
                </a>

                <div className={styles.navLinks}>
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} className={styles.navLink}>
                            {link.name}
                        </a>
                    ))}
                </div>

                <details className={styles.mobileNav}>
                    <summary className={styles.mobileToggle} aria-label="Toggle navigation">
                        <svg className={styles.iconOpen} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
                        </svg>
                        <svg className={styles.iconClose} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                            <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12 5.7 16.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4Z" />
                        </svg>
                    </summary>
                    <div className={styles.mobileMenu}>
                        {navLinks.map((link) => (
                            <a key={link.name} href={link.href} className={styles.mobileLink}>
                                {link.name}
                            </a>
                        ))}
                    </div>
                </details>
            </div>
        </nav>
    );
}
