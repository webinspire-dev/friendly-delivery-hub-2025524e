import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CouriersSection from '@/components/CouriersSection';
import MobileAppSection from '@/components/MobileAppSection';
import BecomeSection from '@/components/BecomeSection';
import Footer from '@/components/Footer';
import LanguagePopup from '@/components/LanguagePopup';
import SEO from '@/components/SEO';
import WebsiteJsonLd from '@/components/WebsiteJsonLd';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <SEO
          title="Livreur Autour de Moi - Trouvez un livreur près de chez vous"
          description="La plateforme de mise en relation entre clients et livreurs locaux au Maroc. Rapide, local et fiable. Trouvez un livreur disponible dans votre ville."
          url="https://livereur.lovable.app"
        />
        <WebsiteJsonLd />
        <LanguagePopup />
        <Header />
        <main>
          <HeroSection />
          <CouriersSection />
          <MobileAppSection />
          <BecomeSection />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
