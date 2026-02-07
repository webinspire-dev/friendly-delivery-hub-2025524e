import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourierCard from '@/components/CourierCard';
import { Button } from '@/components/ui/button';
import { MapPin, SlidersHorizontal, ArrowLeft, Bike, Car, Search, Navigation, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCouriers } from '@/hooks/useCouriers';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, direction } = useLanguage();
  const { isAdmin, authChecked } = useAdminAuth();

  const city = searchParams.get('city') || '';
  const userLat = parseFloat(searchParams.get('lat') || '0');
  const userLng = parseFloat(searchParams.get('lng') || '0');
  const isNearbyMode = searchParams.get('mode') === 'nearby';

  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(50);

  const { couriers, isLoading } = useCouriers({
    city: isNearbyMode ? undefined : city,
    vehicleType: vehicleFilter,
    availableOnly,
    verifiedOnly,
    userLat: isNearbyMode ? userLat : undefined,
    userLng: isNearbyMode ? userLng : undefined,
    maxDistance: isNearbyMode ? maxDistance : undefined,
    isAdmin: authChecked ? isAdmin : undefined,
  });

  const availableCouriers = useMemo(() => couriers.filter(c => c.is_available), [couriers]);

  const { nearbyCouriers, otherCouriers } = useMemo(() => {
    if (!isNearbyMode) return { nearbyCouriers: [], otherCouriers: couriers };
    const nearby = couriers.filter(c => c.distance !== null && c.distance < 1);
    const others = couriers.filter(c => c.distance === null || c.distance >= 1);
    return { nearbyCouriers: nearby, otherCouriers: others };
  }, [couriers, isNearbyMode]);

  const resetFilters = () => {
    setVehicleFilter('all');
    setAvailableOnly(false);
    setVerifiedOnly(false);
    setMaxDistance(100);
  };

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <Header />
      <main className="pt-20 pb-16">
        <div className="bg-gradient-to-br from-primary/5 via-background to-secondary/20 border-b border-border">
          <div className="container mx-auto px-4 py-8">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className={`w-4 h-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
              <span>{t('search.backToHome')}</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {isNearbyMode ? <Navigation className="w-5 h-5 text-primary" /> : <MapPin className="w-5 h-5 text-primary" />}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {isNearbyMode ? t('search.nearbyTitle') : `${t('search.cityTitle')} ${t(`cities.${city}`)}`}
                  </h1>
                </div>
                <p className="text-muted-foreground">
                  {isLoading ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />{t('search.loading')}</span>
                  ) : (
                    <>{availableCouriers.length} {t('search.available')} • {couriers.length} {t('search.total')}</>
                  )}
                </p>
              </div>
              {!isLoading && (
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded-xl bg-green-500/10 text-green-600 text-sm font-medium">
                    {availableCouriers.length} {t('search.availableNow')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-border bg-card/50 sticky top-16 z-40 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SlidersHorizontal className="w-4 h-4" /><span>{t('search.filter')}</span>
              </div>

              {isNearbyMode && (
                <>
                  <select value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium border-0 focus:ring-2 focus:ring-primary">
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                    <option value={100}>100 km</option>
                  </select>
                  <div className="w-px h-6 bg-border hidden sm:block" />
                </>
              )}

              <div className="flex items-center gap-2">
                {['all', 'moto', 'voiture', 'velo'].map((type) => (
                  <button key={type} onClick={() => setVehicleFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${vehicleFilter === type ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}>
                    {type !== 'all' && (type === 'voiture' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />)}
                    {type === 'all' ? t('search.all') : t(`vehicle.${type}`)}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-border hidden sm:block" />

              <button onClick={() => setAvailableOnly(!availableOnly)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${availableOnly ? 'bg-green-500/10 text-green-600 border border-green-500/30' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}>
                {t('search.availableOnly')}
              </button>
              <button onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${verifiedOnly ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}>
                {t('search.verifiedOnly')}
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {isLoading && (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          )}

          {!isLoading && isNearbyMode && nearbyCouriers.length > 0 && (
            <>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><Navigation className="w-4 h-4 text-green-600" /></div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{t('search.veryClose')}</h2>
                    <p className="text-sm text-muted-foreground">{t('search.lessThan1km')}</p>
                  </div>
                  <span className="ml-auto px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium">
                    {nearbyCouriers.length} {direction === 'rtl' ? 'ليفرور' : 'livreur(s)'}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nearbyCouriers.map((courier) => (
                    <div key={courier.id} className="relative ring-2 ring-green-500/30 rounded-2xl">
                      <CourierCard id={courier.id} name={courier.full_name} city={courier.city || ''} vehicleType={(courier.vehicle_type as 'moto' | 'velo' | 'voiture') || 'moto'} rating={courier.rating} deliveries={courier.total_deliveries} isAvailable={courier.is_available} isVerified={courier.is_verified} />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
                        <Navigation className="w-3 h-3" />{Math.round(courier.distance! * 1000)} m
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {otherCouriers.length > 0 && (
                <div className="border-t border-border pt-6 mt-8">
                  <h2 className="text-lg font-semibold text-foreground mb-4">{t('search.otherCouriers')}</h2>
                </div>
              )}
            </>
          )}

          {!isLoading && (isNearbyMode ? otherCouriers : couriers).length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(isNearbyMode ? otherCouriers : couriers).map((courier) => (
                <div key={courier.id} className="relative">
                  <CourierCard id={courier.id} name={courier.full_name} city={courier.city || ''} vehicleType={(courier.vehicle_type as 'moto' | 'velo' | 'voiture') || 'moto'} rating={courier.rating} deliveries={courier.total_deliveries} isAvailable={courier.is_available} isVerified={courier.is_verified} />
                  {isNearbyMode && courier.distance !== null && (
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold flex items-center gap-1.5 shadow-md">
                      <Navigation className="w-3 h-3" />
                      {courier.distance < 1 ? `${Math.round(courier.distance * 1000)} m` : `${courier.distance.toFixed(1)} km`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!isLoading && couriers.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6"><Search className="w-10 h-10 text-muted-foreground" /></div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t('search.noCouriers')}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{isNearbyMode ? t('search.tryIncreaseRadius') : t('search.tryModifyFilters')}</p>
              <Button onClick={resetFilters}>{t('search.resetFilters')}</Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchResults;
