import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Navigation, Users } from 'lucide-react';

interface LocationPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnableLocation: () => void;
  isLoading: boolean;
}

const LocationPromptDialog = ({
  open,
  onOpenChange,
  onEnableLocation,
  isLoading
}: LocationPromptDialogProps) => {
  const { direction } = useLanguage();

  const content = {
    fr: {
      title: 'Activez votre localisation',
      description: 'Pour apparaître auprès des clients proches de vous et recevoir plus de demandes de livraison, activez votre position GPS.',
      benefit1: 'Apparaissez dans les recherches par proximité',
      benefit2: 'Les clients proches vous trouvent en premier',
      benefit3: 'Augmentez vos chances de recevoir des commandes',
      enable: 'Activer ma localisation',
      later: 'Plus tard',
    },
    ar: {
      title: 'فعّل الموقع ديالك',
      description: 'باش تبان عند الكليان لي قريبين منك و توصلك طلبات كثر، فعّل GPS ديالك.',
      benefit1: 'تبان فالبحث بالقرب',
      benefit2: 'الكليان لي قريبين يلقاوك أول',
      benefit3: 'زيد فرص توصلك الطلبات',
      enable: 'فعّل الموقع ديالي',
      later: 'من بعد',
    },
  };

  const t = direction === 'rtl' ? content.ar : content.fr;

  const handleEnable = () => {
    onEnableLocation();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={direction} className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Navigation className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">{t.title}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-sm text-foreground">{t.benefit1}</p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-sm text-foreground">{t.benefit2}</p>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Navigation className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-foreground">{t.benefit3}</p>
          </div>
        </div>

        <DialogFooter className={`flex-col sm:flex-col gap-2 ${direction === 'rtl' ? 'sm:flex-col-reverse' : ''}`}>
          <Button
            onClick={handleEnable}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t.enable}
              </span>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                {t.enable}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            {t.later}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPromptDialog;
