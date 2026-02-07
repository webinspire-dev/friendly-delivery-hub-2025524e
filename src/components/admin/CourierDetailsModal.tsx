import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MapPin, Phone, Bike, Car, Star, Eye, MessageCircle,
  Calendar, CheckCircle, XCircle, ExternalLink, Copy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CourierStat {
  courier_id: string;
  full_name: string;
  phone: string;
  city: string | null;
  vehicle_type: string | null;
  is_available: boolean | null;
  is_blocked: boolean | null;
  is_verified: boolean | null;
  created_at: string;
  profile_views: number;
  whatsapp_clicks: number;
  call_clicks: number;
}

interface CourierDetailsModalProps {
  courier: CourierStat | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const vehicleLabels: Record<string, string> = {
  moto: 'Moto',
  velo: 'Vélo',
  voiture: 'Voiture',
};

const CourierDetailsModal = ({ courier, open, onOpenChange }: CourierDetailsModalProps) => {
  const { toast } = useToast();

  if (!courier) return null;

  const VehicleIcon = courier.vehicle_type === 'voiture' ? Car : Bike;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: `${label} copié dans le presse-papiers`,
    });
  };

  const openWhatsApp = () => {
    const phone = courier.phone.replace(/[\s\-\(\)]/g, '').replace(/^0/, '+212');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const openProfile = () => {
    window.open(`/courier/${courier.courier_id}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{courier.full_name.charAt(0)}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>{courier.full_name}</span>
                {courier.is_verified && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
              <p className="text-sm font-normal text-muted-foreground">
                Inscrit le {new Date(courier.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={courier.is_available ? "default" : "secondary"}>
              {courier.is_available ? 'Disponible' : 'Indisponible'}
            </Badge>
            <Badge variant={courier.is_verified ? "default" : "outline"}>
              {courier.is_verified ? 'Vérifié' : 'Non vérifié'}
            </Badge>
            {courier.is_blocked && <Badge variant="destructive">Bloqué</Badge>}
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Contact
            </h4>
            <div className="flex items-center justify-between">
              <span className="text-foreground">{courier.phone}</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(courier.phone, 'Téléphone')}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={openWhatsApp} className="text-emerald-600 hover:text-emerald-700">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-xl p-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                Ville
              </h4>
              <p className="text-foreground capitalize">{courier.city || 'Non définie'}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-4">
              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                <VehicleIcon className="w-4 h-4 text-primary" />
                Véhicule
              </h4>
              <p className="text-foreground">{vehicleLabels[courier.vehicle_type || 'moto'] || courier.vehicle_type}</p>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-primary" />
              Statistiques d'engagement
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-sky-600 mb-1"><Eye className="w-4 h-4" /></div>
                <p className="text-2xl font-bold text-foreground">{courier.profile_views}</p>
                <p className="text-xs text-muted-foreground">Vues profil</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1"><MessageCircle className="w-4 h-4" /></div>
                <p className="text-2xl font-bold text-foreground">{courier.whatsapp_clicks}</p>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-amber-600 mb-1"><Phone className="w-4 h-4" /></div>
                <p className="text-2xl font-bold text-foreground">{courier.call_clicks}</p>
                <p className="text-xs text-muted-foreground">Appels</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 gap-2" onClick={openProfile}>
              <ExternalLink className="w-4 h-4" />
              Voir profil public
            </Button>
            <Button variant="outline" className="flex-1 gap-2" onClick={openWhatsApp}>
              <MessageCircle className="w-4 h-4" />
              Contacter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourierDetailsModal;
