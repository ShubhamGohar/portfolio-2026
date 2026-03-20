import { defineType, defineField } from 'sanity';

export const hero = defineType({
    name: 'hero',
    title: 'Hero Section',
    type: 'document',
    fields: [
        defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'tagline', title: 'Tagline', type: 'text', rows: 2 }),
        defineField({
            name: 'roles',
            title: 'Roles (shown in typewriter)',
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({ name: 'profileImage', title: 'Profile Image', type: 'image', options: { hotspot: true } }),
        defineField({
            name: 'resumeFile',
            title: 'Resume (PDF)',
            type: 'file',
            options: { accept: '.pdf' },
            description: 'Upload your resume PDF here',
        }),
        defineField({
            name: 'badges',
            title: 'Floating Badges',
            description: 'Small floating labels around the profile image (e.g. "7+ Years", "50+ Projects")',
            type: 'array',
            of: [{ type: 'string' }],
            validation: (r) => r.max(3),
        }),
    ],
    preview: { select: { title: 'name' } },
});
