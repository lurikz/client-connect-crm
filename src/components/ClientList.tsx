import type { Client } from '@/types/client';
import { KANBAN_COLUMNS } from '@/types/client';
import { Badge } from '@/components/ui/badge';

interface Props {
  clients: Client[];
}

export function ClientList({ clients }: Props) {
  if (!clients.length) {
    return <p className="text-muted-foreground text-sm">Nenhum cliente cadastrado.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4">Nome</th>
            <th className="pb-2 pr-4">Telefone</th>
            <th className="pb-2 pr-4">Email</th>
            <th className="pb-2 pr-4">Status</th>
            <th className="pb-2">Observações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => {
            const col = KANBAN_COLUMNS.find((k) => k.id === c.status);
            return (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-2 pr-4 font-medium">{c.name}</td>
                <td className="py-2 pr-4">{c.phone || '—'}</td>
                <td className="py-2 pr-4">{c.email || '—'}</td>
                <td className="py-2 pr-4">
                  <Badge variant="secondary">{col?.label ?? c.status}</Badge>
                </td>
                <td className="py-2 text-muted-foreground truncate max-w-[200px]">{c.notes || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
