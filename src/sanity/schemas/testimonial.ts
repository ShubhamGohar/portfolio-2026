import { defineType, defineField } from 'sanity';

export const testimonial = defineType({
    name: 'testimonial',
    title: 'Testimonial',
    type: 'document',
    fields: [
        defineField({ name: 'name', title: 'Client Name', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'company', title: 'Company', type: 'string' }),
        defineField({ name: 'role', title: 'Role', type: 'string' }),
        defineField({ name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (r) => r.required() }),
        defineField({ name: 'avatar', title: 'Avatar', type: 'image' }),
    ],
    preview: {
        select: { title: 'name', subtitle: 'company', media: 'avatar' },
    },
});
