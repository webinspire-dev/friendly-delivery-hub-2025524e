import { Users, Eye, MessageCircle, Phone, UserCheck, UserX, TrendingUp, Percent } from 'lucide-react';

interface StatsCardsProps {
  totalCouriers: number;
  activeCouriers: number;
  blockedCouriers: number;
  verifiedCouriers: number;
  totalViews: number;
  totalWhatsapp: number;
  totalCalls: number;
}

const AdminStatsCards = ({
  totalCouriers,
  activeCouriers,
  blockedCouriers,
  verifiedCouriers,
  totalViews,
  totalWhatsapp,
  totalCalls,
}: StatsCardsProps) => {
  const conversionRate = totalViews > 0
    ? Math.round(((totalWhatsapp + totalCalls) / totalViews) * 100)
    : 0;

  const stats = [
    { icon: Users, label: 'Total Livreurs', value: totalCouriers, color: 'text-primary', bgColor: 'bg-primary/10' },
    { icon: UserCheck, label: 'Disponibles', value: activeCouriers, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
    { icon: UserX, label: 'Bloqués', value: blockedCouriers, color: 'text-destructive', bgColor: 'bg-destructive/10' },
    { icon: TrendingUp, label: 'Vérifiés', value: verifiedCouriers, color: 'text-primary', bgColor: 'bg-primary/10' },
    { icon: Eye, label: 'Vues Profil', value: totalViews, color: 'text-sky-600', bgColor: 'bg-sky-500/10' },
    { icon: MessageCircle, label: 'Clics WhatsApp', value: totalWhatsapp, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
    { icon: Phone, label: 'Clics Appel', value: totalCalls, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
    { icon: Percent, label: 'Taux Conversion', value: `${conversionRate}%`, color: 'text-violet-600', bgColor: 'bg-violet-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-card rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsCards;
