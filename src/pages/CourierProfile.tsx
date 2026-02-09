import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCities } from '@/contexts/CitiesContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  MapPin, Star, CheckCircle, Bike, Car, ArrowLeft, Phone,
  MessageCircle, Clock, Calendar, Shield, Award, Navigation,
  Package, TrendingUp, ThumbsUp, Loader2, MapPinOff, UserCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from '@/hooks/useAnalytics';
import DisclaimerDialog from '@/components/DisclaimerDialog';
import ClaimProfileDialog from '@/components/courier/ClaimProfileDialog';

interface CourierProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  city: string | null;
  vehicle_type: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_available: boolean;
  is_verified: boolean;
  is_claimed: boolean;
  total_deliveries: number;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

const vehicleIcons: Record<string, typeof Bike> = {
  moto: Bike,
  velo: Bike,
  voiture: Car,
};

const vehicleLabels: Record<string, { fr: string; ar: string }> = {
  moto: { fr: 'Moto', ar: 'دراجة نارية' },
  velo: { fr: 'Vélo', ar: 'دراجة هوائية' },
  voiture: { fr: 'Voiture', ar: 'سيارة' },
};

const CourierProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, direction, language } = useLanguage();
  const { getCityDisplayName } = useCities();
  const { trackProfileView, trackWhatsAppClick, trackCallClick } = useAnalytics();
  const hasTrackedView = useRef(false);

  const [courier, setCourier] = useState<CourierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'whatsapp' | 'call' | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourier();
      if (!hasTrackedView.current) {
        trackProfileView(id);
        hasTrackedView.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCourier = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('courier_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching courier:', error);
        return;
      }

      if (data) {
        if (data.is_blocked) {
          setCourier(null);
          return;
        }
        setCourier({
          ...data,
          is_available: data.is_available ?? false,
          is_verified: data.is_verified ?? false,
          is_claimed: data.is_claimed ?? false,
          total_deliveries: data.total_deliveries ?? 0,
          rating: data.rating ?? 5.0,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={direction}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!courier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir={direction}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('profile.notFound')}</h1>
          <Button onClick={() => navigate('/')}>{t('search.backToHome')}</Button>
        </div>
      </div>
    );
  }

  const VehicleIcon = vehicleIcons[courier.vehicle_type || 'moto'] || Bike;
  const joinedDate = new Date(courier.created_at);
  const memberSince = joinedDate.toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
    year: 'numeric',
    month: 'long'
  });

  const whatsappNumber = courier.phone.replace(/[\s\-\(\)]/g, '').replace(/^0/, '+212');

  const handleWhatsAppClick = () => {
    setPendingAction('whatsapp');
    setDisclaimerOpen(true);
  };

  const handleCallClick = () => {
    setPendingAction('call');
    setDisclaimerOpen(true);
  };

  const handleConfirmContact = () => {
    if (pendingAction === 'whatsapp') {
      trackWhatsAppClick(courier.id);
      const message = encodeURIComponent(
        language === 'ar'
          ? `مرحباً ${courier.full_name}، أريد طلب خدمة توصيل.`
          : `Bonjour ${courier.full_name}, je souhaite demander une livraison.`
      );
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    } else if (pendingAction === 'call') {
      trackCallClick(courier.id);
      window.open(`tel:${courier.phone}`, '_self');
    }
    setPendingAction(null);
  };

  const zones = courier.city ? [getCityDisplayName(courier.city)] : [];

  return (
    <div className="min-h-screen bg-background" dir={direction}>
      <Header />
      <main className="pt-20 pb-16">
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/20">
          <div className="container mx-auto px-4 py-8">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(-1); }} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className={`w-4 h-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
              <span>{t('profile.back')}</span>
            </button>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden shadow-lg">
                  {courier.avatar_url ? (
                    <img src={courier.avatar_url} alt={courier.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-bold text-primary">{courier.full_name.charAt(0)}</span>
                  )}
                </div>
                {courier.is_verified && (
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <CheckCircle className="w-6 h-6 text-primary-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{courier.full_name}</h1>
                  {courier.is_verified && (
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      {t('profile.verified')}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${courier.is_available ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    {courier.is_available ? t('profile.availableNow') : t('profile.unavailable')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  {courier.city && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{getCityDisplayName(courier.city)}</span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <VehicleIcon className="w-4 h-4" />
                    {vehicleLabels[courier.vehicle_type || 'moto']?.[language === 'ar' ? 'ar' : 'fr'] || courier.vehicle_type}
                  </span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{t('profile.memberSince')} {memberSince}</span>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/10">
                      <Star className="w-5 h-5 text-accent fill-accent" />
                      <span className="text-lg font-bold text-foreground">{courier.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{courier.total_deliveries}</span> {t('profile.deliveries')}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Button size="lg" className="gap-2" onClick={handleWhatsAppClick} disabled={!courier.is_available}>
                  <MessageCircle className="w-5 h-5" />WhatsApp
                </Button>
                <Button size="lg" variant="secondary" className="gap-2" onClick={handleCallClick} disabled={!courier.is_available}>
                  <Phone className="w-5 h-5" />{t('profile.call')}
                </Button>
                {!courier.is_claimed && (
                  <Button size="lg" variant="outline" className="gap-2" onClick={() => setClaimOpen(true)}>
                    <UserCheck className="w-5 h-5" />Claim your profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />{t('profile.about')}
                </h2>
                <p className="text-muted-foreground leading-relaxed">{courier.bio || t('profile.noInfo')}</p>
              </div>

              {zones.length > 0 && (
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-primary" />{t('profile.deliveryZones')}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {zones.map((zone, index) => (
                      <span key={index} className="px-4 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium">{zone}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-primary" />{t('profile.reviews')}
                </h2>
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p>{t('profile.reviewsSoon')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">{t('profile.stats')}</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3"><Package className="w-5 h-5 text-primary" /><span className="text-muted-foreground">{t('profile.deliveries')}</span></div>
                    <span className="font-bold text-foreground">{courier.total_deliveries}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3"><Star className="w-5 h-5 text-accent" /><span className="text-muted-foreground">{t('profile.rating')}</span></div>
                    <span className="font-bold text-foreground">{courier.rating.toFixed(1)}/5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-500" /><span className="text-muted-foreground">{t('profile.status')}</span></div>
                    <span className={`font-bold ${courier.is_available ? 'text-green-500' : 'text-muted-foreground'}`}>
                      {courier.is_available ? t('courier.available') : t('courier.unavailable')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3">
                      {courier.latitude && courier.longitude ? <Navigation className="w-5 h-5 text-green-500" /> : <MapPinOff className="w-5 h-5 text-muted-foreground" />}
                      <span className="text-muted-foreground">GPS</span>
                    </div>
                    <Badge variant={courier.latitude && courier.longitude ? 'default' : 'secondary'} className={courier.latitude && courier.longitude ? 'bg-green-500 hover:bg-green-500/80' : ''}>
                      {courier.latitude && courier.longitude ? t('profile.gpsActive') : t('profile.gpsInactive')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
                <h2 className="text-lg font-semibold mb-4">{t('profile.contactNow')}</h2>
                <p className="text-primary-foreground/80 text-sm mb-4">{t('profile.freeQuote')}</p>
                <Button variant="secondary" className="w-full gap-2" onClick={handleWhatsAppClick} disabled={!courier.is_available}>
                  <MessageCircle className="w-5 h-5" />{t('profile.sendMessage')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <DisclaimerDialog
        open={disclaimerOpen}
        onOpenChange={setDisclaimerOpen}
        onConfirm={handleConfirmContact}
        contactType={pendingAction || 'whatsapp'}
      />
      <ClaimProfileDialog
        open={claimOpen}
        onOpenChange={setClaimOpen}
        courierId={courier.id}
        courierPhone={courier.phone}
        courierName={courier.full_name}
      />

      <Footer />
    </div>
  );
};

export default CourierProfilePage;
