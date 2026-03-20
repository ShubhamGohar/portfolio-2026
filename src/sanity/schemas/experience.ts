import { defineType, defineField } from 'sanity';

export const experience = defineType({
    name: 'experience',
    title: 'Work Experience',
    type: 'document',
    fields: [
        defineField({ name: 'company', title: 'Company', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'role', title: 'Role / Title', type: 'string', validation: (r) => r.required() }),
        defineField({ name: 'startDate', title: 'Start Date', type: 'date' }),
        defineField({ name: 'endDate', title: 'End Date (leave empty if current)', type: 'date' }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
        defineField({ name: 'logo', title: 'Company Logo', type: 'image' }),
    ],
    preview: {
        select: { title: 'role', subtitle: 'company', media: 'logo' },
    },
    orderings: [
        { title: 'Start Date (Newest)', name: 'startDateDesc', by: [{ field: 'startDate', direction: 'desc' }] },
    ],
});
