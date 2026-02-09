const SITE_URL = 'https://livreurautourdemoi.ma';

const WebsiteJsonLd = () => {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Livreur Autour de Moi',
    url: SITE_URL,
    description: 'Première plateforme marocaine de mise en relation entre clients et livreurs indépendants.',
    inLanguage: ['fr-MA', 'ar-MA'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?city={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Livreur Autour de Moi',
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['French', 'Arabic'],
    },
    areaServed: {
      '@type': 'Country',
      name: 'Morocco',
    },
    sameAs: [],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
    </>
  );
};

export default WebsiteJsonLd;
