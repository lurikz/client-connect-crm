export type KanbanStatus = 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'closed';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: KanbanStatus;
  created_at: string;
}

export const KANBAN_COLUMNS: { id: KanbanStatus; label: string; color: string }[] = [
  { id: 'lead', label: 'Lead', color: '217 91% 60%' },
  { id: 'contacted', label: 'Contato Feito', color: '262 83% 58%' },
  { id: 'proposal', label: 'Proposta Enviada', color: '25 95% 53%' },
  { id: 'negotiation', label: 'Negociação', color: '45 93% 47%' },
  { id: 'closed', label: 'Fechado', color: '142 71% 45%' },
];
