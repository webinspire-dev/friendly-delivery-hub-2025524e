import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useArticle } from '@/hooks/useArticles';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

const NewsArticle = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const { data: article, isLoading } = useArticle(id || '');
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link to="/news" className="text-muted-foreground hover:text-primary mb-8 inline-block">← {t('news.backToNews')}</Link>
          {isLoading ? <><Skeleton className="h-12 w-3/4 mb-4" /><Skeleton className="h-64 w-full" /></>
           : !article ? <p>{t('news.articleNotFound')}</p>
           : <>
            <h1 className="text-3xl font-bold mb-4">{language === 'ar' && article.title_ar ? article.title_ar : article.title}</h1>
            {article.image_url && <img src={article.image_url} alt={article.title} className="w-full rounded-xl mb-8" />}
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: language === 'ar' && article.content_ar ? article.content_ar : article.content }} />
          </>}
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default NewsArticle;
