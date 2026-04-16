import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import type { Client, KanbanStatus } from '@/types/client';
import { KANBAN_COLUMNS } from '@/types/client';
import { KanbanColumn } from './KanbanColumn';

interface Props {
  clients: Client[];
  onMove: (clientId: string, newStatus: KanbanStatus) => void;
}

export function KanbanBoard({ clients, onMove }: Props) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as KanbanStatus;
    if (result.source.droppableId !== newStatus) {
      onMove(result.draggableId, newStatus);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            {...col}
            clients={clients.filter((c) => c.status === col.id)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
