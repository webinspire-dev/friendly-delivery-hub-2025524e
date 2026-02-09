const SITE_URL = 'https://livreurautourdemoi.ma';

interface CityJsonLdProps {
  cityName: string;
  citySlug: string;
  courierCount: number;
}

const CityJsonLd = ({ cityName, citySlug, courierCount }: CityJsonLdProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `Livreur Autour de Moi - ${cityName}`,
    description: `Service de livraison et coursiers à ${cityName}, Maroc. ${courierCount} livreurs disponibles.`,
    url: `${SITE_URL}/livreurs/${citySlug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: cityName,
      addressCountry: 'MA',
    },
    areaServed: {
      '@type': 'City',
      name: cityName,
    },
    serviceType: 'Delivery Service',
    availableLanguage: ['French', 'Arabic'],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
};

export default CityJsonLd;
