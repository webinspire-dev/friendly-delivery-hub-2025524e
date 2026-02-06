import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
const About = () => { const { language } = useLanguage(); const isAr = language === 'ar';
  return <div className="min-h-screen bg-background"><Header /><main className="pt-24 pb-16"><div className="container mx-auto px-4 max-w-4xl">
    <Link to="/" className="text-muted-foreground hover:text-primary mb-8 inline-block">← {isAr ? 'العودة' : 'Retour'}</Link>
    <h1 className="text-3xl font-bold mb-4">{isAr ? 'من نحن' : 'À propos'}</h1>
    <p className="text-muted-foreground mb-8">{isAr ? 'منصة Livreur Autour de Moi تربط بين العملاء وعمال التوصيل المحليين في المغرب' : 'Livreur Autour de Moi connecte les clients aux livreurs locaux au Maroc'}</p>
  </div></main><Footer /></div>;
};
export default About;
