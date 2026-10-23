import { cache } from 'react';
import { fallbackContact, fallbackProfileImageUrl } from '@/lib/data';
import { getSiteSettings } from '@/lib/get-site-settings';
import {
  aboutQuery,
  contactQuery,
  experienceQuery,
  heroQuery,
  optimizedImageUrl,
  sanityFetch,
  statsQuery,
} from '@/lib/sanity';
import {
  withAboutFallbacks,
  withExperienceFallbacks,
  withHeroFallbacks,
  withStatsFallbacks,
} from '@/lib/positioning';
import type {
  AboutData,
  ContactData,
  Experience,
  HeroData,
  Social,
  StatsData,
} from '@/lib/types';

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'demo';

export type PublishedProfile = {
  name: string;
  jobTitle: string;
  siteTitle: string;
  siteDescription: string;
  imageUrl: string;
  email: string;
  telephone: string;
  sameAs: string[];
  socials: Social[];
  worksFor?: string;
  currentRole?: string;
  yearsExperience?: number;
  aboutHeading: string;
  aboutDescription: string;
  experience: Experience[];
};

/** Published CMS social URLs only — never the hardcoded fallback profiles. */
export function publishedSameAs(socials: Social[] | undefined): string[] {
  if (!socials?.length) return [];
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const social of socials) {
    const url = social.url?.trim();
    if (!url || !/^https?:\/\//i.test(url)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

export function currentEmployer(
  experience: Experience[],
): { company: string; role: string } | undefined {
  const current = experience.find((item) => !item.endDate);
  if (!current?.company) return undefined;
  return { company: current.company, role: current.role };
}

function yearsExperience(stats: StatsData, badges?: string[]): number | undefined {
  const fromStats = stats.items.find((item) => /year/i.test(item.label));
  if (fromStats) return fromStats.value;
  const badge = badges?.find((item) => /\d+\s*years?/i.test(item));
  if (!badge) return undefined;
  const parsed = parseInt(badge, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function resolveProfileImageUrl(hero: HeroData) {
  return hero.profileImage?.asset
    ? optimizedImageUrl(hero.profileImage, 500, 500)
    : fallbackProfileImageUrl;
}

export const getPublishedProfile = cache(async (): Promise<PublishedProfile> => {
  const settings = await getSiteSettings();

  if (!isSanityConfigured) {
    const hero = withHeroFallbacks(null);
    const about = withAboutFallbacks(null);
    const experience = withExperienceFallbacks(null);
    const stats = withStatsFallbacks(null);
    const employer = currentEmployer(experience);
    return {
      name: hero.name,
      jobTitle: settings.jobTitle,
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      imageUrl: resolveProfileImageUrl(hero),
      email: fallbackContact.email,
      telephone: fallbackContact.phone,
      sameAs: [],
      socials: [],
      worksFor: employer?.company,
      currentRole: employer?.role,
      yearsExperience: yearsExperience(stats, hero.badges),
      aboutHeading: about.heading,
      aboutDescription: about.description,
      experience,
    };
  }

  try {
    const [hero, about, stats, experience, contact] = await Promise.all([
      sanityFetch<HeroData | null>(heroQuery),
      sanityFetch<AboutData | null>(aboutQuery),
      sanityFetch<StatsData | null>(statsQuery),
      sanityFetch<Experience[] | null>(experienceQuery),
      sanityFetch<ContactData | null>(contactQuery),
    ]);

    const resolvedHero = withHeroFallbacks(hero);
    const resolvedAbout = withAboutFallbacks(about);
    const resolvedExperience = withExperienceFallbacks(experience);
    const resolvedStats = withStatsFallbacks(stats);
    const employer = currentEmployer(resolvedExperience);
    const resolvedContact = contact || fallbackContact;
    const cmsSocials = contact?.socials?.filter((social) => social.url?.trim()) ?? [];

    return {
      name: resolvedHero.name,
      jobTitle: settings.jobTitle,
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      imageUrl: resolveProfileImageUrl(resolvedHero),
      email: resolvedContact.email,
      telephone: resolvedContact.phone,
      sameAs: publishedSameAs(cmsSocials),
      socials: cmsSocials,
      worksFor: employer?.company,
      currentRole: employer?.role,
      yearsExperience: yearsExperience(resolvedStats, resolvedHero.badges),
      aboutHeading: resolvedAbout.heading,
      aboutDescription: resolvedAbout.description,
      experience: resolvedExperience,
    };
  } catch (err) {
    console.error('Failed to fetch published profile:', err);
    const hero = withHeroFallbacks(null);
    const about = withAboutFallbacks(null);
    const experience = withExperienceFallbacks(null);
    const stats = withStatsFallbacks(null);
    const employer = currentEmployer(experience);
    return {
      name: hero.name,
      jobTitle: settings.jobTitle,
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      imageUrl: resolveProfileImageUrl(hero),
      email: fallbackContact.email,
      telephone: fallbackContact.phone,
      sameAs: [],
      socials: [],
      worksFor: employer?.company,
      currentRole: employer?.role,
      yearsExperience: yearsExperience(stats, hero.badges),
      aboutHeading: about.heading,
      aboutDescription: about.description,
      experience,
    };
  }
});
