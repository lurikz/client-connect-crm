import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Eye, Building2, Tag, X, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getClients, createClient, updateClient, deleteClient, getTimeline, getActivities } from "@/services/api";
import type { Client, KanbanStatus, TimelineEvent, Activity } from "@/types/client";
import { KANBAN_COLUMNS, ORIGINS } from "@/types/client";
import { toast } from "@/hooks/use-toast";

function ClientDetailSheet({ client, open, onClose }: { client: Client | null; open: boolean; onClose: () => void }) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [acts, setActs] = useState<Activity[]>([]);

  useEffect(() => {
    if (client) {
      getTimeline(client.id).then(setTimeline);
      getActivities().then(a => setActs(a.filter(x => x.client_id === client.id)));
    }
  }, [client]);

  if (!client) return null;
  const col = KANBAN_COLUMNS.find(k => k.id === client.status);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg glass border-border/50 overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{client.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <SheetTitle className="text-lg">{client.name}</SheetTitle>
              {client.company && <p className="text-sm text-muted-foreground">{client.company}</p>}
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Status</p>
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${col?.color})` }} />
                {col?.label}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Origem</p>
              <p className="text-sm">{client.origin || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Telefone</p>
              <p className="text-sm">{client.phone || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Email</p>
              <p className="text-sm truncate">{client.email || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Responsável</p>
              <p className="text-sm">{client.responsible || "—"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Valor</p>
              <p className="text-sm font-medium">R$ {(client.deal_value || 0).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {/* Tags */}
          {client.tags?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {client.tags.map(t => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Observações</p>
              <p className="text-sm bg-muted/40 rounded-lg p-3">{client.notes}</p>
            </div>
          )}

          {/* Activities */}
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Atividades ({acts.length})</p>
            {acts.length > 0 ? (
              <div className="space-y-2">
                {acts.slice(0, 5).map(a => (
                  <div key={a.id} className="text-sm p-2.5 rounded-lg bg-muted/30 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground">{a.type}</p>
                    </div>
                    <Badge variant={a.completed ? "default" : "secondary"} className="text-[10px]">
                      {a.completed ? "Concluída" : "Pendente"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Nenhuma atividade</p>}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Histórico</p>
            {timeline.length > 0 ? (
              <div className="space-y-2">
                {timeline.slice(-8).reverse().map(e => (
                  <div key={e.id} className="flex items-start gap-3 text-sm">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p>{e.description}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">Sem histórico</p>}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({ name: "", company: "", phone: "", email: "", notes: "", origin: "", responsible: "", tags: "", deal_value: "" });

  const load = useCallback(async () => { setClients(await getClients()); }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const c = await createClient({
        name: form.name.trim(),
        company: form.company.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        notes: form.notes.trim(),
        status: "lead" as KanbanStatus,
        origin: form.origin,
        responsible: form.responsible.trim(),
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        deal_value: parseFloat(form.deal_value) || 0,
      });
      setClients(prev => [...prev, c]);
      setForm({ name: "", company: "", phone: "", email: "", notes: "", origin: "", responsible: "", tags: "", deal_value: "" });
      setDialogOpen(false);
      toast({ title: "Cliente criado com sucesso!" });
    } catch {
      toast({ title: "Erro ao criar cliente", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    await deleteClient(id);
    setClients(prev => prev.filter(c => c.id !== id));
    toast({ title: "Cliente removido" });
  };

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie sua base de clientes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Nome completo" maxLength={100} className="bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Empresa</Label>
                  <Input value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="Nome da empresa" maxLength={100} className="bg-background/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Telefone / WhatsApp</Label>
                  <Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="(00) 00000-0000" maxLength={20} className="bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="email@empresa.com" maxLength={255} className="bg-background/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Origem</Label>
                  <Select value={form.origin} onValueChange={v => setForm(f => ({...f, origin: v}))}>
                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{ORIGINS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Responsável</Label>
                  <Input value={form.responsible} onChange={e => setForm(f => ({...f, responsible: e.target.value}))} placeholder="Nome" maxLength={50} className="bg-background/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Valor Potencial (R$)</Label>
                  <Input type="number" value={form.deal_value} onChange={e => setForm(f => ({...f, deal_value: e.target.value}))} placeholder="0" className="bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tags (separadas por vírgula)</Label>
                  <Input value={form.tags} onChange={e => setForm(f => ({...f, tags: e.target.value}))} placeholder="vip, urgente" maxLength={200} className="bg-background/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Observações</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Notas internas..." maxLength={500} rows={3} className="bg-background/50" />
              </div>
              <Button onClick={handleCreate} disabled={loading || !form.name.trim()} className="w-full gradient-primary text-primary-foreground">
                {loading ? "Salvando..." : "Salvar Cliente"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome, empresa ou email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50" maxLength={100} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {KANBAN_COLUMNS.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Client Table */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {filtered.length} cliente{filtered.length !== 1 && "s"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-[11px] text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 pr-4">Cliente</th>
                      <th className="pb-3 pr-4">Contato</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Valor</th>
                      <th className="pb-3 pr-4">Tags</th>
                      <th className="pb-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => {
                      const col = KANBAN_COLUMNS.find(k => k.id === c.status);
                      return (
                        <tr key={c.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors group">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-primary">{c.name.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{c.name}</p>
                                {c.company && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" />{c.company}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            <p className="text-sm">{c.phone || "—"}</p>
                            <p className="text-[11px]">{c.email || ""}</p>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${col?.color})` }} />
                              {col?.label}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-medium">
                            {c.deal_value > 0 ? `R$ ${c.deal_value.toLocaleString('pt-BR')}` : "—"}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-1">
                              {c.tags?.slice(0, 2).map(t => (
                                <Badge key={t} variant="secondary" className="text-[10px] py-0">{t}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedClient(c); setSheetOpen(true); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(c.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-14 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum cliente encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <ClientDetailSheet client={selectedClient} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
