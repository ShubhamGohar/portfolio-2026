import type { Metadata } from 'next';
import { Bricolage_Grotesque, Fraunces, Inter_Tight } from 'next/font/google';
import './lab.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--lab-display',
  display: 'swap',
});

const body = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--lab-body',
  display: 'swap',
});

const serif = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--lab-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lab — Shubham Gohar',
  description: 'Throwaway WebGL concept mockups. Opened by URL only.',
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
