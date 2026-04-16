import { Droppable } from '@hello-pangea/dnd';
import type { Client, KanbanStatus } from '@/types/client';
import { KanbanCard } from './KanbanCard';

interface Props {
  id: KanbanStatus;
  label: string;
  color: string;
  clients: Client[];
}

export function KanbanColumn({ id, label, color, clients }: Props) {
  return (
    <div className="flex flex-col min-w-[240px] w-[260px] shrink-0">
      <div
        className="flex items-center gap-2 rounded-t-lg px-3 py-2"
        style={{ backgroundColor: `hsl(${color} / 0.15)` }}
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: `hsl(${color})` }}
        />
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="ml-auto text-xs text-muted-foreground">{clients.length}</span>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2 rounded-b-lg border border-t-0 p-2 min-h-[200px] transition-colors ${
              snapshot.isDraggingOver ? 'bg-accent/50' : 'bg-muted/30'
            }`}
          >
            {clients.map((c, i) => (
              <KanbanCard key={c.id} client={c} index={i} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
