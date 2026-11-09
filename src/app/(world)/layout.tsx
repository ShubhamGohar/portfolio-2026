import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter_Tight } from 'next/font/google';
import './world.css';

const body = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--world-body',
  display: 'swap',
});

const serif = Fraunces({
  subsets: ['latin'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--world-serif',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#171514',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: 'The Studio — Shubham Gohar',
  description: 'Opt-in 3D studio of the portfolio. The 2D site remains at the homepage.',
  robots: { index: false, follow: false },
};

export default function WorldLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
