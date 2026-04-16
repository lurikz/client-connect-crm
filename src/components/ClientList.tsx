import type { Client } from '@/types/client';
import { KANBAN_COLUMNS } from '@/types/client';

interface Props {
  clients: Client[];
}

export function ClientList({ clients }: Props) {
  if (!clients.length) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-sm">Nenhum cliente cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground text-xs uppercase tracking-wider">
            <th className="pb-3 pr-4">Cliente</th>
            <th className="pb-3 pr-4">Telefone</th>
            <th className="pb-3 pr-4">Email</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3">Observações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => {
            const col = KANBAN_COLUMNS.find((k) => k.id === c.status);
            return (
              <tr key={c.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{c.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">{c.phone || '—'}</td>
                <td className="py-3 pr-4 text-muted-foreground">{c.email || '—'}</td>
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${col?.color})` }} />
                    {col?.label ?? c.status}
                  </span>
                </td>
                <td className="py-3 text-muted-foreground truncate max-w-[200px]">{c.notes || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
