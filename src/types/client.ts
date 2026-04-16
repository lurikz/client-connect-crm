export type KanbanStatus = 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'closed';

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  notes: string;
  status: KanbanStatus;
  origin: string;
  responsible: string;
  tags: string[];
  deal_value: number;
  created_at: string;
}

export interface Activity {
  id: string;
  client_id: string;
  client_name: string;
  type: 'task' | 'call' | 'follow_up' | 'meeting' | 'note';
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  created_at: string;
}

export interface Deal {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  value: number;
  probability: number;
  stage: KanbanStatus;
  responsible: string;
  expected_close: string;
  notes: string;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  client_id: string;
  type: 'status_change' | 'note' | 'call' | 'task' | 'deal' | 'created';
  description: string;
  created_at: string;
}

export const KANBAN_COLUMNS: { id: KanbanStatus; label: string; color: string }[] = [
  { id: 'lead', label: 'Lead', color: '210 80% 55%' },
  { id: 'contacted', label: 'Contato Feito', color: '262 70% 55%' },
  { id: 'proposal', label: 'Proposta Enviada', color: '25 85% 53%' },
  { id: 'negotiation', label: 'Negociação', color: '45 85% 50%' },
  { id: 'closed', label: 'Fechado', color: '152 60% 42%' },
];

export const ORIGINS = ['Site', 'Indicação', 'Redes Sociais', 'Cold Call', 'Evento', 'Outro'];
export const ACTIVITY_TYPES = [
  { id: 'task' as const, label: 'Tarefa', icon: 'CheckSquare' },
  { id: 'call' as const, label: 'Ligação', icon: 'Phone' },
  { id: 'follow_up' as const, label: 'Follow-up', icon: 'MessageSquare' },
  { id: 'meeting' as const, label: 'Reunião', icon: 'Calendar' },
  { id: 'note' as const, label: 'Nota', icon: 'StickyNote' },
];
