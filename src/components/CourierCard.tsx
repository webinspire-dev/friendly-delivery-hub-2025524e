import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { MapPin, Star, CheckCircle, Bike, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourierCardProps { id?: string; name: string; city: string; vehicleType: 'moto' | 'velo' | 'voiture'; rating: number; deliveries: number; isAvailable: boolean; isVerified: boolean; avatar?: string; }
const vehicleIcons = { moto: Bike, velo: Bike, voiture: Car };

const CourierCard = ({ id, name, city, vehicleType, rating, deliveries, isAvailable, isVerified, avatar }: CourierCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const VehicleIcon = vehicleIcons[vehicleType];
  const handleViewProfile = () => { if (id) navigate(`/courier/${id}`); };

  return (
    <div className="group relative bg-card rounded-2xl border border-border p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer" onClick={handleViewProfile}>
      <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-medium ${isAvailable ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
        {isAvailable ? t('courier.available') : t('courier.unavailable')}
      </div>
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
            {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold text-primary">{name.charAt(0)}</span>}
          </div>
          {isVerified && <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center"><CheckCircle className="w-4 h-4 text-primary-foreground" /></div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1"><h3 className="font-semibold text-foreground truncate">{name}</h3>{isVerified && <span className="text-xs text-primary font-medium">{t('courier.verified')}</span>}</div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{t(`cities.${city}`)}</span>
            <span className="flex items-center gap-1"><VehicleIcon className="w-3.5 h-3.5" />{t(`vehicle.${vehicleType}`)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1"><Star className="w-4 h-4 text-accent fill-accent" /><span className="font-medium text-foreground">{rating.toFixed(1)}</span></div>
            <span className="text-sm text-muted-foreground">{deliveries} {t('courier.deliveries')}</span>
          </div>
        </div>
      </div>
      <div className="mt-5 pt-5 border-t border-border">
        <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={(e) => { e.stopPropagation(); handleViewProfile(); }}>{t('courier.viewProfile')}</Button>
      </div>
    </div>
  );
};

export default CourierCard;
