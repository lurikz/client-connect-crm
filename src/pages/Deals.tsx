import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, DollarSign, TrendingUp, Trash2, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getDeals, createDeal, deleteDeal, getClients } from "@/services/api";
import type { Deal, Client, KanbanStatus } from "@/types/client";
import { KANBAN_COLUMNS } from "@/types/client";
import { toast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", client_id: "", value: "", probability: 50,
    stage: "lead" as KanbanStatus, responsible: "", expected_close: "", notes: "",
  });

  const load = useCallback(async () => {
    const [d, c] = await Promise.all([getDeals(), getClients()]);
    setDeals(d);
    setClients(c);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.client_id) return;
    const client = clients.find(c => c.id === form.client_id);
    const deal = await createDeal({
      title: form.title.trim(),
      client_id: form.client_id,
      client_name: client?.name || "",
      value: parseFloat(form.value) || 0,
      probability: form.probability,
      stage: form.stage,
      responsible: form.responsible.trim(),
      expected_close: form.expected_close,
      notes: form.notes.trim(),
    });
    setDeals(prev => [...prev, deal]);
    setForm({ title: "", client_id: "", value: "", probability: 50, stage: "lead", responsible: "", expected_close: "", notes: "" });
    setDialogOpen(false);
    toast({ title: "Negócio criado!" });
  };

  const handleDelete = async (id: string) => {
    await deleteDeal(id);
    setDeals(prev => prev.filter(d => d.id !== id));
    toast({ title: "Negócio removido" });
  };

  const stats = useMemo(() => {
    const totalValue = deals.reduce((s, d) => s + d.value, 0);
    const weightedValue = deals.reduce((s, d) => s + d.value * (d.probability / 100), 0);
    const closed = deals.filter(d => d.stage === 'closed').reduce((s, d) => s + d.value, 0);
    return { totalValue, weightedValue, closed, count: deals.length };
  }, [deals]);

  const stageData = useMemo(() =>
    KANBAN_COLUMNS.map(col => ({
      name: col.label,
      valor: deals.filter(d => d.stage === col.id).reduce((s, d) => s + d.value, 0),
      count: deals.filter(d => d.stage === col.id).length,
    })), [deals]);

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Negociações</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie oportunidades de vendas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Novo Negócio
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50 sm:max-w-lg">
            <DialogHeader><DialogTitle>Criar Negócio</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Título *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Nome do negócio" maxLength={100} className="bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cliente *</Label>
                  <Select value={form.client_id} onValueChange={v => setForm(f => ({...f, client_id: v}))}>
                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Valor (R$)</Label>
                  <Input type="number" value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))} placeholder="0" className="bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Etapa</Label>
                  <Select value={form.stage} onValueChange={v => setForm(f => ({...f, stage: v as KanbanStatus}))}>
                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>{KANBAN_COLUMNS.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Probabilidade: {form.probability}%</Label>
                <Slider value={[form.probability]} onValueChange={v => setForm(f => ({...f, probability: v[0]}))} max={100} step={5} className="py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Responsável</Label>
                  <Input value={form.responsible} onChange={e => setForm(f => ({...f, responsible: e.target.value}))} maxLength={50} className="bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Previsão Fechamento</Label>
                  <Input type="date" value={form.expected_close} onChange={e => setForm(f => ({...f, expected_close: e.target.value}))} className="bg-background/50" />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={!form.title.trim() || !form.client_id} className="w-full gradient-primary text-primary-foreground">
                Criar Negócio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Valor Total", value: fmt(stats.totalValue), icon: DollarSign, bg: "bg-primary/8", ic: "text-primary" },
          { label: "Previsão Ponderada", value: fmt(stats.weightedValue), icon: TrendingUp, bg: "bg-info/8", ic: "text-info" },
          { label: "Receita Fechada", value: fmt(stats.closed), icon: DollarSign, bg: "bg-success/8", ic: "text-success" },
          { label: "Total Negócios", value: stats.count, icon: Percent, bg: "bg-warning/8", ic: "text-warning" },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="glass glass-hover">
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
                  <m.icon className={`h-5 w-5 ${m.ic}`} />
                </div>
                <p className="text-xl font-bold">{m.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider">{m.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Valor por Etapa</CardTitle>
          </CardHeader>
          <CardContent>
            {deals.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stageData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240 6% 90%)", fontSize: 12 }} />
                  <Bar dataKey="valor" name="Valor (R$)" fill="hsl(262 70% 55%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">Crie negócios para ver gráficos</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Deals List */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Negócios ({deals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deals.length > 0 ? (
              <div className="space-y-2">
                {deals.map((d, i) => {
                  const col = KANBAN_COLUMNS.find(k => k.id === d.stage);
                  return (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border/30 hover:bg-accent/30 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{d.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">{d.client_name}</span>
                          <span className="text-[11px] text-muted-foreground">•</span>
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${col?.color})` }} />
                            {col?.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{fmt(d.value)}</p>
                        <p className="text-[11px] text-muted-foreground">{d.probability}% prob.</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity" onClick={() => handleDelete(d.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-14 text-center">
                <DollarSign className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum negócio cadastrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
