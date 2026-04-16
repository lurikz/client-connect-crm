import { Droppable } from '@hello-pangea/dnd';
import type { Client, KanbanStatus } from '@/types/client';
import { KanbanCard } from './KanbanCard';

interface Props {
  id: KanbanStatus;
  label: string;
  color: string;
  clients: Client[];
  onCardClick?: (client: Client) => void;
}

export function KanbanColumn({ id, label, color, clients, onCardClick }: Props) {
  return (
    <div className="flex flex-col min-w-[270px] w-[290px] shrink-0">
      <div
        className="flex items-center gap-2.5 rounded-t-xl px-4 py-3 border border-b-0 border-border/30"
        style={{ backgroundColor: `hsl(${color} / 0.06)` }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `hsl(${color})` }} />
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="ml-auto text-[11px] font-medium text-muted-foreground bg-background/70 px-2 py-0.5 rounded-full">{clients.length}</span>
      </div>
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 space-y-2.5 rounded-b-xl border border-t-0 border-border/30 p-3 min-h-[240px] transition-all duration-300 ${
              snapshot.isDraggingOver ? 'bg-accent/50 border-primary/20' : 'bg-muted/15'
            }`}
          >
            {clients.map((c, i) => (
              <KanbanCard key={c.id} client={c} index={i} onClick={() => onCardClick?.(c)} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
