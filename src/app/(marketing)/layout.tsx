import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import JsonLd from "@/components/JsonLd";
import EnableMotion from "@/components/EnableMotion";
import { getPublishedProfile } from "@/lib/published-profile";
import { OG_IMAGE_URL, SITE_NAME, SITE_URL } from "@/lib/site";

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, siteDescription } = await getPublishedProfile();

  return {
    metadataBase: new URL(SITE_URL),
    title: siteTitle,
    description: siteDescription,
    keywords: [
      "Shubham Gohar", "Fullstack Engineer", "SFCC", "Salesforce Commerce Cloud",
      "React Developer", "Next.js Developer", "Node.js", "TypeScript", "Portfolio", "Web Developer",
    ],
    authors: [{ name: "Shubham Gohar" }],
    alternates: { canonical: SITE_URL },
    // Local 38px asset — a Sanity 1024×1024 favicon was getting <link rel=preload as=image>.
    icons: { icon: '/logo-white.webp' },
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "Shubham Gohar — Fullstack Engineer",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [OG_IMAGE_URL],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getPublishedProfile();

  return (
    <html lang="en" className={inter.variable} style={{ background: "#0a0a0f", colorScheme: "dark" }}>
      <body style={{ background: "#0a0a0f", color: "#f0f0f5" }}>
        <JsonLd profile={profile} />
        {/* Background effects */}
        <div className="bg-grid" />
        <div className="bg-gradient-blur bg-gradient-blur--purple" />
        <div className="bg-gradient-blur bg-gradient-blur--blue" />
        {children}
        <EnableMotion />
      </body>
    </html>
  );
}
