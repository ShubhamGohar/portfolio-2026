import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
    name: 'siteSettings',
    title: 'Site Settings',
    type: 'document',
    fields: [
        defineField({ name: 'siteTitle', title: 'Website Title', type: 'string', description: 'Shown in the browser tab (e.g. "Shubham Gohar | Frontend Engineer")' }),
        defineField({ name: 'siteDescription', title: 'SEO Description', type: 'text', rows: 2, description: 'Meta description for search engines' }),
        defineField({
            name: 'logo',
            title: 'Logo Image',
            type: 'image',
            options: { hotspot: true },
            description: 'Upload your logo (displayed in Navbar and Footer)',
        }),
        defineField({
            name: 'favicon',
            title: 'Favicon',
            type: 'image',
            description: 'Small icon shown in the browser tab (recommended: 32x32 or 64x64 PNG)',
        }),
    ],
    preview: { prepare: () => ({ title: 'Site Settings' }) },
});
