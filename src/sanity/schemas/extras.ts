import { defineType, defineField } from 'sanity';

export const stats = defineType({
    name: 'stats',
    title: 'Stats / Numbers',
    type: 'document',
    fields: [
        defineField({
            name: 'items',
            title: 'Stat Items',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({ name: 'label', title: 'Label', type: 'string' }),
                        defineField({ name: 'value', title: 'Value (number)', type: 'number' }),
                        defineField({ name: 'suffix', title: 'Suffix (e.g. +)', type: 'string' }),
                    ],
                },
            ],
        }),
    ],
    preview: { prepare: () => ({ title: 'Stats' }) },
});

export const service = defineType({
    name: 'service',
    title: 'Service',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
        defineField({
            name: 'icon',
            title: 'Icon Key',
            type: 'string',
            description: 'Icon identifier: web, design, speed, cms',
        }),
        defineField({
            name: 'features',
            title: 'Features',
            type: 'array',
            of: [{ type: 'string' }],
        }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: { select: { title: 'title' } },
});
