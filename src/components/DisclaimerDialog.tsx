import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield } from 'lucide-react';

interface DisclaimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  contactType: 'whatsapp' | 'call';
}

const DisclaimerDialog = ({ open, onOpenChange, onConfirm, contactType }: DisclaimerDialogProps) => {
  const { direction } = useLanguage();

  const content = {
    fr: {
      title: 'Avertissement',
      description: 'Nous sommes simplement une plateforme de mise en relation entre les clients et les livreurs. Toute communication ou transaction se fait directement entre les deux parties, et la plateforme décline toute responsabilité concernant les services du livreur.',
      cancel: 'Annuler',
      confirm: contactType === 'whatsapp' ? 'Continuer vers WhatsApp' : 'Continuer vers l\'appel',
    },
    ar: {
      title: 'تنبيه',
      description: 'نحن مجرد منصة للربط بين العملاء والموصلين. تتم جميع الاتصالات أو المعاملات مباشرة بين الطرفين، والمنصة غير مسؤولة عن خدمات الموصل.',
      cancel: 'إلغاء',
      confirm: contactType === 'whatsapp' ? 'متابعة إلى واتساب' : 'متابعة إلى الاتصال',
    },
  };

  const t = direction === 'rtl' ? content.ar : content.fr;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir={direction}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            {t.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={direction === 'rtl' ? 'flex-row-reverse gap-2' : ''}>
          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t.confirm}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DisclaimerDialog;
