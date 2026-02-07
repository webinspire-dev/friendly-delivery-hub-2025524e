import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Ban,
  Plus,
  Loader2,
  AlertTriangle,
  Users,
  Search,
  Info,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { z } from 'zod';

interface BlacklistSearchResult {
  exists: boolean;
  isOwn: boolean;
  globalReports: number;
  reasons: string[] | null;
}

interface BlacklistManagerProps {
  courierId: string;
}

const translations = {
  fr: {
    title: "Liste Noire des Clients",
    addPhoneLabel: "Numéro de téléphone",
    addPhonePlaceholder: "0612345678",
    reasonLabel: "Raison (optionnel)",
    reasonPlaceholder: "Ex: Ne répond pas, commande annulée...",
    addButton: "Ajouter à la liste noire",
    adding: "Ajout...",
    searchLabel: "Vérifier un numéro",
    searchPlaceholder: "Entrez un numéro pour vérifier...",
    searchButton: "Vérifier",
    searching: "Recherche...",
    foundInYourList: "Ce numéro est dans votre liste noire",
    foundByOthers: "Ce numéro a été signalé par d'autres livreurs",
    reports: "signalements",
    notFound: "Ce numéro n'est pas dans la liste noire",
    alreadyBlocked: "Numéro déjà bloqué",
    alreadyBlockedDesc: "Ce numéro est déjà dans votre liste noire",
    numberAdded: "Numéro ajouté",
    numberAddedDesc: "Le numéro a été ajouté à votre liste noire",
    error: "Erreur",
    addError: "Impossible d'ajouter le numéro",
    searchError: "Impossible de vérifier le numéro",
    infoNote: "Les numéros ajoutés à votre liste noire ne peuvent pas être supprimés. Cette liste est privée.",
    phoneMinError: "Le numéro doit contenir au moins 10 chiffres",
    phoneMaxError: "Le numéro ne peut pas dépasser 15 caractères",
    phoneFormatError: "Format invalide (chiffres et + uniquement)",
    reasons: "Raisons signalées",
  },
  ar: {
    title: "القائمة السوداء للعملاء",
    addPhoneLabel: "رقم الهاتف",
    addPhonePlaceholder: "0612345678",
    reasonLabel: "السبب (اختياري)",
    reasonPlaceholder: "مثال: لا يرد، طلب ملغى...",
    addButton: "إضافة إلى القائمة السوداء",
    adding: "جاري الإضافة...",
    searchLabel: "التحقق من رقم",
    searchPlaceholder: "أدخل رقماً للتحقق...",
    searchButton: "تحقق",
    searching: "جاري البحث...",
    foundInYourList: "هذا الرقم موجود في قائمتك السوداء",
    foundByOthers: "تم الإبلاغ عن هذا الرقم من قبل سائقين آخرين",
    reports: "بلاغات",
    notFound: "هذا الرقم غير موجود في القائمة السوداء",
    alreadyBlocked: "الرقم محظور بالفعل",
    alreadyBlockedDesc: "هذا الرقم موجود بالفعل في قائمتك السوداء",
    numberAdded: "تمت إضافة الرقم",
    numberAddedDesc: "تمت إضافة الرقم إلى قائمتك السوداء",
    error: "خطأ",
    addError: "تعذر إضافة الرقم",
    searchError: "تعذر التحقق من الرقم",
    infoNote: "لا يمكن حذف الأرقام المضافة إلى قائمتك السوداء. هذه القائمة خاصة.",
    phoneMinError: "يجب أن يحتوي الرقم على 10 أرقام على الأقل",
    phoneMaxError: "لا يمكن أن يتجاوز الرقم 15 حرفاً",
    phoneFormatError: "صيغة غير صالحة (أرقام و + فقط)",
    reasons: "الأسباب المبلغ عنها",
  }
};

