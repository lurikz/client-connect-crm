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
          className={`rounded-xl border border-border/50 bg-card p-3.5 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            snapshot.isDragging
              ? 'shadow-xl ring-2 ring-primary/20 scale-[1.02]'
              : 'shadow-sm hover:shadow-md hover:border-border/80'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="font-semibold text-sm text-foreground truncate">{client.name}</p>
          </div>
          {client.phone && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5 pl-9">
              <Phone className="h-3 w-3" /> {client.phone}
            </span>
          )}
          {client.notes && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 pl-9">
              <StickyNote className="h-3 w-3" />
              <span className="truncate">{client.notes}</span>
            </span>
          )}
        </div>
      )}
    </Draggable>
  );
}
