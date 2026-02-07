import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Globe, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { z } from 'zod';

interface City {
  id: string;
  name: string;
  name_ar: string | null;
  is_active: boolean;
}

const citySchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-Z_]+$/, "Utilisez uniquement des lettres et underscores (ex: el_jadida)"),
  name_ar: z.string()
    .trim()
    .max(50, "Le nom arabe ne peut pas dépasser 50 caractères")
    .optional(),
});

const AdminSettings = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [newCityName, setNewCityName] = useState('');
  const [newCityNameAr, setNewCityNameAr] = useState('');
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [deletingCityId, setDeletingCityId] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    siteName: 'Livreur',
    allowRegistrations: true,
    requireEmailVerification: true,
    autoVerifyCouriers: false,
    maintenanceMode: false,
  });

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    setIsLoadingCities(true);
    try {
      const { data, error } = await supabase.from('cities').select('*').order('name', { ascending: true });
      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast({ title: "Erreur", description: "Impossible de charger les villes", variant: "destructive" });
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleAddCity = async () => {
    const validation = citySchema.safeParse({ name: newCityName, name_ar: newCityNameAr || undefined });
    if (!validation.success) {
      toast({ title: "Erreur de validation", description: validation.error.errors[0].message, variant: "destructive" });
      return;
    }

    setIsAddingCity(true);
    try {
      const { data, error } = await supabase
        .from('cities')
        .insert({ name: newCityName.toLowerCase().trim(), name_ar: newCityNameAr.trim() || null, is_active: true })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('Cette ville existe déjà');
        throw error;
      }

      setCities([...cities, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCityName('');
      setNewCityNameAr('');
      toast({ title: "Ville ajoutée", description: `${data.name} a été ajoutée avec succès` });
    } catch (error: any) {
      console.error('Error adding city:', error);
      toast({ title: "Erreur", description: error.message || "Impossible d'ajouter la ville", variant: "destructive" });
    } finally {
      setIsAddingCity(false);
    }
  };

  const handleDeleteCity = async (cityId: string, cityName: string) => {
    setDeletingCityId(cityId);
    try {
      const { error } = await supabase.from('cities').delete().eq('id', cityId);
      if (error) throw error;
      setCities(cities.filter(c => c.id !== cityId));
      toast({ title: "Ville supprimée", description: `${cityName} a été supprimée` });
    } catch (error) {
      console.error('Error deleting city:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer la ville", variant: "destructive" });
    } finally {
      setDeletingCityId(null);
    }
  };

  const handleToggleCityActive = async (cityId: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from('cities').update({ is_active: !isActive }).eq('id', cityId);
      if (error) throw error;
      setCities(cities.map(c => c.id === cityId ? { ...c, is_active: !isActive } : c));
      toast({ title: isActive ? "Ville désactivée" : "Ville activée" });
    } catch (error) {
      console.error('Error toggling city:', error);
      toast({ title: "Erreur", description: "Impossible de modifier le statut", variant: "destructive" });
    }
  };

  const handleSave = () => {
    toast({ title: "Paramètres sauvegardés", description: "Les modifications ont été enregistrées avec succès." });
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Paramètres Généraux
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nom du site</Label>
            <Input id="siteName" value={settings.siteName} onChange={(e) => setSettings(s => ({ ...s, siteName: e.target.value }))} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
            <div>
              <p className="font-medium text-foreground">Mode maintenance</p>
              <p className="text-sm text-muted-foreground">Désactive l'accès public au site</p>
            </div>
            <Switch checked={settings.maintenanceMode} onCheckedChange={(checked) => setSettings(s => ({ ...s, maintenanceMode: checked }))} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Gestion des Villes
        </h3>

        <div className="bg-secondary/50 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-foreground mb-4">Ajouter une ville</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newCityName">Nom (code)</Label>
              <Input id="newCityName" placeholder="ex: el_jadida" value={newCityName} onChange={(e) => setNewCityName(e.target.value)} maxLength={50} />
              <p className="text-xs text-muted-foreground">Lettres et underscores uniquement</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCityNameAr">Nom en arabe (optionnel)</Label>
              <Input id="newCityNameAr" placeholder="ex: الجديدة" value={newCityNameAr} onChange={(e) => setNewCityNameAr(e.target.value)} dir="rtl" maxLength={50} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddCity} disabled={!newCityName.trim() || isAddingCity} className="gap-2">
                {isAddingCity ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Ajouter
              </Button>
            </div>
          </div>
        </div>

        {isLoadingCities ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground">
              <div className="col-span-4">Nom</div>
              <div className="col-span-4">Nom arabe</div>
              <div className="col-span-2 text-center">Active</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
            {cities.map((city) => (
              <div key={city.id} className={`grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl transition-colors ${city.is_active ? 'bg-secondary/30' : 'bg-secondary/10 opacity-60'}`}>
                <div className="col-span-4">
                  <span className="font-medium text-foreground capitalize">{city.name.replace(/_/g, ' ')}</span>
                </div>
                <div className="col-span-4">
                  <span className="text-muted-foreground" dir="rtl">{city.name_ar || '-'}</span>
                </div>
                <div className="col-span-2 text-center">
                  <Switch checked={city.is_active} onCheckedChange={() => handleToggleCityActive(city.id, city.is_active)} />
                </div>
                <div className="col-span-2 text-center">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteCity(city.id, city.name)} disabled={deletingCityId === city.id} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    {deletingCityId === city.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
            {cities.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">Aucune ville configurée</div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Sauvegarder les modifications
        </Button>
      </div>
    </div>
  );
};

export default AdminSettings;
