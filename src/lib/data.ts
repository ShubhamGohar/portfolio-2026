import { HeroData, AboutData, Project, Skill, Experience, Testimonial, ContactData, StatsData, Service } from './types';

// ============ Fallback Data (used when CMS is not configured) ============

export const fallbackHero: HeroData = {
    name: 'Shubham Gohar',
    tagline: 'I build things for the web.',
    roles: ['Frontend Engineer', 'React Developer', 'UI/UX Enthusiast', 'Freelancer'],
    resumeURL: '#',
};

export const fallbackAbout: AboutData = {
    heading: 'I Know That Good Development Means Good Business',
    description: 'With 7+ years of experience in frontend engineering, I craft high-performance, pixel-perfect web applications that drive business results.',
    cards: [
        { title: 'Frontend Development', description: 'Building responsive, performant web applications with React, Next.js, and modern JavaScript.', icon: 'code' },
        { title: 'UI/UX Design', description: 'Creating intuitive, beautiful interfaces with attention to detail and user experience.', icon: 'design' },
        { title: 'Performance Optimization', description: 'Ensuring lightning-fast load times with code splitting, lazy loading, and caching strategies.', icon: 'speed' },
        { title: 'Technical Consulting', description: 'Helping teams adopt best practices, modern tooling, and scalable architecture.', icon: 'consulting' },
    ],
};

export const fallbackProjects: Project[] = [
    {
        _id: '1',
        title: 'AI SaaS Platform',
        description: 'A full-stack AI-powered SaaS platform with image transformation, background removal, and object detection powered by Cloudinary AI.',
        category: 'Next JS',
        tags: ['Next.js', 'TypeScript', 'Cloudinary', 'Stripe'],
        projectUrl: '#',
        codeUrl: '#',
    },
    {
        _id: '2',
        title: 'E-Commerce Store',
        description: 'A modern e-commerce application with product management, cart functionality, and payment processing built with Payload CMS.',
        category: 'Next JS',
        tags: ['Next.js', 'Payload CMS', 'Stripe', 'TypeScript'],
        projectUrl: '#',
        codeUrl: '#',
    },
    {
        _id: '3',
        title: '3D Haunted House',
        description: 'An immersive 3D haunted house experience built with Three.js featuring realistic lighting, shadows, and interactive elements.',
        category: 'Three JS',
        tags: ['Three.js', 'WebGL', 'JavaScript', 'GSAP'],
        projectUrl: '#',
        codeUrl: '#',
    },
    {
        _id: '4',
        title: 'Marble Race Game',
        description: 'An interactive 3D marble racing game built with React Three Fiber featuring physics simulation and procedural level generation.',
        category: 'React JS',
        tags: ['React', 'Three.js', 'React Three Fiber', 'Rapier'],
        projectUrl: '#',
        codeUrl: '#',
    },
    {
        _id: '5',
        title: 'Blog with CMS',
        description: 'A performant blog platform powered by Sanity CMS with real-time content editing, categories, and full-text search.',
        category: 'Next JS',
        tags: ['Next.js', 'Sanity', 'TypeScript', 'Markdown'],
        projectUrl: '#',
        codeUrl: '#',
    },
    {
        _id: '6',
        title: 'Portfolio Website',
        description: 'This very portfolio — a modern, animated showcase built with Next.js, Framer Motion, and Sanity CMS for dynamic content.',
        category: 'Next JS',
        tags: ['Next.js', 'Framer Motion', 'Sanity', 'CSS'],
        projectUrl: '#',
        codeUrl: '#',
    },
];

export const fallbackSkills: Skill[] = [
    { _id: '1', name: 'React JS', icon: 'react', proficiency: 95, category: 'Frontend' },
    { _id: '2', name: 'Next.js', icon: 'nextjs', proficiency: 90, category: 'Frontend' },
    { _id: '3', name: 'TypeScript', icon: 'typescript', proficiency: 90, category: 'Frontend' },
    { _id: '4', name: 'JavaScript', icon: 'javascript', proficiency: 95, category: 'Frontend' },
    { _id: '5', name: 'HTML5', icon: 'html', proficiency: 98, category: 'Frontend' },
    { _id: '6', name: 'CSS3/SASS', icon: 'css', proficiency: 95, category: 'Frontend' },
    { _id: '7', name: 'Three.js', icon: 'threejs', proficiency: 75, category: 'Frontend' },
    { _id: '8', name: 'Node.js', icon: 'nodejs', proficiency: 80, category: 'Backend' },
    { _id: '9', name: 'Git', icon: 'git', proficiency: 90, category: 'Tools' },
    { _id: '10', name: 'Webpack', icon: 'webpack', proficiency: 85, category: 'Tools' },
    { _id: '11', name: 'Figma', icon: 'figma', proficiency: 80, category: 'Design' },
    { _id: '12', name: 'Redux', icon: 'redux', proficiency: 88, category: 'Frontend' },
];

