const WebsiteJsonLd = () => {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Livreur Autour de Moi', url: 'https://livereur.lovable.app', description: 'La plateforme de mise en relation entre clients et livreurs locaux au Maroc.' };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
};
export default WebsiteJsonLd;
