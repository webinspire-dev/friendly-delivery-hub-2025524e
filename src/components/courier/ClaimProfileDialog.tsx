import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { UserCheck, Phone, KeyRound, Mail, Lock, Loader2, CheckCircle2, Clock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClaimProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courierId: string;
  courierPhone: string;
  courierName: string;
}

type Step = 'phone' | 'pending' | 'code' | 'activate';

const ClaimProfileDialog = ({ open, onOpenChange, courierId, courierPhone, courierName }: ClaimProfileDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claimRequestId, setClaimRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('phone');
      setPhone('');
      setCode('');
      setEmail('');
      setPassword('');
      setClaimRequestId(null);
      checkExistingClaim();
    }
  }, [open, courierId]);

  const checkExistingClaim = async () => {
    const { data } = await supabase
      .from('claim_requests')
      .select('*')
      .eq('courier_id', courierId)
      .in('status', ['pending', 'code_sent'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setClaimRequestId(data.id);
      setPhone(data.phone_number);
      if (data.status === 'code_sent') {
        setStep('code');
      } else {
        setStep('pending');
      }
    }
  };

  const normalizePhone = (p: string) => p.replace(/[\s\-\(\)]/g, '');

  const handleSubmitPhone = async () => {
    const normalized = normalizePhone(phone);
    const courierNormalized = normalizePhone(courierPhone);

    if (normalized !== courierNormalized) {
      toast({
        title: "Numéro incorrect",
        description: "Le numéro saisi ne correspond pas à celui du profil.",
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('claim_requests')
        .insert({ courier_id: courierId, phone_number: normalized })
        .select()
        .single();

      if (error) throw error;
      setClaimRequestId(data.id);
      setStep('pending');
      toast({
        title: "Demande envoyée",
        description: "Un administrateur va traiter votre demande et vous envoyer un code.",
      });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!claimRequestId) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('claim_requests')
      .select('status')
      .eq('id', claimRequestId)
      .single();

    setIsLoading(false);
    if (data?.status === 'code_sent') {
      setStep('code');
      toast({ title: "Code envoyé", description: "L'admin a envoyé votre code. Saisissez-le ci-dessous." });
    } else if (data?.status === 'rejected') {
      toast({ title: "Demande rejetée", description: "Votre demande a été rejetée par l'administrateur.", variant: 'destructive' });
      onOpenChange(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!claimRequestId || code.length !== 6) return;
    setIsLoading(true);

    const { data } = await supabase
      .from('claim_requests')
      .select('verification_code')
      .eq('id', claimRequestId)
      .single();

    setIsLoading(false);
    if (data?.verification_code === code) {
      setStep('activate');
    } else {
      toast({ title: "Code incorrect", description: "Le code saisi ne correspond pas.", variant: 'destructive' });
    }
  };

  const handleActivateAccount = async () => {
    if (!email || !password || password.length < 6) {
      toast({ title: "Erreur", description: "Email requis et mot de passe (min 6 caractères).", variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      // Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: courierName },
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // Update courier profile with user_id and mark as claimed
        const { error: updateError } = await supabase
          .from('courier_profiles')
          .update({ user_id: signUpData.user.id, is_claimed: true, email })
          .eq('id', courierId);

        if (updateError) throw updateError;

        // Update claim request status
        await supabase
          .from('claim_requests')
          .update({ status: 'verified' })
          .eq('id', claimRequestId);

        toast({
          title: "Compte activé !",
          description: "Vérifiez votre email pour confirmer, puis connectez-vous.",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Réclamer ce profil
          </DialogTitle>
          <DialogDescription>
            Confirmez votre identité pour activer votre compte livreur.
          </DialogDescription>
        </DialogHeader>

        {step === 'phone' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="claim-phone">Numéro de téléphone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="claim-phone"
                  placeholder="06XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Entrez le numéro associé à ce profil pour vérification.
              </p>
            </div>
            <Button onClick={handleSubmitPhone} disabled={isLoading || !phone} className="w-full">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Envoyer la demande
            </Button>
          </div>
        )}

        {step === 'pending' && (
          <div className="space-y-4 text-center py-4">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-foreground">Demande en attente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Un administrateur va vérifier votre demande et vous envoyer un code de vérification par WhatsApp.
              </p>
            </div>
            <Button onClick={handleRefreshStatus} disabled={isLoading} variant="outline" className="w-full">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Vérifier le statut
            </Button>
          </div>
        )}

        {step === 'code' && (
          <div className="space-y-4">
            <div className="text-center">
              <KeyRound className="w-10 h-10 mx-auto text-primary mb-2" />
              <p className="text-sm text-muted-foreground">
                Saisissez le code à 6 chiffres envoyé par l'administrateur.
              </p>
            </div>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={handleVerifyCode} disabled={isLoading || code.length !== 6} className="w-full">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Vérifier le code
            </Button>
          </div>
        )}

        {step === 'activate' && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                Identité vérifiée ! Créez vos identifiants pour activer votre compte.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="claim-email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="claim-password">Mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="claim-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleActivateAccount} disabled={isLoading || !email || !password} className="w-full">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Activer mon compte
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ClaimProfileDialog;
