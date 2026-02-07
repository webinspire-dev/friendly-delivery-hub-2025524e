import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Eye, MessageCircle, Phone, MapPin, Search,
  Filter, Bike, Car, ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CourierDetailsModal from './CourierDetailsModal';

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

interface CouriersTableProps {
  couriers: CourierStat[];
  onToggleBlocked: (courierId: string, currentBlocked: boolean | null) => void;
  onToggleVerified: (courierId: string, currentVerified: boolean | null) => void;
}

const vehicleLabels: Record<string, string> = {
  moto: 'Moto',
  velo: 'Vélo',
  voiture: 'Voiture',
};

const AdminCouriersTable = ({
  couriers,
  onToggleBlocked,
  onToggleVerified,
}: CouriersTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourier, setSelectedCourier] = useState<CourierStat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    showAvailable: true,
    showUnavailable: true,
    showBlocked: true,
    showUnblocked: true,
    showVerified: true,
    showUnverified: true,
  });

  const filteredCouriers = couriers.filter((courier) => {
    const matchesSearch = courier.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.phone.includes(searchQuery);

    const matchesAvailability =
      (courier.is_available && filters.showAvailable) ||
      (!courier.is_available && filters.showUnavailable);

    const matchesBlocked =
      (courier.is_blocked && filters.showBlocked) ||
      (!courier.is_blocked && filters.showUnblocked);

    const matchesVerified =
      (courier.is_verified && filters.showVerified) ||
      (!courier.is_verified && filters.showUnverified);

    return matchesSearch && matchesAvailability && matchesBlocked && matchesVerified;
  });

  const handleViewCourier = (courier: CourierStat) => {
    setSelectedCourier(courier);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, ville ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filtres
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuCheckboxItem checked={filters.showAvailable} onCheckedChange={(checked) => setFilters(f => ({ ...f, showAvailable: checked }))}>Disponibles</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters.showUnavailable} onCheckedChange={(checked) => setFilters(f => ({ ...f, showUnavailable: checked }))}>Indisponibles</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters.showVerified} onCheckedChange={(checked) => setFilters(f => ({ ...f, showVerified: checked }))}>Vérifiés</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters.showUnverified} onCheckedChange={(checked) => setFilters(f => ({ ...f, showUnverified: checked }))}>Non vérifiés</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters.showBlocked} onCheckedChange={(checked) => setFilters(f => ({ ...f, showBlocked: checked }))}>Bloqués</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={filters.showUnblocked} onCheckedChange={(checked) => setFilters(f => ({ ...f, showUnblocked: checked }))}>Non bloqués</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="px-4 py-2 bg-secondary/30 text-sm text-muted-foreground">
          {filteredCouriers.length} livreur{filteredCouriers.length !== 1 ? 's' : ''} trouvé{filteredCouriers.length !== 1 ? 's' : ''}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Livreur</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Contact</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Véhicule</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Stats</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Statut</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCouriers.map((courier) => (
                <tr key={courier.courier_id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">{courier.full_name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{courier.full_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {courier.city || 'Non défini'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-foreground">{courier.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      Inscrit le {new Date(courier.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary text-sm">
                      {courier.vehicle_type === 'voiture' ? <Car className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
                      {vehicleLabels[courier.vehicle_type || 'moto'] || courier.vehicle_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-sky-600" title="Vues">
                        <Eye className="w-3.5 h-3.5" />{courier.profile_views}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600" title="WhatsApp">
                        <MessageCircle className="w-3.5 h-3.5" />{courier.whatsapp_clicks}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600" title="Appels">
                        <Phone className="w-3.5 h-3.5" />{courier.call_clicks}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Vérifié</span>
                        <Switch checked={courier.is_verified ?? false} onCheckedChange={() => onToggleVerified(courier.courier_id, courier.is_verified)} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Bloqué</span>
                        <Switch checked={courier.is_blocked ?? false} onCheckedChange={() => onToggleBlocked(courier.courier_id, courier.is_blocked)} className="data-[state=checked]:bg-destructive" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="outline" size="sm" onClick={() => handleViewCourier(courier)} className="gap-1">
                      <Eye className="w-4 h-4" />
                      Voir
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredCouriers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    Aucun livreur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CourierDetailsModal
        courier={selectedCourier}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};

export default AdminCouriersTable;
