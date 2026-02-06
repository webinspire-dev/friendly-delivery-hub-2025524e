import { useEffect } from 'react';

interface SEOProps { title: string; description: string; image?: string; url?: string; type?: 'website' | 'article'; publishedTime?: string; modifiedTime?: string; author?: string; noIndex?: boolean; }

const SEO = ({ title, description, image = 'https://lovable.dev/opengraph-image-p98pqg.png', url, type = 'website', publishedTime, modifiedTime, author, noIndex = false }: SEOProps) => {
  useEffect(() => {
    document.title = title;
    const updateMetaTag = (selector: string, content: string, attr = 'content') => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (element) { element.setAttribute(attr, content); } else {
        element = document.createElement('meta');
        const [attrName, attrValue] = selector.replace(/[\[\]"']/g, '').split('=');
        if (attrName.startsWith('property')) element.setAttribute('property', attrValue);
        else if (attrName.startsWith('name')) element.setAttribute('name', attrValue);
        element.setAttribute(attr, content); document.head.appendChild(element);
      }
    };
    updateMetaTag('meta[name="description"]', description);
    updateMetaTag('meta[property="og:title"]', title);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:image"]', image);
    if (url) updateMetaTag('meta[property="og:url"]', url);
    updateMetaTag('meta[name="twitter:title"]', title);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', image);
    if (noIndex) updateMetaTag('meta[name="robots"]', 'noindex, nofollow');
    return () => { document.title = 'Livreur Autour de Moi - Trouvez un livreur près de chez vous'; };
  }, [title, description, image, url, type, publishedTime, modifiedTime, author, noIndex]);
  return null;
};

export default SEO;
