import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Ban, Loader2, Search, Phone, User, Calendar,
  AlertTriangle, Users, MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface BlacklistEntryWithCourier {
  id: string;
  phone_number: string;
  reason: string | null;
  created_at: string;
  courier_id: string;
  courier_name: string;
  courier_phone: string;
}

interface BlacklistStat {
  phone_number: string;
  report_count: number;
  reasons: string[] | null;
  first_reported_at: string | null;
  last_reported_at: string | null;
}

const AdminBlacklist = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<BlacklistEntryWithCourier[]>([]);
  const [stats, setStats] = useState<Map<string, BlacklistStat>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  useEffect(() => {
    fetchBlacklistData();
  }, []);

  const fetchBlacklistData = async () => {
    setIsLoading(true);
    try {
      const { data: blacklistData, error: blacklistError } = await supabase
        .from('courier_blacklist')
        .select(`
          id,
          phone_number,
          reason,
          created_at,
          courier_id,
          courier_profiles!courier_blacklist_courier_id_fkey (
            full_name,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (blacklistError) throw blacklistError;

      const entriesWithCourier: BlacklistEntryWithCourier[] = (blacklistData || []).map((entry: any) => ({
        id: entry.id,
        phone_number: entry.phone_number,
        reason: entry.reason,
        created_at: entry.created_at,
        courier_id: entry.courier_id,
        courier_name: entry.courier_profiles?.full_name || 'Inconnu',
        courier_phone: entry.courier_profiles?.phone || '',
      }));

      setEntries(entriesWithCourier);

      const { data: statsData, error: statsError } = await supabase
        .from('blacklist_stats')
        .select('*');

      if (!statsError && statsData) {
        const statsMap = new Map<string, BlacklistStat>();
        (statsData as any[]).forEach((stat: any) => {
          statsMap.set(stat.phone_number, {
            phone_number: stat.phone_number,
            report_count: stat.report_count || 1,
            reasons: stat.reasons,
            first_reported_at: stat.first_reported_at,
            last_reported_at: stat.last_reported_at,
          });
        });
        setStats(statsMap);
      }
    } catch (error) {
      console.error('Error fetching blacklist data:', error);
      toast({ title: "Erreur", description: "Impossible de charger les données de la liste noire", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredEntries = entries.filter(entry => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.phone_number.toLowerCase().includes(query) ||
      entry.courier_name.toLowerCase().includes(query) ||
      entry.courier_phone.toLowerCase().includes(query) ||
      (entry.reason && entry.reason.toLowerCase().includes(query))
    );
  });

  const uniquePhones = [...new Set(entries.map(e => e.phone_number))];
  const totalReports = entries.length;
  const multiReportedCount = uniquePhones.filter(phone =>
    (stats.get(phone)?.report_count || 1) > 1
  ).length;

  const getReportsForPhone = (phone: string) => entries.filter(e => e.phone_number === phone);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{uniquePhones.length}</p>
                <p className="text-sm text-muted-foreground">Numéros uniques</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Ban className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalReports}</p>
                <p className="text-sm text-muted-foreground">Total signalements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{multiReportedCount}</p>
                <p className="text-sm text-muted-foreground">Signalés plusieurs fois</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Historique des signalements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher par numéro, livreur ou raison..." className="pl-10" />
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Ban className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{searchQuery ? 'Aucun résultat trouvé' : 'Aucun signalement enregistré'}</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro signalé</TableHead>
                    <TableHead>Livreur</TableHead>
                    <TableHead>Raison</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Signalements</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => {
                    const stat = stats.get(entry.phone_number);
                    const globalReports = stat?.report_count || 1;
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{entry.phone_number}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{entry.courier_name}</p>
                              <p className="text-xs text-muted-foreground">{entry.courier_phone}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.reason ? (
                            <span className="text-sm line-clamp-1">{entry.reason}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(entry.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={globalReports > 1 ? "destructive" : "secondary"} className="flex items-center gap-1 w-fit">
                            <Users className="w-3 h-3" />
                            {globalReports}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPhone(entry.phone_number)} className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            Voir détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Affichage de {filteredEntries.length} sur {entries.length} signalements
          </p>
        </CardContent>
      </Card>

      <Dialog open={!!selectedPhone} onOpenChange={() => setSelectedPhone(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-destructive" />
              Détails du numéro {selectedPhone}
            </DialogTitle>
          </DialogHeader>
          {selectedPhone && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total signalements</span>
                  <Badge variant="destructive">
                    {stats.get(selectedPhone)?.report_count || getReportsForPhone(selectedPhone).length}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Commentaires des livreurs</h4>
                {getReportsForPhone(selectedPhone).map((report) => (
                  <div key={report.id} className="p-4 rounded-lg border bg-card space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium">{report.courier_name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(report.created_at)}</span>
                    </div>
                    <div className="pl-6">
                      {report.reason ? (
                        <p className="text-sm text-foreground bg-muted/50 p-2 rounded">"{report.reason}"</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Aucun commentaire laissé</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlacklist;
