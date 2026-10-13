import { fallbackAbout, fallbackExperience, fallbackHero, fallbackServices, fallbackStats } from './data';
import type { AboutData, Experience, HeroData, Service, StatsData } from './types';

/** Used only when the matching CMS field is empty — published Studio copy always wins. */
export const positioningSiteTitle =
  'Shubham Gohar | Fullstack Engineer — React, Next.js, SFCC';

export const positioningSiteDescription =
  "Hi, I'm Shubham Gohar — a fullstack engineer with 10 years of experience building Salesforce Commerce Cloud storefronts and web applications with React, Next.js, TypeScript, and Node.js.";

export function withHeroFallbacks(hero?: HeroData | null): HeroData {
  if (!hero) return fallbackHero;
  return {
    ...hero,
    name: hero.name || fallbackHero.name,
    tagline: hero.tagline || fallbackHero.tagline,
    roles: hero.roles?.length ? hero.roles : fallbackHero.roles,
    badges: hero.badges?.length ? hero.badges : fallbackHero.badges,
  };
}

export function withAboutFallbacks(about?: AboutData | null): AboutData {
  if (!about) return fallbackAbout;
  return {
    heading: about.heading || fallbackAbout.heading,
    description: about.description || fallbackAbout.description,
    cards: about.cards?.length ? about.cards : fallbackAbout.cards,
  };
}

export function withStatsFallbacks(stats?: StatsData | null): StatsData {
  return {
    items: stats?.items?.length ? stats.items : fallbackStats.items,
  };
}

export function withServicesFallbacks(services?: Service[] | null): Service[] {
  return services?.length ? services : fallbackServices;
}

export function withExperienceFallbacks(experience?: Experience[] | null): Experience[] {
  return experience?.length ? experience : fallbackExperience;
}
