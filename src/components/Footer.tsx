import { forwardRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import logo from '@/assets/logo.png';

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { t } = useLanguage();

  return (
    <footer ref={ref} className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src={logo} alt="Livreur Autour de Moi" className="h-40 w-auto mb-4" />
            <p className="text-background/70 max-w-sm">
              {t('footer.description')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">{t('nav.home')}</a></li>
              <li><a href="#couriers" className="hover:text-primary transition-colors">{t('nav.couriers')}</a></li>
              <li><a href="#become" className="hover:text-primary transition-colors">{t('nav.becomeCourier')}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="/about" className="hover:text-primary transition-colors">{t('footer.about')}</a></li>
              <li><a href="/contact" className="hover:text-primary transition-colors">{t('footer.contact')}</a></li>
              <li><a href="/terms" className="hover:text-primary transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 text-center text-sm text-background/50">
          © 2026 Livreur Autour de Moi. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
