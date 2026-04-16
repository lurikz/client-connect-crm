import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ClientForm } from '@/components/ClientForm';
import { ClientList } from '@/components/ClientList';
import { QuickAddDialog } from '@/components/QuickAddDialog';
import { getClients, createClient, updateClient } from '@/services/api';
import type { Client, KanbanStatus } from '@/types/client';
import { toast } from '@/hooks/use-toast';
import { LayoutDashboard, Users } from 'lucide-react';

export default function Index() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const data = await getClients();
    setClients(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: { name: string; phone: string; email: string; notes: string; status: KanbanStatus }) => {
    setLoading(true);
    try {
      const c = await createClient(data);
      setClients((prev) => [...prev, c]);
      toast({ title: 'Cliente criado!' });
    } catch {
      toast({ title: 'Erro ao criar cliente', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (id: string, newStatus: KanbanStatus) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));
    try {
      await updateClient(id, { status: newStatus });
    } catch {
      load();
      toast({ title: 'Erro ao mover cliente', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground tracking-tight">CRM Pipeline</h1>
          <QuickAddDialog onSubmit={handleCreate} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <Tabs defaultValue="kanban">
          <TabsList className="mb-6">
            <TabsTrigger value="kanban" className="gap-1.5">
              <LayoutDashboard className="h-4 w-4" /> Funil de Vendas
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-1.5">
              <Users className="h-4 w-4" /> Clientes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban">
            <KanbanBoard clients={clients} onMove={handleMove} />
          </TabsContent>

          <TabsContent value="clients">
            <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
              <div>
                <h2 className="text-lg font-semibold mb-4">Novo Cliente</h2>
                <ClientForm onSubmit={handleCreate} loading={loading} />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-4">Clientes Cadastrados ({clients.length})</h2>
                <ClientList clients={clients} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
