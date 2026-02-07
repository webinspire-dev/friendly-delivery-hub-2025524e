import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const CourierLogin = () => {
  const { t, direction } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate('/courier/dashboard');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/courier/dashboard');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const loginSchema = z.object({
    email: z.string().email(t('login.error.invalidEmail')),
    password: z.string().min(1, t('login.error.passwordRequired')),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => { if (error.path[0]) fieldErrors[error.path[0] as string] = error.message; });
      setErrors(fieldErrors);
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) toast({ title: t('login.error.title'), description: t('login.error.invalidCredentials'), variant: 'destructive' });
        else if (error.message.includes('Email not confirmed')) toast({ title: t('login.error.title'), description: t('login.error.emailNotConfirmed'), variant: 'destructive' });
        else toast({ title: t('login.error.title'), description: error.message, variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      if (data.session) {
        toast({ title: t('login.success.title'), description: t('login.success.message') });
        navigate('/courier/dashboard');
      }
    } catch (error) {
      toast({ title: t('login.error.title'), description: t('login.error.generic'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4" dir={direction}>
      <Link to="/" className="fixed top-4 left-4 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors z-10"><ArrowLeft className="w-5 h-5" /></Link>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center"><div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center"><MapPin className="w-7 h-7 text-primary-foreground" /></div></div>
          <div><CardTitle className="text-2xl">{t('login.title')}</CardTitle><CardDescription className="mt-2">{t('login.subtitle')}</CardDescription></div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input id="email" name="email" type="email" placeholder={t('login.emailPlaceholder')} value={formData.email} onChange={handleChange} className={`pl-10 ${errors.email ? 'border-destructive' : ''}`} /></div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder={t('login.passwordPlaceholder')} value={formData.password} onChange={handleChange} className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" />{t('login.loading')}</> : t('login.submit')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('login.noAccount')}{' '}<Link to="/courier/register" className="text-primary hover:underline font-medium">{t('login.register')}</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourierLogin;
