export const metadata = {
    title: 'Portfolio CMS — Sanity Studio',
    description: 'Content management for your portfolio',
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning style={{ margin: 0 }}>{children}</body>
        </html>
    );
}
