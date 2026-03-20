import { defineType, defineField } from 'sanity';

export const about = defineType({
    name: 'about',
    title: 'About Section',
    type: 'document',
    fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
        defineField({
            name: 'cards',
            title: 'About Cards',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'title', title: 'Title', type: 'string' }),
                        defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
                        defineField({
                            name: 'icon',
                            title: 'Icon Key',
                            type: 'string',
                            description: 'Icon identifier: code, design, speed, consulting',
                        }),
                    ],
                },
            ],
        }),
    ],
    preview: { select: { title: 'heading' } },
});
