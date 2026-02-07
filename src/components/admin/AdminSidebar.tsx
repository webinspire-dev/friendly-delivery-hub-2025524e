import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart3, Settings,
  LogOut, Home, Ban, Newspaper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.png';

interface AdminSidebarProps {
  onLogout: () => void;
  userEmail?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', tab: 'dashboard' },
  { icon: Users, label: 'Livreurs', tab: 'couriers' },
  { icon: Ban, label: 'Liste noire', tab: 'blacklist' },
  { icon: Newspaper, label: 'Articles', tab: 'articles' },
  { icon: BarChart3, label: 'Statistiques', tab: 'analytics' },
  { icon: Settings, label: 'Paramètres', tab: 'settings' },
];

const AdminSidebar = ({ onLogout, userEmail, activeTab, onTabChange }: AdminSidebarProps) => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Livreur Autour de Moi" className="h-10 w-auto" />
          <div>
            <h1 className="font-bold text-foreground">Admin</h1>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">{userEmail}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => onTabChange(item.tab)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
              activeTab === item.tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => navigate('/')}
        >
          <Home className="w-5 h-5" />
          Voir le site
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
