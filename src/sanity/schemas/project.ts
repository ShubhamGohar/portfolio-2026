import { defineType, defineField } from 'sanity';

export const project = defineType({
    name: 'project',
    title: 'Project',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Next JS', value: 'Next JS' },
                    { title: 'React JS', value: 'React JS' },
                    { title: 'Three JS', value: 'Three JS' },
                    { title: 'Web App', value: 'Web App' },
                ],
            },
        }),
        defineField({ name: 'image', title: 'Project Image', type: 'image', options: { hotspot: true } }),
        defineField({ name: 'projectUrl', title: 'Live URL', type: 'url' }),
        defineField({ name: 'codeUrl', title: 'Source Code URL', type: 'url' }),
        defineField({
            name: 'tags',
            title: 'Tags',
            type: 'array',
            of: [{ type: 'string' }],
            options: { layout: 'tags' },
        }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'title', subtitle: 'category', media: 'image' },
    },
});
