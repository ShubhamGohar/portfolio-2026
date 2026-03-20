import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = Parameters<ReturnType<typeof imageUrlBuilder>['image']>[0];

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'demo',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// ============ GROQ Queries ============

export const heroQuery = `*[_type == "hero"][0]{
  name, tagline, roles, profileImage, badges,
  "resumeURL": resumeFile.asset->url
}`;

export const aboutQuery = `*[_type == "about"][0]{
  heading, description, cards[]{title, description, icon}
}`;

export const projectsQuery = `*[_type == "project"] | order(order asc){
  _id, title, description, category, image, projectUrl, codeUrl, tags
}`;

export const skillsQuery = `*[_type == "skill"] | order(order asc){
  _id, name, icon, proficiency, category
}`;

export const experienceQuery = `*[_type == "experience"] | order(startDate desc){
  _id, company, role, startDate, endDate, description, logo
}`;

export const testimonialsQuery = `*[_type == "testimonial"]{
  _id, name, company, role, quote, avatar
}`;

export const contactQuery = `*[_type == "contact"][0]{
  email, phone, address, socials[]{platform, url}
}`;

export const statsQuery = `*[_type == "stats"][0]{
  items[]{label, value, suffix}
}`;

export const servicesQuery = `*[_type == "service"] | order(order asc){
  _id, title, description, icon, features
}`;

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteTitle, siteDescription,
  "logoUrl": logo.asset->url,
  "faviconUrl": favicon.asset->url
}`;
