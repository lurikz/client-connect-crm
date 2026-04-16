import { Draggable } from '@hello-pangea/dnd';
import type { Client } from '@/types/client';
import { Phone, StickyNote, Building2, DollarSign } from 'lucide-react';

interface Props {
  client: Client;
  index: number;
  onClick?: () => void;
}

export function KanbanCard({ client, index, onClick }: Props) {
  return (
    <Draggable draggableId={client.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`rounded-xl border border-border/40 bg-card p-4 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            snapshot.isDragging
              ? 'shadow-xl ring-2 ring-primary/15 scale-[1.02]'
              : 'shadow-sm hover:shadow-md hover:border-border/70'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{client.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{client.name}</p>
              {client.company && (
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Building2 className="h-3 w-3" />{client.company}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5 pl-[42px]">
            {client.deal_value > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                <DollarSign className="h-3 w-3 text-success" />
                R$ {client.deal_value.toLocaleString('pt-BR')}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Phone className="h-3 w-3" />{client.phone}
              </span>
            )}
            {client.notes && (
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <StickyNote className="h-3 w-3" />
                <span className="truncate">{client.notes}</span>
              </span>
            )}
          </div>
          {client.responsible && (
            <div className="mt-2.5 pt-2 border-t border-border/30 pl-[42px]">
              <span className="text-[10px] text-muted-foreground">Resp: {client.responsible}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
