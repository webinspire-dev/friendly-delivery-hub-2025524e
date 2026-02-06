import { useLanguage } from '@/contexts/LanguageContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const LanguagePopup = () => {
  const { showLanguagePopup, setLanguage, t } = useLanguage();
  return (
    <Dialog open={showLanguagePopup}>
      <DialogContent className="sm:max-w-md border-0 bg-card shadow-2xl [&>button]:hidden">
        <div className="flex flex-col items-center py-8 px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('language.choose')}</h2>
          <p className="text-muted-foreground text-center mb-8">اختر لغتك / Choisissez votre langue</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <button onClick={() => setLanguage('ar')} className="flex-1 py-4 px-6 rounded-xl bg-secondary hover:bg-secondary/80 transition-all duration-200 group"><span className="text-2xl mb-2 block">🇲🇦</span><span className="font-semibold text-foreground group-hover:text-primary transition-colors">العربية</span></button>
            <button onClick={() => setLanguage('fr')} className="flex-1 py-4 px-6 rounded-xl bg-secondary hover:bg-secondary/80 transition-all duration-200 group"><span className="text-2xl mb-2 block">🇫🇷</span><span className="font-semibold text-foreground group-hover:text-primary transition-colors">Français</span></button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguagePopup;
