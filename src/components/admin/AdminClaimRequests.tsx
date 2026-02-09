import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Send, X, RefreshCw, Copy, Check } from 'lucide-react';

interface ClaimRequest {
  id: string;
  courier_id: string;
  phone_number: string;
  verification_code: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  courier_name?: string;
}

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const AdminClaimRequests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ClaimRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('claim_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    // Fetch courier names
    const courierIds = [...new Set((data || []).map(r => r.courier_id))];
    const { data: couriers } = await supabase
      .from('courier_profiles')
      .select('id, full_name')
      .in('id', courierIds);

    const courierMap = Object.fromEntries((couriers || []).map(c => [c.id, c.full_name]));

    setRequests((data || []).map(r => ({ ...r, courier_name: courierMap[r.courier_id] || 'Inconnu' })));
    // Pre-generate codes for pending requests
    const newCodes: Record<string, string> = {};
    (data || []).filter(r => r.status === 'pending').forEach(r => {
      newCodes[r.id] = generateCode();
    });
    setCodes(prev => ({ ...prev, ...newCodes }));
    setIsLoading(false);
  };

  const handleSendCode = async (requestId: string) => {
    const code = codes[requestId];
    if (!code || code.length !== 6) return;

    const { error } = await supabase
      .from('claim_requests')
      .update({ verification_code: code, status: 'code_sent' })
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }

    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'code_sent', verification_code: code } : r));
    toast({ title: 'Code enregistré', description: `Code ${code} enregistré. Envoyez-le au livreur via WhatsApp.` });
  };

  const handleReject = async (requestId: string) => {
    const { error } = await supabase
      .from('claim_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }

    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
    toast({ title: 'Demande rejetée' });
  };

  const handleCopyCode = (requestId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(requestId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openWhatsApp = (phone: string, code: string) => {
    const formatted = phone.replace(/^0/, '+212');
    const message = encodeURIComponent(`Votre code de vérification pour réclamer votre profil sur Livreur Autour de Moi est : ${code}`);
    window.open(`https://wa.me/${formatted}?text=${message}`, '_blank');
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">En attente</Badge>;
      case 'code_sent': return <Badge className="bg-blue-500 hover:bg-blue-500/80">Code envoyé</Badge>;
      case 'verified': return <Badge className="bg-green-500 hover:bg-green-500/80">Vérifié</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejeté</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{requests.length} demande(s)</p>
        <Button variant="outline" size="sm" onClick={fetchRequests}>
          <RefreshCw className="w-4 h-4 mr-2" />Actualiser
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>Aucune demande de réclamation pour le moment.</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livreur</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.courier_name}</TableCell>
                  <TableCell>{req.phone_number}</TableCell>
                  <TableCell>{statusBadge(req.status)}</TableCell>
                  <TableCell>
                    {req.status === 'pending' ? (
                      <Input
                        value={codes[req.id] || ''}
                        onChange={(e) => setCodes(prev => ({ ...prev, [req.id]: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        className="w-24 text-center font-mono"
                        placeholder="6 chiffres"
                      />
                    ) : req.verification_code ? (
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm">{req.verification_code}</span>
                        <button onClick={() => handleCopyCode(req.id, req.verification_code!)} className="text-muted-foreground hover:text-foreground">
                          {copiedId === req.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(req.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSendCode(req.id)} disabled={!codes[req.id] || codes[req.id].length !== 6}>
                          <Send className="w-3 h-3 mr-1" />Valider
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                    {req.status === 'code_sent' && req.verification_code && (
                      <Button size="sm" variant="outline" onClick={() => openWhatsApp(req.phone_number, req.verification_code!)}>
                        Envoyer via WhatsApp
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminClaimRequests;
