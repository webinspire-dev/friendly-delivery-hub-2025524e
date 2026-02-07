import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ChevronDown, MapPin, Bike, Car, Zap, Navigation, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface City {
  id: string;
  name: string;
  name_ar: string | null;
  is_active: boolean;
}

const HeroSection = () => {
  const { t, direction } = useLanguage();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) throw error;
        setCities(data || []);
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  const handleSearch = () => {
    if (selectedCity) {
      navigate(`/search?city=${selectedCity}`);
    }
  };

  const handleLocationSearch = () => {
    setIsLocating(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError(direction === 'rtl' ? 'المتصفح لا يدعم تحديد الموقع' : 'La géolocalisation n\'est pas supportée');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setIsLocating(false);
        navigate(`/search?lat=${latitude}&lng=${longitude}&mode=nearby`);
      },
      (error) => {
        setIsLocating(false);
        let message = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = direction === 'rtl' ? 'تم رفض إذن الموقع' : 'Permission de localisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            message = direction === 'rtl' ? 'الموقع غير متاح' : 'Position non disponible';
            break;
          case error.TIMEOUT:
            message = direction === 'rtl' ? 'انتهت مهلة طلب الموقع' : 'Délai de localisation dépassé';
            break;
          default:
            message = direction === 'rtl' ? 'خطأ في تحديد الموقع' : 'Erreur de géolocalisation';
        }
        setLocationError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className={`space-y-8 ${direction === 'rtl' ? 'lg:order-2' : ''}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Zap className="w-4 h-4" />
              <span>+500 livreurs actifs au Maroc</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              {t('hero.title')}
            </h1>

            <p className="text-xl text-muted-foreground max-w-lg">
              {t('hero.subtitle')}
            </p>

            {/* Search Options */}
            <div className="space-y-4 max-w-lg">
              {/* GPS Location Button */}
              <button
                onClick={handleLocationSearch}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-colors font-semibold disabled:opacity-70"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{direction === 'rtl' ? 'جاري تحديد موقعك...' : 'Localisation en cours...'}</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    <span>{direction === 'rtl' ? 'استخدم موقعي الحالي' : 'Utiliser ma position actuelle'}</span>
                  </>
                )}
              </button>

              {locationError && (
                <p className="text-sm text-destructive text-center">{locationError}</p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">{direction === 'rtl' ? 'أو' : 'ou'}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* City Selector */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className={selectedCity ? 'text-foreground' : 'text-muted-foreground'}>
                        {selectedCity
                          ? (direction === 'rtl'
                              ? cities.find(c => c.name === selectedCity)?.name_ar || selectedCity.replace(/_/g, ' ')
                              : selectedCity.replace(/_/g, ' '))
                          : t('hero.selectCity')}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20 max-h-60 overflow-y-auto">
                      {isLoadingCities ? (
                        <div className="px-5 py-3 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : cities.length === 0 ? (
                        <div className="px-5 py-3 text-muted-foreground text-center">
                          {direction === 'rtl' ? 'لا توجد مدن متاحة' : 'Aucune ville disponible'}
                        </div>
                      ) : (
                        cities.map((city) => (
                          <button
                            key={city.id}
                            onClick={() => {
                              setSelectedCity(city.name);
                              setDropdownOpen(false);
                            }}
                            className="w-full px-5 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3 capitalize"
                          >
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {direction === 'rtl'
                              ? city.name_ar || city.name.replace(/_/g, ' ')
                              : city.name.replace(/_/g, ' ')}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <Button
                  size="lg"
                  className="px-8 py-4 h-auto text-base font-semibold"
                  onClick={handleSearch}
                  disabled={!selectedCity}
                >
                  {t('hero.cta')}
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-foreground">5+</div>
                <div className="text-sm text-muted-foreground">Villes</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Livreurs</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="text-2xl font-bold text-foreground">10K+</div>
                <div className="text-sm text-muted-foreground">Livraisons</div>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className={`relative ${direction === 'rtl' ? 'lg:order-1' : ''}`}>
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main Circle */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse" />

              {/* Map-like visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-3/4 h-3/4">
                  {/* Center point */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <MapPin className="w-8 h-8 text-primary-foreground" />
                  </div>

                  {/* Orbiting courier icons */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-md flex items-center justify-center">
                      <Bike className="w-6 h-6 text-accent" />
                    </div>
                  </div>

                  <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-md flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-1/4 translate-y-1/2">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-md flex items-center justify-center">
                      <Bike className="w-6 h-6 text-accent" />
                    </div>
                  </div>

                  <div className="absolute top-1/4 left-0 -translate-x-1/2">
                    <div className="w-12 h-12 rounded-xl bg-card border border-border shadow-md flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                  </div>

                  {/* Connection lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" strokeDasharray="4 4" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" strokeDasharray="2 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
