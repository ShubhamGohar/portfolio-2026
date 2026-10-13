import { SITE_URL } from '@/lib/site';

interface JsonLdProps {
  title: string;
  description: string;
  jobTitle?: string;
}

export default function JsonLd({ title, description, jobTitle = 'Engineer' }: JsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: title,
        description,
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/#person`,
        name: 'Shubham Gohar',
        jobTitle,
        url: SITE_URL,
        description,
        sameAs: [
          'https://linkedin.com/in/shubhamgohar',
          'https://github.com/shubhamgohar',
          'https://twitter.com/shubhamgohar',
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
