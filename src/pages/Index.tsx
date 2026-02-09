import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CouriersSection from '@/components/CouriersSection';
import MobileAppSection from '@/components/MobileAppSection';
import BecomeSection from '@/components/BecomeSection';
import Footer from '@/components/Footer';
import LanguagePopup from '@/components/LanguagePopup';
import SEO from '@/components/SEO';
import WebsiteJsonLd from '@/components/WebsiteJsonLd';
import FAQJsonLd from '@/components/FAQJsonLd';
import { useLanguage } from '@/contexts/LanguageContext';

const SITE_URL = 'https://livreurautourdemoi.ma';

const homeFaqsFr = [
  { question: 'Comment fonctionne Livreur Autour de Moi ?', answer: 'Notre plateforme vous permet de trouver des livreurs indépendants dans votre ville au Maroc. Recherchez par ville ou utilisez votre position GPS pour trouver les livreurs les plus proches.' },
  { question: 'Le service est-il gratuit ?', answer: 'Oui, la recherche de livreurs est entièrement gratuite. Les tarifs de livraison sont négociés directement avec le livreur de votre choix.' },
  { question: 'Comment devenir livreur ?', answer: 'Inscrivez-vous gratuitement sur notre plateforme en quelques minutes. Renseignez votre ville, votre véhicule et commencez à recevoir des demandes de livraison.' },
  { question: 'Dans quelles villes êtes-vous disponibles ?', answer: 'Nous sommes présents dans plus de 20 villes au Maroc : Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir, Meknès, Oujda, Kénitra, Tétouan et bien d\'autres.' },
];

const homeFaqsAr = [
  { question: 'كيفاش كتخدم Livreur Autour de Moi؟', answer: 'البلاطفورم ديالنا كتمكنك تلقا ليفرورات مستقلين فالمدينة ديالك فالمغرب. قلّب حسب المدينة ولا استعمل GPS باش تلقا الأقرب ليك.' },
  { question: 'واش الخدمة مجانية؟', answer: 'أيه، البحث على الليفرورات مجاني تماما. الأثمنة كتفاوض مباشرة مع الليفرور.' },
  { question: 'كيفاش نولي ليفرور؟', answer: 'سجّل مجانا فالبلاطفورم ديالنا فدقائق. دخل المدينة ديالك، الڤيكول ديالك وبدا تستقبل طلبات التوصيل.' },
  { question: 'فشمن مدن أنتوما موجودين؟', answer: 'حنا موجودين فأكثر من 20 مدينة فالمغرب: كازا، الرباط، مراكش، طنجة، فاس، أكادير، مكناس، وجدة، القنيطرة، تطوان وبزاف أكثر.' },
];

const Index = () => {
  const { language } = useLanguage();
  const faqs = language === 'ar' ? homeFaqsAr : homeFaqsFr;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={language === 'ar'
          ? 'Livreur Autour de Moi - لقا ليفرور قريب منك فالمغرب'
          : 'Livreur Autour de Moi - Trouvez un livreur près de chez vous au Maroc'}
        description={language === 'ar'
          ? 'أول بلاطفورم مغربية كتربط بين الكليان والليفرورات المستقلين. +500 ليفرور فأكثر من 20 مدينة.'
          : 'Première plateforme marocaine de mise en relation entre clients et livreurs indépendants. +500 livreurs dans 20+ villes du Maroc.'}
        url={SITE_URL}
        canonical={SITE_URL}
      />
      <WebsiteJsonLd />
      <FAQJsonLd faqs={faqs} />
      <LanguagePopup />
      <Header />
      <main>
        <HeroSection />
        <CouriersSection />
        <BecomeSection />
        <MobileAppSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
