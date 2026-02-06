import { useLanguage } from '@/contexts/LanguageContext';
import CourierCard from './CourierCard';
import { useCouriers } from '@/hooks/useCouriers';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Loader2 } from 'lucide-react';

const CouriersSection = () => {
  const { t } = useLanguage();
  const { isAdmin, authChecked } = useAdminAuth();
  const { couriers, isLoading } = useCouriers({ limit: 6, isAdmin: authChecked ? isAdmin : undefined });

  return (
    <section id="couriers" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t('couriers.title')}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('couriers.subtitle')}</p>
        </div>
        {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
        {!isLoading && couriers.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">{t('couriers.noCouriers') || 'Aucun livreur disponible pour le moment'}</p></div>}
        {!isLoading && couriers.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {couriers.map((courier) => (
              <CourierCard key={courier.id} id={courier.id} name={courier.full_name} city={courier.city || ''} vehicleType={(courier.vehicle_type as 'moto' | 'velo' | 'voiture') || 'moto'} rating={courier.rating} deliveries={courier.total_deliveries} isAvailable={courier.is_available} isVerified={courier.is_verified} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CouriersSection;
