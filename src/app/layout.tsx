import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import { getSiteSettings } from "@/lib/get-site-settings";
import { OG_IMAGE_URL, SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { siteTitle, siteDescription, faviconUrl } = await getSiteSettings();

  return {
    metadataBase: new URL(SITE_URL),
    title: siteTitle,
    description: siteDescription,
    keywords: [
      "Shubham Gohar", "Frontend Engineer", "React Developer",
      "Next.js Developer", "TypeScript", "Portfolio", "Web Developer", "UI/UX",
    ],
    authors: [{ name: "Shubham Gohar" }],
    alternates: { canonical: SITE_URL },
    icons: { icon: faviconUrl || '/logo-white.webp' },
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
          alt: "Shubham Gohar — Frontend Engineer",
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
  const { siteTitle, siteDescription } = await getSiteSettings();

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <JsonLd title={siteTitle} description={siteDescription} />
        {/* Background effects */}
        <div className="bg-grid" />
        <div className="bg-gradient-blur bg-gradient-blur--purple" />
        <div className="bg-gradient-blur bg-gradient-blur--blue" />
        {children}
      </body>
    </html>
  );
}
