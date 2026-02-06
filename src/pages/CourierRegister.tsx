import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
const CourierRegister = () => { const { t } = useLanguage(); return <div className="min-h-screen bg-background"><Header /><main className="pt-24 pb-16"><div className="container mx-auto px-4 max-w-md"><h1 className="text-3xl font-bold mb-4">{t('register.title')}</h1><p className="text-muted-foreground">{t('register.subtitle')}</p></div></main><Footer /></div>; };
export default CourierRegister;
