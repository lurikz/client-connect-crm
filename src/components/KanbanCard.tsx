import { Draggable } from '@hello-pangea/dnd';
import type { Client } from '@/types/client';
import { Phone, StickyNote } from 'lucide-react';

interface Props {
  client: Client;
  index: number;
}

export function KanbanCard({ client, index }: Props) {
  return (
    <Draggable draggableId={client.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-lg border bg-card p-3 shadow-sm transition-shadow ${
            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/30' : ''
          }`}
        >
          <p className="font-semibold text-sm text-foreground truncate">{client.name}</p>
          {client.phone && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Phone className="h-3 w-3" /> {client.phone}
            </span>
          )}
          {client.notes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <StickyNote className="h-3 w-3" />
              <span className="truncate">{client.notes}</span>
            </span>
          )}
        </div>
      )}
    </Draggable>
  );
}