export const fallbackExperience: Experience[] = [
    {
        _id: '1',
        company: 'Publicis Sapient',
        role: 'Senior Frontend Engineer',
        startDate: '2022-01-01',
        endDate: undefined,
        description: 'Leading frontend architecture for enterprise-scale applications. Mentoring junior developers and driving adoption of modern React patterns.',
    },
    {
        _id: '2',
        company: 'Orcapod',
        role: 'Frontend Developer',
        startDate: '2020-06-01',
        endDate: '2021-12-31',
        description: 'Built responsive web apps and dashboards using React, Redux, and TypeScript. Improved performance by 40% through code optimization.',
    },
    {
        _id: '3',
        company: 'Aarcons',
        role: 'Web Developer',
        startDate: '2019-01-01',
        endDate: '2020-05-31',
        description: 'Developed and maintained client websites and web applications. Implemented responsive designs and cross-browser compatibility.',
    },
    {
        _id: '4',
        company: 'BITS',
        role: 'Junior Developer',
        startDate: '2018-01-01',
        endDate: '2018-12-31',
        description: 'Started career building interfaces with HTML, CSS, and JavaScript. Gained experience in responsive design and version control.',
    },
];

export const fallbackTestimonials: Testimonial[] = [
    {
        _id: '1',
        name: 'Renu',
        company: 'SV Travels',
        role: 'Business Owner',
        quote: 'Shubham did an amazing job on our travel website. The design is beautiful, the site loads fast, and our bookings have increased significantly since launch!',
    },
    {
        _id: '2',
        name: 'Amit Patel',
        company: 'TechStart India',
        role: 'CTO',
        quote: 'Outstanding frontend skills combined with a deep understanding of UX. Shubham consistently delivered high-quality work under tight deadlines.',
    },
    {
        _id: '3',
        name: 'Sarah Chen',
        company: 'DigitalCraft',
        role: 'Product Manager',
        quote: 'Working with Shubham was a pleasure. He brought our designs to life with pixel-perfect precision and smooth animations that delighted our users.',
    },
];

export const fallbackContact: ContactData = {
    email: 'shubhamgohar@outlook.com',
    phone: '+91 7999 569 403',
    socials: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/shubhamgohar' },
        { platform: 'github', url: 'https://github.com/shubhamgohar' },
        { platform: 'twitter', url: 'https://twitter.com/shubhamgohar' },
    ],
};

export const fallbackStats: StatsData = {
    items: [
        { label: 'Years Experience', value: 7, suffix: '+' },
        { label: 'Projects Completed', value: 50, suffix: '+' },
        { label: 'Happy Clients', value: 30, suffix: '+' },
        { label: 'Technologies', value: 15, suffix: '+' },
    ],
};

export const fallbackServices: Service[] = [
    {
        _id: '1',
        title: 'Web Application Development',
        description: 'End-to-end development of modern, scalable web applications using React, Next.js, and TypeScript.',
        icon: 'web',
        features: ['Single Page Applications', 'Server-Side Rendering', 'Progressive Web Apps', 'API Integration'],
    },
    {
        _id: '2',
        title: 'UI/UX Implementation',
        description: 'Translating designs into pixel-perfect, responsive, and accessible user interfaces.',
        icon: 'design',
        features: ['Responsive Design', 'Cross-Browser Compatibility', 'Accessibility (WCAG)', 'Animation & Micro-interactions'],
    },
    {
        _id: '3',
        title: 'Performance Optimization',
        description: 'Auditing and optimizing web applications for speed, SEO, and Core Web Vitals.',
        icon: 'speed',
        features: ['Code Splitting', 'Lazy Loading', 'Image Optimization', 'Bundle Analysis'],
    },
    {
        _id: '4',
        title: 'CMS & Content Solutions',
        description: 'Setting up headless CMS solutions for easy, no-code content management.',
        icon: 'cms',
        features: ['Sanity CMS', 'Payload CMS', 'Content Modeling', 'Real-time Preview'],
    },
];
