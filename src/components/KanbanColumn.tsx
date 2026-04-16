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
    <div className="flex flex-col min-w-[260px] w-[280px] shrink-0">
      <div
        className="flex items-center gap-2.5 rounded-t-xl px-4 py-3"
        style={{ backgroundColor: `hsl(${color} / 0.1)` }}
      >
        <span
          className="h-2.5 w-2.5 rounded-full ring-2 ring-offset-1"
          style={{ backgroundColor: `hsl(${color})`, ringColor: `hsl(${color} / 0.3)` }}
        />
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">
          {clients.length}
        </span>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2.5 rounded-b-xl border border-t-0 border-border/50 p-3 min-h-[220px] transition-all duration-300 ${
              snapshot.isDraggingOver ? 'bg-accent/60 border-primary/20' : 'bg-muted/20'
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
