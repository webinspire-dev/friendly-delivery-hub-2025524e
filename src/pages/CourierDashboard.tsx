import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCities } from '@/contexts/CitiesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MapPin, LogOut, User, Phone, Star, Package, Clock, Settings, Loader2, Save, CheckCircle, Navigation, Ban, KeyRound } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';
import { useToast } from '@/hooks/use-toast';
import BlacklistManager from '@/components/courier/BlacklistManager';
import LocationPromptDialog from '@/components/LocationPromptDialog';
import ChangePasswordDialog from '@/components/courier/ChangePasswordDialog';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface CourierProfile { id: string; user_id: string; full_name: string; phone: string; city: string | null; vehicle_type: string | null; bio: string | null; is_available: boolean; is_verified: boolean; total_deliveries: number; rating: number; latitude: number | null; longitude: number | null; }

const CourierDashboard = () => {
  const { t, direction, language, setLanguage } = useLanguage();
  const { activeCities, getCityDisplayName } = useCities();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CourierProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isDisablingLocation, setIsDisablingLocation] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', city: '', vehicle_type: 'moto', bio: '' });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session); setUser(session?.user ?? null);
      if (!session) navigate('/courier/login');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setUser(session?.user ?? null);
      if (!session) navigate('/courier/login');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => { if (user && session) fetchProfile(); }, [user, session]);

  const fetchProfile = async () => {
    if (!user || !session) return;
    try {
      const { data, error } = await supabase.from('courier_profiles').select('*').eq('user_id', user.id).maybeSingle();
      if (error) { console.error('Error fetching profile:', error); setIsLoading(false); return; }
      if (data) {
        setProfile(data); setIsAvailable(data.is_available ?? false);
        setFormData({ full_name: data.full_name || '', phone: data.phone || '', city: data.city || '', vehicle_type: data.vehicle_type || 'moto', bio: data.bio || '' });
        setIsLoading(false);
        if (!data.latitude || !data.longitude) setTimeout(() => setShowLocationPrompt(true), 500);
      } else {
        const metadata = user.user_metadata;
        const newProfile = { user_id: user.id, full_name: metadata?.full_name || user.email?.split('@')[0] || 'Livreur', phone: metadata?.phone || '', city: metadata?.city || null, vehicle_type: metadata?.vehicle_type || 'moto' };
        const { data: createdProfile, error: createError } = await supabase.from('courier_profiles').upsert(newProfile, { onConflict: 'user_id' }).select().single();
        if (createError) { console.error('Error creating profile:', createError); toast({ title: t('dashboard.error'), description: t('dashboard.updateError'), variant: 'destructive' }); }
        else if (createdProfile) {
          setProfile(createdProfile); setIsAvailable(createdProfile.is_available ?? false);
          setFormData({ full_name: createdProfile.full_name || '', phone: createdProfile.phone || '', city: createdProfile.city || '', vehicle_type: createdProfile.vehicle_type || 'moto', bio: createdProfile.bio || '' });
        }
        setIsLoading(false);
      }
    } catch (error) { console.error('Error:', error); setIsLoading(false); }
  };

  const handleAvailabilityToggle = async (checked: boolean) => {
    if (!profile || !user) return;
    setIsUpdatingAvailability(true); const previousValue = isAvailable; setIsAvailable(checked);
    try {
      const { error } = await supabase.from('courier_profiles').update({ is_available: checked }).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: checked ? t('dashboard.availableNow') : t('dashboard.unavailableNow'), description: checked ? t('dashboard.availableMessage') : t('dashboard.unavailableMessage') });
    } catch (error) { setIsAvailable(previousValue); toast({ title: t('dashboard.error'), description: t('dashboard.updateError'), variant: 'destructive' }); }
    finally { setIsUpdatingAvailability(false); }
  };

  const handleGetLocation = async () => {
    if (!user || !navigator.geolocation) { toast({ title: t('dashboard.error'), description: t('dashboard.gpsNotSupported'), variant: 'destructive' }); return; }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { error } = await supabase.from('courier_profiles').update({ latitude, longitude }).eq('user_id', user.id);
          if (error) throw error;
          setProfile(prev => prev ? { ...prev, latitude, longitude } : null);
          toast({ title: t('dashboard.locationSaved'), description: t('dashboard.locationSavedMessage') });
        } catch (error) { toast({ title: t('dashboard.error'), description: t('dashboard.updateError'), variant: 'destructive' }); }
        finally { setIsGettingLocation(false); }
      },
      () => { setIsGettingLocation(false); toast({ title: t('dashboard.error'), description: t('dashboard.gpsError'), variant: 'destructive' }); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleDisableLocation = async () => {
    if (!user) return; setIsDisablingLocation(true);
    try {
      const { error } = await supabase.from('courier_profiles').update({ latitude: null, longitude: null }).eq('user_id', user.id);
      if (error) throw error;
      setProfile(prev => prev ? { ...prev, latitude: null, longitude: null } : null);
      toast({ title: t('dashboard.locationDisabled'), description: t('dashboard.locationDisabledMessage') });
    } catch (error) { toast({ title: t('dashboard.error'), description: t('dashboard.updateError'), variant: 'destructive' }); }
    finally { setIsDisablingLocation(false); }
  };

  const handleSaveProfile = async () => {
    if (!user) return; setIsSaving(true);
    try {
      const { error } = await supabase.from('courier_profiles').update({ full_name: formData.full_name, phone: formData.phone, city: formData.city, vehicle_type: formData.vehicle_type, bio: formData.bio }).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: t('dashboard.saved'), description: t('dashboard.profileUpdated') }); fetchProfile();
    } catch (error) { toast({ title: t('dashboard.error'), description: t('dashboard.updateError'), variant: 'destructive' }); }
    finally { setIsSaving(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/'); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background" dir={direction}>
      <LocationPromptDialog open={showLocationPrompt} onOpenChange={setShowLocationPrompt} onEnableLocation={handleGetLocation} isLoading={isGettingLocation} />
      <ChangePasswordDialog open={showChangePassword} onOpenChange={setShowChangePassword} />
      <header className="bg-background/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Livreur Autour de Moi" className="h-28 sm:h-32 w-auto" />
            </Link>
            <div className="flex items-center gap-3">
              <button onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')} className="px-3 py-1.5 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">{language === 'fr' ? 'العربية' : 'FR'}</button>
              <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4" /><span className="hidden sm:inline ms-2">{t('dashboard.logout')}</span></Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{t('dashboard.welcome')}, {profile?.full_name || user?.email}!</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Package className="w-6 h-6 text-primary" /></div><div><p className="text-2xl font-bold text-foreground">{profile?.total_deliveries || 0}</p><p className="text-sm text-muted-foreground">{t('dashboard.deliveries')}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center"><Star className="w-6 h-6 text-accent" /></div><div><p className="text-2xl font-bold text-foreground">{profile?.rating?.toFixed(1) || '5.0'}</p><p className="text-sm text-muted-foreground">{t('dashboard.rating')}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isAvailable ? 'bg-green-500/10' : 'bg-red-500/10'}`}><Clock className={`w-6 h-6 ${isAvailable ? 'text-green-500' : 'text-red-500'}`} /></div><div><p className={`text-lg font-bold ${isAvailable ? 'text-green-500' : 'text-red-500'}`}>{isAvailable ? t('dashboard.available') : t('dashboard.unavailable')}</p><p className="text-sm text-muted-foreground">{t('dashboard.status')}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-4"><div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profile?.is_verified ? 'bg-primary/10' : 'bg-muted'}`}><CheckCircle className={`w-6 h-6 ${profile?.is_verified ? 'text-primary' : 'text-muted-foreground'}`} /></div><div><p className={`text-lg font-bold ${profile?.is_verified ? 'text-primary' : 'text-muted-foreground'}`}>{profile?.is_verified ? t('dashboard.verified') : t('dashboard.notVerified')}</p><p className="text-sm text-muted-foreground">{t('dashboard.account')}</p></div></CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />{t('dashboard.availability')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                <div><p className="font-medium text-foreground">{t('dashboard.availableForDelivery')}</p><p className="text-sm text-muted-foreground">{t('dashboard.availabilityDescription')}</p></div>
                <div dir="ltr"><Switch checked={isAvailable} onCheckedChange={handleAvailabilityToggle} disabled={isUpdatingAvailability} /></div>
              </div>
              <div className={`p-4 rounded-xl ${isAvailable ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                <p className={`text-sm ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>{isAvailable ? t('dashboard.visibleToClients') : t('dashboard.hiddenFromClients')}</p>
              </div>
              <div className={`p-4 rounded-xl ${profile?.latitude ? 'bg-green-500/10 border border-green-500/20' : 'bg-secondary/50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${profile?.latitude ? 'bg-green-500/20' : 'bg-muted'}`}><Navigation className={`w-5 h-5 ${profile?.latitude ? 'text-green-600' : 'text-muted-foreground'}`} /></div>
                    <div><p className="font-medium text-foreground">{t('dashboard.gps')}</p><p className={`text-sm ${profile?.latitude ? 'text-green-600' : 'text-muted-foreground'}`}>{profile?.latitude ? t('dashboard.gpsActive') : t('dashboard.gpsNotActive')}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {profile?.latitude && <Button variant="ghost" size="sm" onClick={handleDisableLocation} disabled={isDisablingLocation} className="text-red-600 hover:text-red-700 hover:bg-red-500/10">{isDisablingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : t('dashboard.disableGps')}</Button>}
                    <Button variant={profile?.latitude ? "secondary" : "outline"} size="sm" onClick={handleGetLocation} disabled={isGettingLocation}>
                      {isGettingLocation ? <><Loader2 className="w-4 h-4 animate-spin" />{t('dashboard.gettingLocation')}</> : <><MapPin className="w-4 h-4" />{profile?.latitude ? t('dashboard.updateGps') : t('dashboard.enableGps')}</>}
                    </Button>
                  </div>
                </div>
                <p className={`text-xs mt-2 ${profile?.latitude ? 'text-green-600' : 'text-muted-foreground'}`}>{profile?.latitude ? t('dashboard.gpsActiveDescription') : t('dashboard.gpsDescription')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" />{t('dashboard.profile')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="full_name">{t('dashboard.fullName')}</Label><Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} /></div>
                <div className="space-y-2"><Label htmlFor="phone">{t('dashboard.phone')}</Label><Input id="phone" name="phone" value={formData.phone} onChange={handleChange} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('dashboard.city')}</Label>
                  <select id="city" name="city" value={formData.city} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">{t('hero.selectCity')}</option>
                    {activeCities.map((city) => (
                      <option key={city.id} value={city.name}>{getCityDisplayName(city.name)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2"><Label htmlFor="vehicle_type">{t('dashboard.vehicleType')}</Label><Input id="vehicle_type" value={t(`vehicle.${formData.vehicle_type}`) || formData.vehicle_type} disabled className="bg-muted cursor-not-allowed" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="bio">{t('dashboard.bio')}</Label><textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder={t('dashboard.bioPlaceholder')} /></div>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full">
                {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />{t('dashboard.saving')}</> : <><Save className="w-4 h-4" />{t('dashboard.saveProfile')}</>}
              </Button>
              <Button variant="outline" onClick={() => setShowChangePassword(true)} className="w-full">
                <KeyRound className="w-4 h-4" />{t('dashboard.changePassword')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {profile && <div className="mt-6"><BlacklistManager courierId={profile.id} /></div>}
      </main>
    </div>
  );
};

export default CourierDashboard;
