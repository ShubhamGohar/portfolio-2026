import {
  sanityFetch,
  heroQuery,
  aboutQuery,
  statsQuery,
  servicesQuery,
  projectsQuery,
  skillsQuery,
  experienceQuery,
  testimonialsQuery,
  contactQuery,
  siteSettingsQuery,
  optimizedImageUrl,
  profileImageSources,
} from '@/lib/sanity';
import {
  fallbackHero,
  fallbackAbout,
  fallbackStats,
  fallbackServices,
  fallbackProjects,
  fallbackSkills,
  fallbackExperience,
  fallbackTestimonials,
  fallbackContact,
  fallbackProfileImageUrl,
} from '@/lib/data';
import {
  withAboutFallbacks,
  withExperienceFallbacks,
  withHeroFallbacks,
  withServicesFallbacks,
  withStatsFallbacks,
} from '@/lib/positioning';
import type {
  AboutData,
  ContactData,
  Experience,
  HeroData,
  Project,
  Service,
  Skill,
  StatsData,
  Testimonial,
} from '@/lib/types';

export type PortfolioData = {
  hero: HeroData;
  profileImageUrl: string;
  profileImageSrcSet: string;
  profileImageSizes: string;
  about: AboutData;
  stats: StatsData;
  services: Service[];
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  testimonials: Testimonial[];
  contact: ContactData;
  logoUrl?: string;
};

const isSanityConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'demo';

function resolveProfileImage(hero: HeroData) {
  return profileImageSources(hero.profileImage, fallbackProfileImageUrl);
}

function withProjectImageUrls(
  projects: Project[],
  width: number,
  height?: number,
  fit?: 'crop' | 'max' | 'clip' | 'min',
): Project[] {
  return projects.map((project) => ({
    ...project,
    imageUrl: project.image
      ? optimizedImageUrl(project.image, width, height, 80, fit)
      : project.imageUrl,
  }));
}

export async function getPortfolioData(options?: {
  projectImageWidth?: number;
  projectImageHeight?: number;
  projectImageFit?: 'crop' | 'max' | 'clip' | 'min';
}): Promise<PortfolioData> {
  const projectImageWidth = options?.projectImageWidth ?? 680;
  const projectImageHeight = options?.projectImageHeight ?? 440;
  const projectImageFit = options?.projectImageFit;

  if (isSanityConfigured) {
    try {
      const [hero, about, stats, services, projects, skills, experience, testimonials, contact, siteSettings] =
        await Promise.all([
          sanityFetch<HeroData | null>(heroQuery),
          sanityFetch<AboutData | null>(aboutQuery),
          sanityFetch<StatsData | null>(statsQuery),
          sanityFetch<Service[] | null>(servicesQuery),
          sanityFetch<Project[] | null>(projectsQuery),
          sanityFetch<Skill[] | null>(skillsQuery),
          sanityFetch<Experience[] | null>(experienceQuery),
          sanityFetch<Testimonial[] | null>(testimonialsQuery),
          sanityFetch<ContactData | null>(contactQuery),
          sanityFetch<{ logoUrl?: string | null } | null>(siteSettingsQuery),
        ]);

      const resolvedHero = withHeroFallbacks(hero);
      const profileImage = resolveProfileImage(resolvedHero);

      return {
        hero: resolvedHero,
        profileImageUrl: profileImage.src,
        profileImageSrcSet: profileImage.srcSet,
        profileImageSizes: profileImage.sizes,
        about: withAboutFallbacks(about),
        stats: withStatsFallbacks(stats),
        services: withServicesFallbacks(services),
        projects: withProjectImageUrls(
          projects?.length ? projects : fallbackProjects,
          projectImageWidth,
          projectImageHeight,
          projectImageFit,
        ),
        skills: skills?.length ? skills : fallbackSkills,
        experience: withExperienceFallbacks(experience),
        testimonials: testimonials?.length ? testimonials : fallbackTestimonials,
        contact: contact || fallbackContact,
        logoUrl: siteSettings?.logoUrl || undefined,
      };
    } catch (err) {
      console.error('Failed to fetch from Sanity, using fallback data:', err);
    }
  }

  const profileImage = profileImageSources(undefined, fallbackProfileImageUrl);

  return {
    hero: fallbackHero,
    profileImageUrl: profileImage.src,
    profileImageSrcSet: profileImage.srcSet,
    profileImageSizes: profileImage.sizes,
    about: fallbackAbout,
    stats: fallbackStats,
    services: fallbackServices,
    projects: withProjectImageUrls(
      fallbackProjects,
      projectImageWidth,
      projectImageHeight,
      projectImageFit,
    ),
    skills: fallbackSkills,
    experience: fallbackExperience,
    testimonials: fallbackTestimonials,
    contact: fallbackContact,
    logoUrl: undefined,
  };
}
