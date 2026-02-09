import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCities } from '@/contexts/CitiesContext';
import { useCouriers } from '@/hooks/useCouriers';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourierCard from '@/components/CourierCard';
import SEO from '@/components/SEO';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import CityJsonLd from '@/components/CityJsonLd';
import FAQJsonLd from '@/components/FAQJsonLd';
import { MapPin, Users, Star, Bike, Car, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

const SITE_URL = 'https://livreurautourdemoi.ma';

const CityLanding = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();
  const { t, language, direction } = useLanguage();
  const { activeCities, getCityDisplayName, isLoading: citiesLoading } = useCities();

  const city = activeCities.find(c => c.name === citySlug);
  const cityDisplayName = citySlug ? getCityDisplayName(citySlug) : '';

  const { couriers, isLoading: couriersLoading } = useCouriers({
    city: citySlug,
  });

  const availableCouriers = useMemo(() => couriers.filter(c => c.is_available), [couriers]);
  const otherCities = useMemo(() => activeCities.filter(c => c.name !== citySlug).slice(0, 6), [activeCities, citySlug]);

  const faqs = useMemo(() => {
    if (language === 'ar') {
      return [
        { question: `كيفاش نلقى ليفرور فـ ${cityDisplayName}؟`, answer: `استعمل البلاطفورم ديال Livreur Autour de Moi باش تلقا ليفرورات موجودين فـ ${cityDisplayName}. قلّب حسب نوع الڤيكول والتوفر.` },
        { question: `شحال ديال الليفرورات كاينين فـ ${cityDisplayName}؟`, answer: `كاينين ${couriers.length} ليفرور مسجل فـ ${cityDisplayName}، منهم ${availableCouriers.length} موجودين دابا.` },
        { question: 'واش الخدمة مجانية؟', answer: 'أيه، البلاطفورم مجانية. الأسعار كتفاوض مباشرة مع الليفرور.' },
      ];
    }
    return [
      { question: `Comment trouver un livreur à ${cityDisplayName} ?`, answer: `Utilisez la plateforme Livreur Autour de Moi pour trouver des livreurs disponibles à ${cityDisplayName}. Filtrez par type de véhicule et disponibilité.` },
      { question: `Combien de livreurs sont disponibles à ${cityDisplayName} ?`, answer: `Il y a ${couriers.length} livreurs inscrits à ${cityDisplayName}, dont ${availableCouriers.length} sont disponibles actuellement.` },
      { question: 'Le service est-il gratuit ?', answer: 'Oui, la plateforme est gratuite. Les tarifs sont négociés directement avec le livreur.' },
    ];
  }, [cityDisplayName, couriers.length, availableCouriers.length, language]);

  if (!citiesLoading && !city) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">{language === 'ar' ? 'المدينة ماكايناش' : 'Ville non trouvée'}</h1>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' ? 'هاد المدينة ماكايناش فالبلاطفورم ديالنا.' : 'Cette ville n\'est pas disponible sur notre plateforme.'}
            </p>
            <Button onClick={() => navigate('/')}>
              {language === 'ar' ? 'رجع للرئيسية' : 'Retour à l\'accueil'}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const seoTitle = language === 'ar'
    ? `ليفرورات فـ ${cityDisplayName} - لقا كورسي قريب منك | Livreur Autour de Moi`
    : `Livreurs à ${cityDisplayName} - Trouvez un coursier près de chez vous | Livreur Autour de Moi`;

  const seoDescription = language === 'ar'
    ? `لقا ${couriers.length}+ ليفرور فـ ${cityDisplayName}، المغرب. كورسيات موجودين دابا للتوصيل السريع والموثوق.`
    : `Trouvez ${couriers.length}+ livreurs à ${cityDisplayName}, Maroc. Coursiers disponibles pour une livraison rapide et fiable.`;

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <SEO
        title={seoTitle}
        description={seoDescription}
        url={`${SITE_URL}/livreurs/${citySlug}`}
        canonical={`${SITE_URL}/livreurs/${citySlug}`}
      />
      <BreadcrumbJsonLd items={[
        { name: language === 'ar' ? 'الرئيسية' : 'Accueil', path: '/' },
        { name: language === 'ar' ? 'الليفرورات' : 'Livreurs', path: '/livreurs' },
        { name: cityDisplayName, path: `/livreurs/${citySlug}` },
      ]} />
      <CityJsonLd cityName={cityDisplayName} citySlug={citySlug || ''} courierCount={couriers.length} />
      <FAQJsonLd faqs={faqs} />

      <Header />

      <main className="pt-20 pb-16">
        {/* Hero section for city */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 border-b border-border">
          <div className="container mx-auto px-4 py-12 md:py-16">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors mb-6 inline-flex items-center gap-2 text-sm">
              ← {language === 'ar' ? 'رجع للرئيسية' : 'Retour à l\'accueil'}
            </Link>

            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                  {language === 'ar'
                    ? `ليفرورات فـ ${cityDisplayName}`
                    : `Livreurs à ${cityDisplayName}`}
                </h1>
              </div>

              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                {language === 'ar'
                  ? `لقا أحسن الليفرورات والكورسيات فـ ${cityDisplayName}. خدمة توصيل سريعة وموثوقة فأي وقت.`
                  : `Trouvez les meilleurs livreurs et coursiers à ${cityDisplayName}. Service de livraison rapide et fiable, disponible à tout moment.`}
              </p>

              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-semibold">{couriersLoading ? '...' : couriers.length}</span>
                  <span className="text-muted-foreground">{language === 'ar' ? 'ليفرور مسجل' : 'livreurs inscrits'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent" />
                  <span className="text-foreground font-semibold">{couriersLoading ? '...' : availableCouriers.length}</span>
                  <span className="text-muted-foreground">{language === 'ar' ? 'موجودين دابا' : 'disponibles maintenant'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Courier listings */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {language === 'ar'
              ? `الليفرورات الموجودين فـ ${cityDisplayName}`
              : `Livreurs disponibles à ${cityDisplayName}`}
          </h2>

          {couriersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : couriers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {couriers.map((courier) => (
                <CourierCard
                  key={courier.id}
                  id={courier.id}
                  name={courier.full_name}
                  city={courier.city || ''}
                  vehicleType={(courier.vehicle_type as 'moto' | 'velo' | 'voiture') || 'moto'}
                  rating={courier.rating}
                  deliveries={courier.total_deliveries}
                  isAvailable={courier.is_available}
                  isVerified={courier.is_verified}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-secondary/20 rounded-2xl">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {language === 'ar' ? 'ماكاين حتا ليفرور دابا' : 'Aucun livreur pour le moment'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === 'ar'
                  ? `ماكاين حتا ليفرور مسجل فـ ${cityDisplayName}. كون أول واحد!`
                  : `Aucun livreur n'est encore inscrit à ${cityDisplayName}. Soyez le premier !`}
              </p>
              <Button onClick={() => navigate('/courier/register')}>
                {language === 'ar' ? 'سجّل كليفرور' : 'S\'inscrire comme livreur'}
              </Button>
            </div>
          )}
        </section>

        {/* City description - unique SEO content */}
        <section className="bg-secondary/20 border-y border-border">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {language === 'ar'
                ? `خدمة التوصيل فـ ${cityDisplayName}`
                : `Service de livraison à ${cityDisplayName}`}
            </h2>
            <div className="prose max-w-none text-muted-foreground">
              {language === 'ar' ? (
                <p>
                  {cityDisplayName} هي وحدة من أهم المدن فالمغرب. Livreur Autour de Moi كتوفر ليك منصة سهلة باش تلقا ليفرورات وكورسيات موثوقين فـ {cityDisplayName}. سواء بغيتي توصيل طلبية، ولا ترسل كولي، ولا أي خدمة توصيل أخرى، الليفرورات ديالنا موجودين ليك. كل الليفرورات مراجعين ومقيمين من طرف الكليان باش نضمنو ليك خدمة فالمستوى.
                </p>
              ) : (
                <p>
                  {cityDisplayName} est l'une des villes les plus dynamiques du Maroc. Livreur Autour de Moi vous offre une plateforme simple et efficace pour trouver des livreurs et coursiers de confiance à {cityDisplayName}. Que vous ayez besoin de faire livrer une commande, d'envoyer un colis ou de tout autre service de coursier, nos livreurs sont disponibles pour vous. Tous les livreurs sont vérifiés et évalués par les clients pour vous garantir un service de qualité.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {language === 'ar' ? 'أسئلة متكررة' : 'Questions fréquentes'}
          </h2>
          <div className="space-y-4 max-w-3xl">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other cities links - internal linking for SEO */}
        <section className="bg-secondary/10 border-t border-border">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {language === 'ar' ? 'ليفرورات فمدن أخرى' : 'Livreurs dans d\'autres villes'}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {otherCities.map((c) => (
                <Link
                  key={c.id}
                  to={`/livreurs/${c.name}`}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">
                      {language === 'ar'
                        ? `ليفرورات فـ ${getCityDisplayName(c.name)}`
                        : `Livreurs à ${getCityDisplayName(c.name)}`}
                    </span>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ${direction === 'rtl' ? 'rotate-180' : ''}`} />
                </Link>
              ))}
            </div>

            {activeCities.length > 7 && (
              <div className="mt-8 text-center">
                <Link to="/" className="text-primary hover:underline font-medium">
                  {language === 'ar' ? 'شوف جميع المدن' : 'Voir toutes les villes'} →
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CityLanding;
