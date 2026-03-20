import { defineType, defineField } from 'sanity';

export const skill = defineType({
    name: 'skill',
    title: 'Skill',
    type: 'document',
    fields: [
        defineField({ name: 'name', title: 'Skill Name', type: 'string', validation: (r) => r.required() }),
        defineField({
            name: 'icon',
            title: 'Icon Key',
            type: 'string',
            description: 'Icon identifier: react, nextjs, typescript, javascript, html, css, threejs, nodejs, git, webpack, figma, redux',
        }),
        defineField({
            name: 'proficiency',
            title: 'Proficiency (%)',
            type: 'number',
            validation: (r) => r.min(0).max(100),
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Frontend', value: 'Frontend' },
                    { title: 'Backend', value: 'Backend' },
                    { title: 'Tools', value: 'Tools' },
                    { title: 'Design', value: 'Design' },
                ],
            },
        }),
        defineField({ name: 'order', title: 'Display Order', type: 'number' }),
    ],
    preview: {
        select: { title: 'name', subtitle: 'category' },
    },
});
