import { defineType, defineField } from 'sanity';

export const contact = defineType({
    name: 'contact',
    title: 'Contact Info',
    type: 'document',
    fields: [
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Phone', type: 'string' }),
        defineField({ name: 'address', title: 'Address', type: 'string' }),
        defineField({
            name: 'socials',
            title: 'Social Links',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        defineField({
                            name: 'platform',
                            title: 'Platform',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'LinkedIn', value: 'linkedin' },
                                    { title: 'GitHub', value: 'github' },
                                    { title: 'Twitter', value: 'twitter' },
                                    { title: 'Instagram', value: 'instagram' },
                                ],
                            },
                        }),
                        defineField({ name: 'url', title: 'URL', type: 'url' }),
                    ],
                },
            ],
        }),
    ],
    preview: { select: { title: 'email' } },
});
