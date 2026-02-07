import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Wallet, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const benefits = [
  { icon: MapPin, key: 'become.benefit1' },
  { icon: Clock, key: 'become.benefit2' },
  { icon: Wallet, key: 'become.benefit3' },
];

const BecomeSection = () => {
  const { t, direction } = useLanguage();
  const navigate = useNavigate();

  return (
    <section id="become" className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2.5l5 4-5 3zM0 20.5V18h20v-2H0v4.5z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className={`text-primary-foreground ${direction === 'rtl' ? 'lg:order-2' : ''}`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              {t('become.title')}
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-lg">
              {t('become.subtitle')}
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-10">
              {benefits.map((benefit) => (
                <div key={benefit.key} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-medium">{t(benefit.key)}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              variant="secondary"
              className="group text-base font-semibold px-8"
              onClick={() => navigate('/courier/register')}
            >
              {t('become.cta')}
              <ArrowRight className={`w-5 h-5 ${direction === 'rtl' ? 'mr-2 rotate-180' : 'ml-2'} group-hover:translate-x-1 transition-transform`} />
            </Button>
          </div>

          {/* Visual */}
          <div className={`relative ${direction === 'rtl' ? 'lg:order-1' : ''}`}>
            <div className="relative max-w-md mx-auto">
              {/* Card mockup */}
              <div className="bg-card rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">M</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Mohammed K.</h4>
                    <p className="text-sm text-muted-foreground">Casablanca • Moto</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-xl bg-secondary">
                    <div className="text-xl font-bold text-foreground">4.9</div>
                    <div className="text-xs text-muted-foreground">Rating</div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary">
                    <div className="text-xl font-bold text-foreground">342</div>
                    <div className="text-xs text-muted-foreground">Livraisons</div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary">
                    <div className="text-xl font-bold text-primary">Premium</div>
                    <div className="text-xs text-muted-foreground">Plan</div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-xl bg-accent flex items-center justify-center shadow-lg transform -rotate-12">
                <Wallet className="w-8 h-8 text-accent-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeSection;
