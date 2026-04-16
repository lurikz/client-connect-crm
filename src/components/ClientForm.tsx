import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { KanbanStatus } from '@/types/client';

interface Props {
  onSubmit: (data: { name: string; phone: string; email: string; notes: string; status: KanbanStatus }) => void;
  loading?: boolean;
}

export function ClientForm({ onSubmit, loading }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), phone: phone.trim(), email: email.trim(), notes: notes.trim(), status: 'lead' });
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do cliente" required maxLength={100} className="bg-background/50" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" maxLength={20} className="bg-background/50" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" maxLength={255} className="bg-background/50" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas sobre o cliente..." maxLength={500} rows={3} className="bg-background/50" />
      </div>
      <Button type="submit" disabled={loading || !name.trim()} className="w-full gradient-primary text-primary-foreground">
        {loading ? 'Salvando...' : 'Salvar Cliente'}
      </Button>
    </form>
  );
}
