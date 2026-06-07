import { sanityClient, siteSettingsQuery } from '@/lib/sanity';

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'demo';

const defaults = {
  siteTitle: 'Shubham Gohar | Frontend Engineer — React, Next.js, TypeScript',
  siteDescription:
    "Hi, I'm Shubham Gohar — a Frontend Engineer with 8+ years of experience building high-performance web applications with React, Next.js, and TypeScript.",
  faviconUrl: undefined as string | undefined,
};

export async function getSiteSettings() {
  if (!isSanityConfigured) return defaults;

  try {
    const settings = await sanityClient.fetch(siteSettingsQuery);
    return {
      siteTitle: settings?.siteTitle || defaults.siteTitle,
      siteDescription: settings?.siteDescription || defaults.siteDescription,
      faviconUrl: settings?.faviconUrl || defaults.faviconUrl,
    };
  } catch (e) {
    console.error('Failed to fetch site settings:', e);
    return defaults;
  }
}
