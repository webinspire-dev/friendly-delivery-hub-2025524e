import { useEffect } from 'react';

const SITE_URL = 'https://livreurautourdemoi.ma';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
  canonical?: string;
}

const SEO = ({
  title,
  description,
  image = `${SITE_URL}/og-image.png`,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
  canonical,
}: SEOProps) => {
  useEffect(() => {
    document.title = title;

    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        const [attrName, attrValue] = selector.replace(/[\[\]"']/g, '').split('=');
        if (attrName.startsWith('property')) element.setAttribute('property', attrValue);
        else if (attrName.startsWith('name')) element.setAttribute('name', attrValue);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Basic meta
    updateMetaTag('meta[name="description"]', description);
    if (noIndex) updateMetaTag('meta[name="robots"]', 'noindex, nofollow');
    else updateMetaTag('meta[name="robots"]', 'index, follow');

    // Open Graph
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:image"]', image);
    if (url) updateMetaTag('meta[property="og:url"]', url);

    // Twitter
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', image);

    // Canonical
    const canonicalUrl = canonical || url;
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (link) {
        link.href = canonicalUrl;
      } else {
        link = document.createElement('link');
        link.rel = 'canonical';
        link.href = canonicalUrl;
        document.head.appendChild(link);
      }
    }

    return () => {
      document.title = 'Livreur Autour de Moi - Trouvez un livreur près de chez vous au Maroc';
    };
  }, [title, description, image, url, type, publishedTime, modifiedTime, author, noIndex, canonical]);

  return null;
};

export default SEO;
