import { SITE_URL } from '@/lib/site';
import type { PublishedProfile } from '@/lib/published-profile';

export default function JsonLd({ profile }: { profile: PublishedProfile }) {
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;

  const person: Record<string, unknown> = {
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    jobTitle: profile.jobTitle,
    url: SITE_URL,
    description: profile.siteDescription,
    image: {
      '@type': 'ImageObject',
      url: profile.imageUrl,
    },
    email: profile.email,
    telephone: profile.telephone,
  };

  if (profile.sameAs.length) {
    person.sameAs = profile.sameAs;
  }

  if (profile.worksFor) {
    person.worksFor = {
      '@type': 'Organization',
      name: profile.worksFor,
    };
  }

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: SITE_URL,
        name: profile.siteTitle,
        description: profile.siteDescription,
        publisher: { '@id': personId },
        author: { '@id': personId },
      },
      person,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
