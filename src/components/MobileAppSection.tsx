import { useLanguage } from '@/contexts/LanguageContext';
import { Smartphone, Search, Bell, Navigation, Sparkles } from 'lucide-react';

const MobileAppSection = () => {
  const { t, direction } = useLanguage();

  const features = [
    { icon: Search, key: 'app.feature1' },
    { icon: Bell, key: 'app.feature2' },
    { icon: Navigation, key: 'app.feature3' },
    { icon: Sparkles, key: 'app.feature4' },
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Phone Mockup */}
          <div className={`relative flex justify-center ${direction === 'rtl' ? 'lg:order-2' : ''}`}>
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[260px] h-[520px] bg-foreground rounded-[3rem] p-3 shadow-2xl">
                <div className="w-full h-full bg-background rounded-[2.4rem] overflow-hidden relative">
                  {/* Status bar */}
                  <div className="h-10 bg-primary flex items-center justify-center">
                    <div className="w-20 h-5 bg-foreground/20 rounded-full" />
                  </div>

                  {/* App content mockup */}
                  <div className="p-4 space-y-3">
                    {/* Search bar */}
                    <div className="h-10 bg-secondary rounded-xl flex items-center px-3 gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <div className="h-3 w-24 bg-muted-foreground/20 rounded" />
                    </div>

                    {/* Courier cards */}
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-card rounded-xl p-3 border border-border/50 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {['A', 'K', 'S'][i - 1]}
                          </span>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 bg-foreground/15 rounded w-20" />
                          <div className="h-2 bg-muted-foreground/10 rounded w-16" />
                        </div>
                        <div className="w-14 h-7 bg-primary rounded-lg" />
                      </div>
                    ))}

                    {/* Map placeholder */}
                    <div className="h-28 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-center">
                      <Navigation className="w-8 h-8 text-primary/30" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg transform rotate-12">
                <Smartphone className="w-7 h-7 text-accent-foreground" />
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 -z-10 bg-primary/20 blur-3xl rounded-full scale-75" />
            </div>
          </div>

          {/* Content */}
          <div className={direction === 'rtl' ? 'lg:order-1' : ''}>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t('app.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              {t('app.subtitle')}
            </p>

            {/* Features grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {features.map((feature) => (
                <div key={feature.key} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{t(feature.key)}</span>
                </div>
              ))}
            </div>

            {/* Play Store Button */}
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-foreground text-background px-6 py-3 rounded-xl hover:bg-foreground/90 transition-colors group"
            >
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.196 12l2.502-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z"/>
              </svg>
              <div>
                <div className="text-xs opacity-70">{t('app.getItOn')}</div>
                <div className="text-lg font-semibold leading-tight">{t('app.googlePlay')}</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppSection;
