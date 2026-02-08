import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/courier/login');
  };

  const handleLanguageToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  const handleMobileMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <img src={logo} alt="Livreur Autour de Moi" className="h-28 sm:h-32 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/news"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {t('news.title')}
            </Link>
            <a
              href="/#couriers"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {t('nav.couriers')}
            </a>
            <a
              href="/#become"
              className="text-muted-foreground hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {t('nav.becomeCourier')}
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLanguageToggle}
              className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              {language === 'fr' ? 'العربية' : 'FR'}
            </button>

            <Button
              variant="default"
              size="sm"
              className="hidden sm:flex"
              onClick={handleLoginClick}
            >
              {t('nav.login')}
            </Button>

            <button
              onClick={handleMobileMenuToggle}
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                }}
              >
                {t('nav.home')}
              </Link>
            <Link
              to="/news"
              className="text-muted-foreground hover:text-primary transition-colors py-2"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(false);
              }}
            >
              {t('news.title')}
            </Link>
              <a
                href="/#couriers"
                className="text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                }}
              >
                {t('nav.couriers')}
              </a>
              <a
                href="/#become"
                className="text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                }}
              >
                {t('nav.becomeCourier')}
              </a>
              <Button
                variant="default"
                size="sm"
                className="w-full mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                  navigate('/courier/login');
                }}
              >
                {t('nav.login')}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
