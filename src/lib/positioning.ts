import { fallbackAbout, fallbackExperience, fallbackHero, fallbackServices, fallbackStats } from './data';
import type { AboutData, Experience, HeroData, Service, StatsData } from './types';

/** Stale CMS / fallback copy from the frontend-engineer positioning. */
const LEGACY_FRONTEND = /frontend engineer|frontend engineering|end-to-end frontend/i;
const LEGACY_YEARS = /\b[78]\+\s*years\b/i;

export const positioningSiteTitle =
  'Shubham Gohar | Fullstack Engineer — React, Next.js, SFCC';

export const positioningSiteDescription =
  "Hi, I'm Shubham Gohar — a fullstack engineer with 10 years of experience building Salesforce Commerce Cloud storefronts and web applications with React, Next.js, TypeScript, and Node.js.";

export function isLegacyFrontendCopy(value?: string): boolean {
  if (!value) return true;
  return LEGACY_FRONTEND.test(value) || LEGACY_YEARS.test(value);
}

export function withPositioningHero(hero: HeroData): HeroData {
  const firstRole = hero.roles?.[0] ?? '';
  const roles =
    !hero.roles?.length || LEGACY_FRONTEND.test(firstRole)
      ? fallbackHero.roles
      : hero.roles;

  const hasLegacyYears = (hero.badges || []).some((badge) => LEGACY_YEARS.test(badge));
  const badges =
    hasLegacyYears || !hero.badges?.length ? fallbackHero.badges : hero.badges;

  return { ...hero, roles, badges };
}

export function withPositioningAbout(about: AboutData): AboutData {
  const description = isLegacyFrontendCopy(about.description)
    ? fallbackAbout.description
    : about.description;

  const firstCard = about.cards?.[0];
  const cards =
    firstCard && /frontend development/i.test(firstCard.title)
      ? fallbackAbout.cards
      : about.cards?.length
        ? about.cards
        : fallbackAbout.cards;

  return {
    heading: about.heading || fallbackAbout.heading,
    description,
    cards,
  };
}

export function withPositioningStats(stats: StatsData): StatsData {
  const source = stats.items?.length ? stats.items : fallbackStats.items;
  return {
    items: source.map((item) => {
      if (/year/i.test(item.label) && item.value < 10) {
        return { ...item, value: 10, suffix: '' };
      }
      return item;
    }),
  };
}

export function withPositioningServices(services: Service[]): Service[] {
  const list = services?.length ? services : fallbackServices;
  return list.map((service) => {
    if (
      service.title === 'Web Application Development' &&
      !/sfcc|fullstack/i.test(service.description)
    ) {
      return {
        ...service,
        description:
          'End-to-end fullstack development of modern, scalable web applications with React, Next.js, TypeScript, Node.js, and Salesforce Commerce Cloud (SFCC).',
        features: withFeature(
          withFeature(service.features, 'Salesforce Commerce Cloud (SFCC)'),
          'Node.js backends',
        ),
      };
    }
    if (
      service.title === 'API Integration & Architecture' &&
      /frontend interfaces/i.test(service.description)
    ) {
      return {
        ...service,
        description:
          'Connecting storefronts and web apps with backend services, third-party APIs, and real-time data — Node.js APIs, auth flows, and SFCC integrations.',
      };
    }
    return service;
  });
}

export function withPositioningExperience(experience: Experience[]): Experience[] {
  const list = experience?.length ? experience : fallbackExperience;
  return list.map((job) => {
    if (job.company !== 'Publicis Sapient') return job;
    const updated = fallbackExperience.find((item) => item.company === 'Publicis Sapient');
    if (!updated) return job;

    let next = job;
    if (/senior frontend engineer/i.test(job.role)) {
      next = { ...next, role: updated.role };
    }
    if (/leading frontend architecture/i.test(job.description)) {
      next = { ...next, description: updated.description };
    }
    return next;
  });
}

function withFeature(features: string[], feature: string): string[] {
  if (features.some((item) => item.toLowerCase() === feature.toLowerCase())) {
    return features;
  }
  return [...features, feature];
}
