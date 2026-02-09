import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import AdminCouriersTable from '@/components/admin/AdminCouriersTable';
import AdminAnalyticsChart from '@/components/admin/AdminAnalyticsChart';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminBlacklist from '@/components/admin/AdminBlacklist';
import AdminArticles from '@/components/admin/AdminArticles';
import AdminClaimRequests from '@/components/admin/AdminClaimRequests';

interface CourierStat {
  courier_id: string;
  full_name: string;
  phone: string;
  email: string | null;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading: authLoading, authChecked, signOut } = useAdminAuth();

  const [couriers, setCouriers] = useState<CourierStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalCouriers: 0,
    activeCouriers: 0,
    blockedCouriers: 0,
    verifiedCouriers: 0,
    totalViews: 0,
    totalWhatsapp: 0,
    totalCalls: 0,
  });

  useEffect(() => {
    if (!authChecked) return;
    if (!user || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchCouriers();
  }, [authChecked, user, isAdmin, navigate]);

  const fetchCouriers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('courier_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: analytics, error: analyticsError } = await supabase
        .from('courier_analytics')
        .select('courier_id, event_type');

      if (analyticsError) throw analyticsError;

      const analyticsMap: Record<string, { views: number; whatsapp: number; calls: number }> = {};

      analytics?.forEach((event) => {
        if (!analyticsMap[event.courier_id]) {
          analyticsMap[event.courier_id] = { views: 0, whatsapp: 0, calls: 0 };
        }
        if (event.event_type === 'profile_view') analyticsMap[event.courier_id].views++;
        if (event.event_type === 'whatsapp_click') analyticsMap[event.courier_id].whatsapp++;
        if (event.event_type === 'call_click') analyticsMap[event.courier_id].calls++;
      });

      const couriersWithStats: CourierStat[] = (profiles || []).map((p) => ({
        courier_id: p.id,
        full_name: p.full_name,
        phone: p.phone,
        email: p.email ?? null,
        city: p.city,
        vehicle_type: p.vehicle_type,
        is_available: p.is_available,
        is_blocked: p.is_blocked,
        is_verified: p.is_verified,
        created_at: p.created_at,
        profile_views: analyticsMap[p.id]?.views || 0,
        whatsapp_clicks: analyticsMap[p.id]?.whatsapp || 0,
        call_clicks: analyticsMap[p.id]?.calls || 0,
      }));

      setCouriers(couriersWithStats);

      const calculatedStats = couriersWithStats.reduce(
        (acc, c) => ({
          totalCouriers: acc.totalCouriers + 1,
          activeCouriers: acc.activeCouriers + (c.is_available && !c.is_blocked ? 1 : 0),
          blockedCouriers: acc.blockedCouriers + (c.is_blocked ? 1 : 0),
          verifiedCouriers: acc.verifiedCouriers + (c.is_verified ? 1 : 0),
          totalViews: acc.totalViews + c.profile_views,
          totalWhatsapp: acc.totalWhatsapp + c.whatsapp_clicks,
          totalCalls: acc.totalCalls + c.call_clicks,
        }),
        {
          totalCouriers: 0,
          activeCouriers: 0,
          blockedCouriers: 0,
          verifiedCouriers: 0,
          totalViews: 0,
          totalWhatsapp: 0,
          totalCalls: 0
        }
      );
      setStats(calculatedStats);
    } catch (error) {
      console.error('Error fetching couriers:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlocked = async (courierId: string, currentBlocked: boolean | null) => {
    try {
      const { error } = await supabase
        .from('courier_profiles')
        .update({ is_blocked: !currentBlocked })
        .eq('id', courierId);

      if (error) throw error;

      setCouriers((prev) =>
        prev.map((c) =>
          c.courier_id === courierId ? { ...c, is_blocked: !currentBlocked } : c
        )
      );

      setStats(s => ({
        ...s,
        blockedCouriers: currentBlocked ? s.blockedCouriers - 1 : s.blockedCouriers + 1,
        activeCouriers: currentBlocked ? s.activeCouriers + 1 : s.activeCouriers - 1,
      }));

      toast({
        title: currentBlocked ? "Livreur débloqué" : "Livreur bloqué",
        description: currentBlocked
          ? "Le livreur peut maintenant recevoir des demandes"
          : "Le livreur ne peut plus recevoir de demandes",
      });
    } catch (error) {
      console.error('Error updating courier:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleToggleVerified = async (courierId: string, currentVerified: boolean | null) => {
    try {
      const { error } = await supabase
        .from('courier_profiles')
        .update({ is_verified: !currentVerified })
        .eq('id', courierId);

      if (error) throw error;

      setCouriers((prev) =>
        prev.map((c) =>
          c.courier_id === courierId ? { ...c, is_verified: !currentVerified } : c
        )
      );

      setStats(s => ({
        ...s,
        verifiedCouriers: currentVerified ? s.verifiedCouriers - 1 : s.verifiedCouriers + 1,
      }));

      toast({
        title: currentVerified ? "Vérification retirée" : "Livreur vérifié",
      });
    } catch (error) {
      console.error('Error updating courier:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (!authChecked || authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
              <p className="text-muted-foreground">Vue d'ensemble de votre plateforme</p>
            </div>
            <AdminStatsCards {...stats} />
            <AdminAnalyticsChart
              couriers={couriers}
              totalViews={stats.totalViews}
              totalWhatsapp={stats.totalWhatsapp}
              totalCalls={stats.totalCalls}
            />
          </div>
        );
      case 'couriers':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des livreurs</h1>
              <p className="text-muted-foreground">Gérez et modérez les livreurs de la plateforme</p>
            </div>
            <AdminCouriersTable
              couriers={couriers}
              onToggleBlocked={handleToggleBlocked}
              onToggleVerified={handleToggleVerified}
            />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Statistiques détaillées</h1>
              <p className="text-muted-foreground">Analysez les performances de votre plateforme</p>
            </div>
            <AdminStatsCards {...stats} />
            <AdminAnalyticsChart
              couriers={couriers}
              totalViews={stats.totalViews}
              totalWhatsapp={stats.totalWhatsapp}
              totalCalls={stats.totalCalls}
            />
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
              <p className="text-muted-foreground">Configurez votre plateforme</p>
            </div>
            <AdminSettings />
          </div>
        );
      case 'blacklist':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion de la Liste Noire</h1>
              <p className="text-muted-foreground">Consultez les numéros signalés par les livreurs</p>
            </div>
            <AdminBlacklist />
          </div>
        );
      case 'articles':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Articles</h1>
              <p className="text-muted-foreground">Créez et gérez les articles de la page Nouveautés</p>
            </div>
            <AdminArticles />
          </div>
        );
      case 'claims':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Demandes de réclamation</h1>
              <p className="text-muted-foreground">Gérez les demandes de réclamation de profil des livreurs</p>
            </div>
            <AdminClaimRequests />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        onLogout={handleLogout}
        userEmail={user?.email}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 p-8 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
