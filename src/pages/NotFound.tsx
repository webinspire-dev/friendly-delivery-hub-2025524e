import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import SEO from '@/components/SEO';

const NotFound = () => {
  const location = useLocation();
  const { language, direction } = useLanguage();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted" dir={direction}>
      <SEO
        title={language === 'ar' ? 'الصفحة ماكايناش - 404' : 'Page non trouvée - 404'}
        description={language === 'ar' ? 'الصفحة اللي قلبتي عليها ماكايناش.' : 'La page que vous recherchez n\'existe pas.'}
        noIndex
      />
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
        <p className="mb-2 text-xl text-muted-foreground">
          {language === 'ar' ? 'الصفحة ماكايناش' : 'Page non trouvée'}
        </p>
        <p className="mb-8 text-muted-foreground">
          {language === 'ar'
            ? 'الصفحة اللي قلبتي عليها ماكايناش ولا تحذفات.'
            : 'La page que vous recherchez n\'existe pas ou a été déplacée.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          {language === 'ar' ? 'رجع للرئيسية' : 'Retour à l\'accueil'}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
