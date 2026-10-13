import { sanityClient, siteSettingsQuery } from '@/lib/sanity';
import {
  isLegacyFrontendCopy,
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

export async function getSiteSettings() {
  if (!isSanityConfigured) return defaults;

  try {
    const settings = await sanityClient.fetch(siteSettingsQuery);
    const siteTitle = settings?.siteTitle || defaults.siteTitle;
    const siteDescription = settings?.siteDescription || defaults.siteDescription;
    return {
      siteTitle: isLegacyFrontendCopy(siteTitle) ? defaults.siteTitle : siteTitle,
      siteDescription: isLegacyFrontendCopy(siteDescription)
        ? defaults.siteDescription
        : siteDescription,
      faviconUrl: settings?.faviconUrl || defaults.faviconUrl,
    };
  } catch (e) {
    console.error('Failed to fetch site settings:', e);
    return defaults;
  }
}
