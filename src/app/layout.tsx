import type { Metadata } from "next";
import "./globals.css";
import { sanityClient, siteSettingsQuery } from "@/lib/sanity";

const isSanityConfigured = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'demo';

export async function generateMetadata(): Promise<Metadata> {
  let siteTitle = "Shubham Gohar | Frontend Engineer — React, Next.js, TypeScript";
  let siteDescription = "Hi, I'm Shubham Gohar — a Frontend Engineer with 7+ years of experience building high-performance web applications with React, Next.js, and TypeScript.";
  let faviconUrl: string | undefined;

  if (isSanityConfigured) {
    try {
      const settings = await sanityClient.fetch(siteSettingsQuery);
      if (settings?.siteTitle) siteTitle = settings.siteTitle;
      if (settings?.siteDescription) siteDescription = settings.siteDescription;
      if (settings?.faviconUrl) faviconUrl = settings.faviconUrl;
    } catch (e) {
      console.error('Failed to fetch site settings:', e);
    }
  }

  return {
    title: siteTitle,
    description: siteDescription,
    keywords: [
      "Shubham Gohar", "Frontend Engineer", "React Developer",
      "Next.js Developer", "TypeScript", "Portfolio", "Web Developer", "UI/UX",
    ],
    authors: [{ name: "Shubham Gohar" }],
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: "https://shubhamgohar.com",
      siteName: "Shubham Gohar Portfolio",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {/* Background effects */}
        <div className="bg-grid" />
        <div className="bg-gradient-blur bg-gradient-blur--purple" />
        <div className="bg-gradient-blur bg-gradient-blur--blue" />
        {children}
      </body>
    </html>
  );
}
