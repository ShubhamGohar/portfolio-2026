import { NextResponse } from 'next/server';
import { getPortfolioData } from '@/lib/portfolio-data';
import { buildIntro, buildStations } from '@/world/stations';

export const revalidate = 60;

export async function GET() {
  const data = await getPortfolioData({
    projectImageWidth: 800,
    projectImageHeight: 450,
    projectImageFit: 'crop',
  });

  const payload = {
    intro: buildIntro(data),
    stations: buildStations(data),
    hero: {
      name: data.hero.name,
      tagline: data.hero.tagline,
      roles: data.hero.roles,
      badges: data.hero.badges,
      resumeURL: data.hero.resumeURL,
    },
    about: data.about,
    stats: data.stats,
    services: data.services.map(({ _id, title, description, features }) => ({
      _id,
      title,
      description,
      features,
    })),
    projects: data.projects.map(({ _id, title, description, category, tags, projectUrl, codeUrl, imageUrl }) => ({
      _id,
      title,
      description,
      category,
      tags,
      projectUrl,
      codeUrl,
      imageUrl,
    })),
    skills: data.skills.map(({ _id, name, category, proficiency }) => ({
      _id,
      name,
      category,
      proficiency,
    })),
    experience: data.experience.map(({ _id, company, role, startDate, endDate, description }) => ({
      _id,
      company,
      role,
      startDate,
      endDate,
      description,
    })),
    testimonials: data.testimonials.map(({ _id, name, company, role, quote }) => ({
      _id,
      name,
      company,
      role,
      quote,
    })),
    contact: data.contact,
  };

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
