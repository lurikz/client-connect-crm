import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import type { KanbanStatus } from '@/types/client';

interface Props {
  onSubmit: (data: { name: string; phone: string; email: string; notes: string; status: KanbanStatus }) => void;
}

export function QuickAddDialog({ onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), phone: phone.trim(), email: '', notes: notes.trim(), status: 'lead' });
    setName('');
    setPhone('');
    setNotes('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle>Adicionar Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="q-name">Nome *</Label>
            <Input id="q-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do lead" required maxLength={100} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-phone">Telefone</Label>
            <Input id="q-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" maxLength={20} className="bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-notes">Observação</Label>
            <Textarea id="q-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas rápidas..." maxLength={500} rows={2} className="bg-background/50" />
          </div>
          <Button type="submit" disabled={!name.trim()} className="w-full gradient-primary text-primary-foreground">
            Adicionar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
