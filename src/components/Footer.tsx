import { useLanguage } from '@/contexts/LanguageContext';
import { useCities } from '@/contexts/CitiesContext';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Footer = () => {
  const { t, language } = useLanguage();
  const { activeCities, getCityDisplayName } = useCities();

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={logo} alt="Livreur Autour de Moi" className="h-40 w-auto mb-4" />
            <p className="text-background/70 max-w-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2 text-background/70">
              <li><Link to="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/news" className="hover:text-primary transition-colors">{language === 'ar' ? 'الأخبار' : 'Actualités'}</Link></li>
              <li><a href="/#couriers" className="hover:text-primary transition-colors">{t('nav.couriers')}</a></li>
              <li><a href="/#become" className="hover:text-primary transition-colors">{t('nav.becomeCourier')}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-background/70">
              <li><Link to="/about" className="hover:text-primary transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('footer.contact')}</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>

          {/* Cities - SEO internal links */}
          <div>
            <h4 className="font-semibold mb-4">{language === 'ar' ? 'المدن' : 'Villes'}</h4>
            <ul className="space-y-2 text-background/70 text-sm">
              {activeCities.slice(0, 8).map((city) => (
                <li key={city.id}>
                  <Link to={`/livreurs/${city.name}`} className="hover:text-primary transition-colors">
                    {language === 'ar'
                      ? `ليفرورات ${getCityDisplayName(city.name)}`
                      : `Livreurs ${getCityDisplayName(city.name)}`}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 text-center text-sm text-background/50">
          © 2026 Livreur Autour de Moi. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
