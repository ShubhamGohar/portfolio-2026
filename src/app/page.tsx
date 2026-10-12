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
  sanityClient,
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
import type { HeroData, Project } from '@/lib/types';

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
          sanityClient.fetch(heroQuery),
          sanityClient.fetch(aboutQuery),
          sanityClient.fetch(statsQuery),
          sanityClient.fetch(servicesQuery),
          sanityClient.fetch(projectsQuery),
          sanityClient.fetch(skillsQuery),
          sanityClient.fetch(experienceQuery),
          sanityClient.fetch(testimonialsQuery),
          sanityClient.fetch(contactQuery),
          sanityClient.fetch(siteSettingsQuery),
        ]);

      const resolvedHero = hero || fallbackHero;

      return {
        hero: resolvedHero,
        profileImageUrl: resolveProfileImageUrl(resolvedHero),
        about: about ? {
          heading: about.heading || fallbackAbout.heading,
          description: about.description || fallbackAbout.description,
          cards: about.cards?.length ? about.cards : fallbackAbout.cards,
        } : fallbackAbout,
        stats: stats?.items?.length ? stats : fallbackStats,
        services: services?.length ? services : fallbackServices,
        projects: withProjectImageUrls(projects?.length ? projects : fallbackProjects),
        skills: skills?.length ? skills : fallbackSkills,
        experience: experience?.length ? experience : fallbackExperience,
        testimonials: testimonials?.length ? testimonials : fallbackTestimonials,
        contact: contact || fallbackContact,
        logoUrl: siteSettings?.logoUrl || null,
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
    logoUrl: null,
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
