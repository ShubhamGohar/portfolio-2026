import type { Metadata } from 'next';
import { metadata as studioMetadata, viewport } from 'next-sanity/studio';

export { viewport };

export const metadata: Metadata = {
    ...studioMetadata,
    title: 'Portfolio CMS — Sanity Studio',
    description: 'Content management for your portfolio',
    robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning style={{ margin: 0 }}>{children}</body>
        </html>
    );
}
