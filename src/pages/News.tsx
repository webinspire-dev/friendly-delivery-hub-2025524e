import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useArticles } from '@/hooks/useArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const News = () => {
  const { t, language } = useLanguage();
  const { data: articles, isLoading } = useArticles(true);
  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${t('news.title')} - Livreur ADM`} description={t('news.subtitle')} />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-muted-foreground hover:text-primary mb-8 inline-block">← {t('news.backToHome')}</Link>
          <h1 className="text-3xl font-bold mb-2">{t('news.title')}</h1>
          <p className="text-muted-foreground mb-8">{t('news.subtitle')}</p>
          {isLoading ? <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>
           : !articles?.length ? <p className="text-muted-foreground">{t('news.noArticles')}</p>
           : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{articles.map(a => (
            <Link key={a.id} to={`/news/${a.id}`} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-foreground mb-2">{language === 'ar' && a.title_ar ? a.title_ar : a.title}</h3>
              <p className="text-sm text-muted-foreground">{language === 'ar' && a.excerpt_ar ? a.excerpt_ar : a.excerpt}</p>
            </Link>
          ))}</div>}
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default News;
