import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import type { KanbanStatus } from '@/types/client';
import { ORIGINS } from '@/types/client';

interface Props {
  onSubmit: (data: {
    name: string; phone: string; email: string; notes: string; status: KanbanStatus;
    company?: string; origin?: string; responsible?: string; tags?: string[]; deal_value?: number;
  }) => void;
}

export function QuickAddDialog({ onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '', email: '', notes: '', origin: '', responsible: '', deal_value: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(),
      notes: form.notes.trim(), status: 'lead', company: form.company.trim(),
      origin: form.origin, responsible: form.responsible.trim(),
      deal_value: parseFloat(form.deal_value) || 0, tags: [],
    });
    setForm({ name: '', company: '', phone: '', email: '', notes: '', origin: '', responsible: '', deal_value: '' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Lead Rápido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nome *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Nome" required maxLength={100} className="bg-background/50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Empresa</Label>
              <Input value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} placeholder="Empresa" maxLength={100} className="bg-background/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Telefone</Label>
              <Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="(00) 00000-0000" maxLength={20} className="bg-background/50" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Valor (R$)</Label>
              <Input type="number" value={form.deal_value} onChange={e => setForm(f => ({...f, deal_value: e.target.value}))} placeholder="0" className="bg-background/50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Observação</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} maxLength={500} rows={2} className="bg-background/50" placeholder="Notas rápidas..." />
          </div>
          <Button type="submit" disabled={!form.name.trim()} className="w-full gradient-primary text-primary-foreground">
            Adicionar ao Funil
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