const BlacklistManager = ({ courierId }: BlacklistManagerProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language as keyof typeof translations] || translations.fr;

  const [isAdding, setIsAdding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [reason, setReason] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<BlacklistSearchResult | null>(null);

  const phoneSchema = z.string()
    .trim()
    .min(10, t.phoneMinError)
    .max(15, t.phoneMaxError)
    .regex(/^[0-9+]+$/, t.phoneFormatError);

  const handleAddToBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    const trimmedPhone = phoneNumber.trim();

    const validation = phoneSchema.safeParse(trimmedPhone);
    if (!validation.success) {
      setPhoneError(validation.error.errors[0].message);
      return;
    }

    setIsAdding(true);

    try {
      const { data: existing } = await supabase
        .from('courier_blacklist' as any)
        .select('id')
        .eq('courier_id', courierId)
        .eq('phone_number', trimmedPhone)
        .maybeSingle();

      if (existing) {
        toast({
          title: t.alreadyBlocked,
          description: t.alreadyBlockedDesc,
        });
        setIsAdding(false);
        return;
      }

      const { error } = await supabase
        .from('courier_blacklist' as any)
        .insert({
          courier_id: courierId,
          phone_number: trimmedPhone,
          reason: reason.trim() || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: t.alreadyBlocked,
            description: t.alreadyBlockedDesc,
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: t.numberAdded,
          description: t.numberAddedDesc,
        });
        setPhoneNumber('');
        setReason('');
      }
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      toast({
        title: t.error,
        description: t.addError,
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleSearch = async () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    setIsSearching(true);
    setSearchResult(null);

    try {
      const { data: ownEntry } = await supabase
        .from('courier_blacklist' as any)
        .select('id')
        .eq('courier_id', courierId)
        .eq('phone_number', trimmedQuery)
        .maybeSingle();

      const { data: stats } = await supabase
        .from('blacklist_stats' as any)
        .select('*')
        .eq('phone_number', trimmedQuery)
        .maybeSingle();

      if (ownEntry || stats) {
        setSearchResult({
          exists: true,
          isOwn: !!ownEntry,
          globalReports: (stats as any)?.report_count || 1,
          reasons: (stats as any)?.reasons || null,
        });
      } else {
        setSearchResult({
          exists: false,
          isOwn: false,
          globalReports: 0,
          reasons: null,
        });
      }
    } catch (error) {
      console.error('Error searching blacklist:', error);
      toast({
        title: t.error,
        description: t.searchError,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="w-5 h-5 text-destructive" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleAddToBlacklist} className="space-y-4 p-4 rounded-xl bg-secondary/50">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number">{t.addPhoneLabel}</Label>
              <Input
                id="phone_number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setPhoneError(null);
                }}
                placeholder={t.addPhonePlaceholder}
                className={phoneError ? 'border-destructive' : ''}
              />
              {phoneError && (
                <p className="text-xs text-destructive">{phoneError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">{t.reasonLabel}</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t.reasonPlaceholder}
                maxLength={100}
              />
            </div>
          </div>
          <Button type="submit" disabled={isAdding || !phoneNumber.trim()}>
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.adding}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {t.addButton}
              </>
            )}
          </Button>
        </form>

        <div className="space-y-4 p-4 rounded-xl border">
          <Label className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            {t.searchLabel}
          </Label>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchResult(null);
              }}
              placeholder={t.searchPlaceholder}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              variant="secondary"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t.searchButton
              )}
            </Button>
          </div>

          {searchResult && (
            <div className={`p-4 rounded-lg ${searchResult.exists ? 'bg-destructive/10' : 'bg-green-500/10'}`}>
              {searchResult.exists ? (
                <div className="space-y-2">
                  {searchResult.isOwn && (
                    <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      {t.foundInYourList}
                    </Badge>
                  )}
                  {searchResult.globalReports > 1 && (
                    <Badge variant="outline" className="flex items-center gap-1 w-fit border-destructive text-destructive">
                      <Users className="w-3 h-3" />
                      {t.foundByOthers}: {searchResult.globalReports} {t.reports}
                    </Badge>
                  )}
                  {searchResult.reasons && searchResult.reasons.length > 0 && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-medium">{t.reasons}:</span>{' '}
                      {searchResult.reasons.join(', ')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle className="w-4 h-4" />
                  <span>{t.notFound}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{t.infoNote}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlacklistManager;
