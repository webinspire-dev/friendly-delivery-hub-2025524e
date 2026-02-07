import { useState } from 'react';
import { useArticles, useCreateArticle, useUpdateArticle, useDeleteArticle, Article } from '@/hooks/useArticles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const emptyArticle = {
  title: '',
  title_ar: '',
  content: '',
  content_ar: '',
  excerpt: '',
  excerpt_ar: '',
  image_url: '',
  is_published: false,
};

const AdminArticles = () => {
  const { toast } = useToast();
  const { data: articles, isLoading } = useArticles(false);
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [formData, setFormData] = useState(emptyArticle);

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        title_ar: article.title_ar || '',
        content: article.content,
        content_ar: article.content_ar || '',
        excerpt: article.excerpt || '',
        excerpt_ar: article.excerpt_ar || '',
        image_url: article.image_url || '',
        is_published: article.is_published,
      });
    } else {
      setEditingArticle(null);
      setFormData(emptyArticle);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast({ title: "Erreur", description: "Le titre et le contenu sont requis", variant: "destructive" });
      return;
    }

    try {
      const articleData = {
        ...formData,
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (editingArticle?.id) {
        await updateArticle.mutateAsync({ id: editingArticle.id, ...articleData });
        toast({ title: "Article mis à jour" });
      } else {
        await createArticle.mutateAsync(articleData);
        toast({ title: "Article créé" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de sauvegarder l'article", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;
    try {
      await deleteArticle.mutateAsync(id);
      toast({ title: "Article supprimé" });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de supprimer l'article", variant: "destructive" });
    }
  };

  const handleTogglePublished = async (article: Article) => {
    try {
      await updateArticle.mutateAsync({
        id: article.id,
        is_published: !article.is_published,
        published_at: !article.is_published ? new Date().toISOString() : null,
      });
      toast({ title: article.is_published ? "Article dépublié" : "Article publié" });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de modifier le statut", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Articles ({articles?.length || 0})</h2>
          <p className="text-sm text-muted-foreground">Gérez les articles de la page Nouveautés</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArticle ? "Modifier l'article" : 'Nouvel article'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Titre (FR) *</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Titre de l'article" />
                </div>
                <div className="space-y-2">
                  <Label>Titre (AR)</Label>
                  <Input value={formData.title_ar} onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })} placeholder="عنوان المقال" dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Résumé (FR)</Label>
                  <Textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} placeholder="Bref résumé..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Résumé (AR)</Label>
                  <Textarea value={formData.excerpt_ar} onChange={(e) => setFormData({ ...formData, excerpt_ar: e.target.value })} placeholder="ملخص قصير..." dir="rtl" rows={2} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contenu (FR) *</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Contenu de l'article..." rows={6} />
              </div>
              <div className="space-y-2">
                <Label>Contenu (AR)</Label>
                <Textarea value={formData.content_ar} onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })} placeholder="محتوى المقال..." dir="rtl" rows={6} />
              </div>
              <div className="space-y-2">
                <Label>URL de l'image</Label>
                <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={formData.is_published} onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} />
                <Label>Publier immédiatement</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={createArticle.isPending || updateArticle.isPending}>
                {(createArticle.isPending || updateArticle.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles?.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">{article.title}</TableCell>
                  <TableCell>
                    <Badge variant={article.is_published ? "default" : "secondary"}>
                      {article.is_published ? "Publié" : "Brouillon"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(article.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleTogglePublished(article)} title={article.is_published ? "Dépublier" : "Publier"}>
                        {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(article)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(article.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!articles || articles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun article. Créez votre premier article !
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminArticles;
