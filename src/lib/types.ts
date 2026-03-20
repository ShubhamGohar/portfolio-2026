// ============ Type Definitions ============

export interface HeroData {
    name: string;
    tagline: string;
    roles: string[];
    profileImage?: SanityImage;
    resumeURL?: string;
    badges?: string[];
}

export interface SanityImage {
    _type: 'image';
    asset: {
        _ref: string;
        _type: 'reference';
    };
}

export interface AboutCard {
    title: string;
    description: string;
    icon: string;
}

export interface AboutData {
    heading: string;
    description: string;
    cards: AboutCard[];
}

export interface Project {
    _id: string;
    title: string;
    description: string;
    category: string;
    image?: SanityImage;
    projectUrl?: string;
    codeUrl?: string;
    tags: string[];
}

export interface Skill {
    _id: string;
    name: string;
    icon: string;
    proficiency: number;
    category: string;
}

export interface Experience {
    _id: string;
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
    logo?: SanityImage;
}

export interface Testimonial {
    _id: string;
    name: string;
    company: string;
    role: string;
    quote: string;
    avatar?: SanityImage;
}

export interface ContactData {
    email: string;
    phone: string;
    address?: string;
    socials: Social[];
}

export interface Social {
    platform: string;
    url: string;
}

export interface StatItem {
    label: string;
    value: number;
    suffix?: string;
}

export interface StatsData {
    items: StatItem[];
}

export interface Service {
    _id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
}
