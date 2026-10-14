import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Stats from '@/components/Stats';
import Services from '@/components/Services';
import Projects from '@/components/Projects';
import Skills from '@/components/Skills';
import ExperienceSection from '@/components/ExperienceSection';
import Testimonials from '@/components/Testimonials';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

import {
  sanityFetch,
  heroQuery, aboutQuery, statsQuery, servicesQuery,
  projectsQuery, skillsQuery, experienceQuery, testimonialsQuery, contactQuery,
  siteSettingsQuery,
  optimizedImageUrl,
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

export const revalidate = 60;

const isSanityConfigured = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'demo';

function resolveProfileImageUrl(hero: HeroData) {
  return hero.profileImage?.asset
    ? optimizedImageUrl(hero.profileImage, 500, 500)
    : fallbackProfileImageUrl;
}

function withProjectImageUrls(projects: Project[]): Project[] {
  return projects.map((project) => ({
    ...project,
    imageUrl: project.image
      ? optimizedImageUrl(project.image, 680, 440)
      : project.imageUrl,
  }));
}

async function getData() {
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

      return {
        hero: resolvedHero,
        profileImageUrl: resolveProfileImageUrl(resolvedHero),
        about: withAboutFallbacks(about),
        stats: withStatsFallbacks(stats),
        services: withServicesFallbacks(services),
        projects: withProjectImageUrls(projects?.length ? projects : fallbackProjects),
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

  return {
    hero: fallbackHero,
    profileImageUrl: fallbackProfileImageUrl,
    about: fallbackAbout,
    stats: fallbackStats,
    services: fallbackServices,
    projects: fallbackProjects,
    skills: fallbackSkills,
    experience: fallbackExperience,
    testimonials: fallbackTestimonials,
    contact: fallbackContact,
    logoUrl: undefined,
  };
}

export default async function Home() {
  const data = await getData();

  return (
    <>
      <Navbar />
      <main>
        <Hero data={data.hero} profileImageUrl={data.profileImageUrl} />
        <About data={data.about} />
        <Stats data={data.stats} />
        <Services data={data.services} />
        <Projects data={data.projects} />
        <Skills data={data.skills} />
        <ExperienceSection data={data.experience} />
        <Testimonials data={data.testimonials} />
        <Contact data={data.contact} />
      </main>
      <Footer contactData={data.contact} logoUrl={data.logoUrl} />
    </>
  );
}
