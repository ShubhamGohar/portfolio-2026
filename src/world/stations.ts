import type { PortfolioData } from '@/lib/portfolio-data';

export type StationId =
  | 'home'
  | 'about'
  | 'services'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'testimonials'
  | 'contact';

export interface StationItem {
  heading: string;
  meta?: string;
  text?: string;
  href?: string;
  imageUrl?: string;
}

export interface StationLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Station {
  id: StationId;
  name: string;
  hash: string;
  hint: string;
  title: string;
  facts: string[];
  body?: string;
  sceneIndex: number;
  imageUrl?: string;
  imageAlt?: string;
  items?: StationItem[];
  links?: StationLink[];
}

export interface StudioIntro {
  eyebrow: string;
  title: string;
  titleEm?: string;
  lede: string;
  role: string;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function firstSentence(text: string): string {
  const match = text.trim().match(/^.+?[.](?=\s|$)/);
  return match ? match[0] : text.trim();
}

function currentRole(data: PortfolioData) {
  return data.experience.find((entry) => !entry.endDate) ?? data.experience[0];
}

export function buildIntro(data: PortfolioData): StudioIntro {
  const current = currentRole(data);
  const eyebrow = current
    ? `${current.role} · ${current.company}`
    : data.hero.roles[0] || data.hero.name;

  return {
    eyebrow,
    title: data.hero.name,
    titleEm: data.hero.tagline,
    lede: firstSentence(data.about.description || data.hero.tagline),
    role: data.hero.roles[0] || 'Fullstack Engineer',
  };
}

export function buildStations(data: PortfolioData): Station[] {
  const stations: Station[] = [];
  const current = currentRole(data);

  stations.push({
    id: 'home',
    name: 'Home',
    hash: '#home',
    hint: data.hero.roles[0] || data.hero.tagline,
    title: data.hero.name,
    facts: [
      ...(data.hero.roles ?? []).slice(0, 3),
      ...(data.hero.badges ?? []),
    ].filter(Boolean),
    body: data.hero.tagline,
    sceneIndex: 0,
    imageUrl: data.profileImageUrl,
    imageAlt: data.hero.name,
    links: [
      ...(data.hero.resumeURL
        ? [{ label: 'Download CV', href: data.hero.resumeURL, external: true }]
        : []),
      { label: 'Let’s Talk', href: '/#contact' },
    ],
  });

  stations.push({
    id: 'about',
    name: 'About',
    hash: '#about',
    hint: data.about.cards[0]?.title || data.about.heading,
    title: data.about.heading,
    facts: data.about.cards.map((card) => card.title).slice(0, 4),
    body: data.about.description,
    sceneIndex: 1,
    items: data.about.cards.map((card) => ({
      heading: card.title,
      text: card.description,
    })),
  });

  if (data.stats.items.length || data.services.length) {
    stations.push({
      id: 'services',
      name: 'Services',
      hash: '#services',
      hint: data.stats.items[0]
        ? `${data.stats.items[0].value}${data.stats.items[0].suffix || ''} ${data.stats.items[0].label}`
        : data.services[0]?.title || 'Services',
      title: data.services[0]?.title || 'Services',
      facts: data.stats.items.map(
        (item) => `${item.value}${item.suffix || ''} ${item.label}`.trim(),
      ),
      body: data.services[0]?.description,
      sceneIndex: 2,
      items: data.services.map((service) => ({
        heading: service.title,
        text: [service.description, service.features?.join(' · ')].filter(Boolean).join(' '),
      })),
    });
  }

  if (data.projects.length) {
    stations.push({
      id: 'projects',
      name: 'Projects',
      hash: '#projects',
      hint: data.projects[0].title,
      title: data.projects[0].title,
      facts: data.projects
        .map((project) => project.category)
        .filter((value, index, all) => value && all.indexOf(value) === index)
        .slice(0, 4),
      body: data.projects[0].description,
      sceneIndex: 3,
      items: data.projects.slice(0, 6).map((project) => ({
        heading: project.title,
        meta: [project.category, ...(project.tags ?? []).slice(0, 3)].filter(Boolean).join(' · '),
        text: project.description,
        href: project.projectUrl || project.codeUrl,
        imageUrl: project.imageUrl,
      })),
    });
  }

  if (data.skills.length) {
    const categories = [
      ...new Set(data.skills.map((skill) => skill.category).filter(Boolean)),
    ];
    stations.push({
      id: 'skills',
      name: 'Skills',
      hash: '#skills',
      hint: categories[0] || data.skills[0].name,
      title: categories.join(' · ') || data.skills[0].name,
      facts: categories.slice(0, 4),
      sceneIndex: 4,
      items: data.skills.map((skill) => ({
        heading: skill.name,
        meta: `${skill.category}${typeof skill.proficiency === 'number' ? ` · ${skill.proficiency}%` : ''}`,
      })),
    });
  }

  if (data.experience.length) {
    stations.push({
      id: 'experience',
      name: 'Experience',
      hash: '#experience',
      hint: current?.company || data.experience[0].company,
      title: current?.role || data.experience[0].role,
      facts: [current?.company, current && !current.endDate ? 'Present' : '']
        .filter((value): value is string => Boolean(value)),
      body: current?.description,
      sceneIndex: 5,
      items: data.experience.map((entry) => ({
        heading: entry.role,
        meta: `${entry.company} · ${formatDate(entry.startDate)} — ${entry.endDate ? formatDate(entry.endDate) : 'Present'}`,
        text: entry.description,
      })),
    });
  }

  if (data.testimonials.length) {
    const first = data.testimonials[0];
    stations.push({
      id: 'testimonials',
      name: 'Testimonials',
      hash: '#testimonials',
      hint: first.name,
      title: first.name,
      facts: [first.role, first.company].filter(Boolean),
      body: first.quote,
      sceneIndex: 6,
      items: data.testimonials.map((item) => ({
        heading: item.name,
        meta: [item.role, item.company].filter(Boolean).join(' · '),
        text: item.quote,
      })),
    });
  }

  stations.push({
    id: 'contact',
    name: 'Contact',
    hash: '#contact',
    hint: data.contact.email,
    title: data.contact.email,
    facts: [data.contact.email, data.contact.phone].filter((value): value is string => Boolean(value)),
    body: data.contact.address,
    sceneIndex: 7,
    links: [
      ...(data.contact.socials ?? []).map((social) => ({
        label: social.platform,
        href: social.url,
        external: true,
      })),
      { label: 'Use the form', href: '/#contact' },
    ],
  });

  return stations;
}
