import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, MessageCircle, Phone } from 'lucide-react';

interface CourierStat {
  courier_id: string;
  full_name: string;
  city: string | null;
  profile_views: number;
  whatsapp_clicks: number;
  call_clicks: number;
}

interface AnalyticsChartProps {
  couriers: CourierStat[];
  totalViews: number;
  totalWhatsapp: number;
  totalCalls: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];

const AdminAnalyticsChart = ({ couriers, totalViews, totalWhatsapp, totalCalls }: AnalyticsChartProps) => {
  const topCouriers = [...couriers]
    .map(c => ({
      name: c.full_name.split(' ')[0],
      vues: c.profile_views,
      whatsapp: c.whatsapp_clicks,
      appels: c.call_clicks,
      total: c.profile_views + c.whatsapp_clicks + c.call_clicks,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const cityDistribution = couriers.reduce((acc, c) => {
    const city = c.city || 'Non défini';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityData = Object.entries(cityDistribution)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const engagementData = [
    { name: 'Vues', value: totalViews, icon: Eye },
    { name: 'WhatsApp', value: totalWhatsapp, icon: MessageCircle },
    { name: 'Appels', value: totalCalls, icon: Phone },
  ];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Livreurs (Engagement)</h3>
        {topCouriers.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCouriers} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" width={80} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="vues" stackId="a" fill="hsl(210, 100%, 50%)" name="Vues" />
              <Bar dataKey="whatsapp" stackId="a" fill="hsl(142, 76%, 36%)" name="WhatsApp" />
              <Bar dataKey="appels" stackId="a" fill="hsl(38, 92%, 50%)" name="Appels" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Répartition par Ville</h3>
        {cityData.length > 0 ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={cityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {cityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${170 + index * 30}, 70%, 50%)`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {cityData.map((city, index) => (
                <div key={city.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${170 + index * 30}, 70%, 50%)` }} />
                    <span className="text-sm text-foreground">{city.name}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{city.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-foreground mb-4">Types d'Engagement</h3>
        <div className="grid grid-cols-3 gap-4">
          {engagementData.map((item, index) => (
            <div key={item.name} className="p-4 rounded-xl text-center" style={{ backgroundColor: `${COLORS[index]}15` }}>
              <item.icon className="w-8 h-8 mx-auto mb-2" style={{ color: COLORS[index] }} />
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsChart;
