import Link from 'next/link';
import styles from './lab.module.css';

const concepts = [
  { href: '/lab/a', letter: 'A', name: 'The Isle', line: 'A floating island you travel across, one station per section.' },
  { href: '/lab/b', letter: 'B', name: 'The Stack', line: 'A scroll story: frontend and backend layers that come apart and settle.' },
  { href: '/lab/c', letter: 'C', name: 'The Studio', line: 'One lamp-lit desk diorama; pick an object to open its section.' },
];

export default function LabIndex() {
  return (
    <main className={styles.index}>
      <p className={styles.kicker}>Lab · prototypes, not the site</p>
      <h1 className={styles.heading}>3D concept directions</h1>
      <ul className={styles.list}>
        {concepts.map((c) => (
          <li key={c.href}>
            <Link href={c.href} prefetch={false} className={styles.card}>
              <span className={styles.letter}>{c.letter}</span>
              <span>
                <strong>{c.name}</strong>
                <span className={styles.line}>{c.line}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
