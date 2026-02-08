import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCities } from '@/contexts/CitiesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const CourierRegister = () => {
  const { t, direction, language } = useLanguage();
  const { activeCities, getCityDisplayName } = useCities();

  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', city: '', vehicleType: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerSchema = z.object({
    fullName: z.string().min(2, t('register.error.nameTooShort')).max(100),
    email: z.string().email(t('register.error.invalidEmail')),
    phone: z.string().min(10, t('register.error.invalidPhone')).max(15),
    city: z.string().min(1, t('register.error.cityRequired')),
    vehicleType: z.string().min(1, t('register.error.vehicleRequired')),
    password: z.string().min(6, t('register.error.passwordTooShort')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, { message: t('register.error.passwordMismatch'), path: ['confirmPassword'] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => { if (error.path[0]) fieldErrors[error.path[0] as string] = error.message; });
      setErrors(fieldErrors);
      return;
    }
    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email, password: formData.password,
        options: { emailRedirectTo: redirectUrl, data: { full_name: formData.fullName, phone: formData.phone, city: formData.city, vehicle_type: formData.vehicleType } }
      });
      if (authError) {
        if (authError.message.includes('already registered')) { setErrors({ email: t('register.error.emailExists') }); }
        else { toast({ title: t('register.error.title'), description: authError.message, variant: 'destructive' }); }
        setIsLoading(false);
        return;
      }
      if (authData.user) {
        toast({ title: t('register.success.title'), description: t('register.success.message') });
        navigate('/courier/login');
      }
    } catch (error) {
      toast({ title: t('register.error.title'), description: t('register.error.generic'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4" dir={direction}>
      <Link to="/" className="fixed top-4 left-4 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors z-10"><ArrowLeft className="w-5 h-5" /></Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center"><div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center"><MapPin className="w-7 h-7 text-primary-foreground" /></div></div>
          <div><CardTitle className="text-2xl">{t('register.title')}</CardTitle><CardDescription className="mt-2">{t('register.subtitle')}</CardDescription></div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('register.fullName')}</Label>
              <Input id="fullName" name="fullName" type="text" placeholder={t('register.fullNamePlaceholder')} value={formData.fullName} onChange={handleChange} className={errors.fullName ? 'border-destructive' : ''} />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('register.email')}</Label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id="email" name="email" type="email" placeholder={t('register.emailPlaceholder')} value={formData.email} onChange={handleChange} className={`pl-10 ${errors.email ? 'border-destructive' : ''}`} /></div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('register.phone')}</Label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id="phone" name="phone" type="tel" placeholder={t('register.phonePlaceholder')} value={formData.phone} onChange={handleChange} className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`} /></div>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t('register.city')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select id="city" name="city" value={formData.city} onChange={handleChange} className={`flex h-10 w-full rounded-md border bg-background pl-10 pr-3 py-2 text-sm ${errors.city ? 'border-destructive' : 'border-input'}`}>
                  <option value="">{t('register.selectCity')}</option>
                  {activeCities.map((city) => (<option key={city.id} value={city.name}>{getCityDisplayName(city.name)}</option>))}
                </select>
              </div>
              {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleType">{t('register.vehicleType')}</Label>
              <select id="vehicleType" name="vehicleType" value={formData.vehicleType} onChange={handleChange} className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ${errors.vehicleType ? 'border-destructive' : 'border-input'}`}>
                <option value="">{t('register.selectVehicle')}</option>
                <option value="moto">{t('vehicle.moto')}</option>
                <option value="velo">{t('vehicle.velo')}</option>
                <option value="voiture">{t('vehicle.voiture')}</option>
              </select>
              {errors.vehicleType && <p className="text-sm text-destructive">{errors.vehicleType}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('register.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder={t('register.passwordPlaceholder')} value={formData.password} onChange={handleChange} className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder={t('register.confirmPasswordPlaceholder')} value={formData.confirmPassword} onChange={handleChange} className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />{t('register.loading')}</> : t('register.submit')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('register.hasAccount')}{' '}<Link to="/courier/login" className="text-primary hover:underline font-medium">{t('register.login')}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourierRegister;
