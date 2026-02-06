import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
const CourierDashboard = () => { const { t } = useLanguage(); return <div className="min-h-screen bg-background"><Header /><main className="pt-24 pb-16"><div className="container mx-auto px-4"><h1 className="text-3xl font-bold">{t('dashboard.welcome')}</h1></div></main></div>; };
export default CourierDashboard;
