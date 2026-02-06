import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Livreur ADM</h3>
            <p className="text-background/70 max-w-sm">{t('footer.description')}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t('footer.navigation')}</h4>
            <ul className="space-y-2 text-background/70">
              <li><a href="#" className="hover:text-primary transition-colors">{t('nav.home')}</a></li>
              <li><a href="#couriers" className="hover:text-primary transition-colors">{t('nav.couriers')}</a></li>
              <li><a href="#become" className="hover:text-primary transition-colors">{t('nav.becomeCourier')}</a></li>
            </ul>
          </div>
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
};

export default Footer;
