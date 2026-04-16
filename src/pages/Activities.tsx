import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Plus, CheckSquare, Phone, MessageSquare, Calendar as CalendarIcon,
  StickyNote, Clock, CheckCircle2, Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getActivities, createActivity, updateActivity, deleteActivity, getClients } from "@/services/api";
import type { Activity, Client } from "@/types/client";
import { ACTIVITY_TYPES } from "@/types/client";
import { toast } from "@/hooks/use-toast";

const typeIcons: Record<string, React.ElementType> = {
  task: CheckSquare, call: Phone, follow_up: MessageSquare, meeting: CalendarIcon, note: StickyNote,
};

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [form, setForm] = useState({ title: "", description: "", type: "task" as Activity["type"], client_id: "", due_date: "" });

  const load = useCallback(async () => {
    const [a, c] = await Promise.all([getActivities(), getClients()]);
    setActivities(a);
    setClients(c);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.client_id) return;
    const client = clients.find(c => c.id === form.client_id);
    const act = await createActivity({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      client_name: client?.name || "",
      due_date: form.due_date || new Date().toISOString(),
    });
    setActivities(prev => [...prev, act]);
    setForm({ title: "", description: "", type: "task", client_id: "", due_date: "" });
    setDialogOpen(false);
    toast({ title: "Atividade criada!" });
  };

  const toggleComplete = async (id: string) => {
    const act = activities.find(a => a.id === id);
    if (!act) return;
    await updateActivity(id, { completed: !act.completed });
    setActivities(prev => prev.map(a => a.id === id ? { ...a, completed: !a.completed } : a));
    toast({ title: act.completed ? "Reaberta" : "Concluída!" });
  };

  const handleDelete = async (id: string) => {
    await deleteActivity(id);
    setActivities(prev => prev.filter(a => a.id !== id));
    toast({ title: "Atividade removida" });
  };

  const pending = activities.filter(a => !a.completed);
  const completed = activities.filter(a => a.completed);
  const filtered = (list: Activity[]) =>
    filter === "all" ? list : list.filter(a => a.type === filter);

  const renderList = (list: Activity[], empty: string) => {
    const items = filtered(list);
    if (!items.length) return <p className="text-sm text-muted-foreground py-8 text-center">{empty}</p>;
    return (
      <div className="space-y-2">
        {items.map((a, i) => {
          const Icon = typeIcons[a.type] || CheckSquare;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`flex items-center gap-3 p-3.5 rounded-xl border border-border/30 hover:bg-accent/30 transition-all group ${a.completed ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => toggleComplete(a.id)}
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  a.completed ? 'bg-success/10 text-success' : 'bg-primary/8 text-primary hover:bg-primary/15'
                }`}
              >
                {a.completed ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${a.completed ? 'line-through' : ''}`}>{a.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-muted-foreground">{a.client_name}</span>
                  <span className="text-[11px] text-muted-foreground">•</span>
                  <Badge variant="secondary" className="text-[10px] py-0 h-4">
                    {ACTIVITY_TYPES.find(t => t.id === a.type)?.label || a.type}
                  </Badge>
                  {a.due_date && (
                    <>
                      <span className="text-[11px] text-muted-foreground">•</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(a.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive transition-opacity"
                onClick={() => handleDelete(a.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-[1000px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Atividades</h1>
          <p className="text-muted-foreground text-sm mt-1">Tarefas, ligações e follow-ups</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Nova Atividade
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader><DialogTitle>Criar Atividade</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-1">
              <div className="space-y-1.5">
                <Label className="text-xs">Título *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="Ex: Ligar para cliente" maxLength={100} className="bg-background/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({...f, type: v as Activity["type"]}))}>
                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>{ACTIVITY_TYPES.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cliente *</Label>
                  <Select value={form.client_id} onValueChange={v => setForm(f => ({...f, client_id: v}))}>
                    <SelectTrigger className="bg-background/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Data de Vencimento</Label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({...f, due_date: e.target.value}))} className="bg-background/50" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} maxLength={500} rows={2} className="bg-background/50" />
              </div>
              <Button onClick={handleCreate} disabled={!form.title.trim() || !form.client_id} className="w-full gradient-primary text-primary-foreground">
                Criar Atividade
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <Card className="glass">
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <Button variant={filter === "all" ? "default" : "ghost"} size="sm" onClick={() => setFilter("all")} className="text-xs h-8">Todas</Button>
            {ACTIVITY_TYPES.map(t => (
              <Button key={t.id} variant={filter === t.id ? "default" : "ghost"} size="sm" onClick={() => setFilter(t.id)} className="text-xs h-8">{t.label}</Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Pendentes ({filtered(pending).length})</TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> Concluídas ({filtered(completed).length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <Card className="glass">
            <CardContent className="p-4">{renderList(pending, "Nenhuma atividade pendente")}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <Card className="glass">
            <CardContent className="p-4">{renderList(completed, "Nenhuma atividade concluída")}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
