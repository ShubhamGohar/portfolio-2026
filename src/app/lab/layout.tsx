import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  weight: '800',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lab — Shubham Gohar',
  description: 'Scrollable WebGL study. Opened by URL only.',
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.className} style={{ background: '#130e1d', colorScheme: 'dark' }}>
      <body style={{ margin: 0, background: '#130e1d', color: '#ffffff', overflowX: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
