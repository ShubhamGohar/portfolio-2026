import { sanityFetch, siteSettingsQuery } from '@/lib/sanity';
import {
  positioningSiteDescription,
  positioningSiteTitle,
} from '@/lib/positioning';

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'demo';

const defaults = {
  siteTitle: positioningSiteTitle,
  siteDescription: positioningSiteDescription,
  faviconUrl: undefined as string | undefined,
};

export function jobTitleFromSiteTitle(siteTitle: string): string {
  const afterPipe = siteTitle.split('|').slice(1).join('|').trim();
  if (!afterPipe) return siteTitle;
  return afterPipe.split(/\s+[—–-]\s+/)[0]?.trim() || afterPipe;
}

export async function getSiteSettings() {
  if (!isSanityConfigured) {
    return { ...defaults, jobTitle: jobTitleFromSiteTitle(defaults.siteTitle) };
  }

  try {
    const settings = await sanityFetch<{
      siteTitle?: string;
      siteDescription?: string;
      faviconUrl?: string;
    }>(siteSettingsQuery);
    const siteTitle = settings?.siteTitle || defaults.siteTitle;
    const siteDescription = settings?.siteDescription || defaults.siteDescription;
    return {
      siteTitle,
      siteDescription,
      faviconUrl: settings?.faviconUrl || defaults.faviconUrl,
      jobTitle: jobTitleFromSiteTitle(siteTitle),
    };
  } catch (e) {
    console.error('Failed to fetch site settings:', e);
    return { ...defaults, jobTitle: jobTitleFromSiteTitle(defaults.siteTitle) };
  }
}
