import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { KanbanBoard } from "@/components/KanbanBoard";
import { QuickAddDialog } from "@/components/QuickAddDialog";
import { getClients, createClient, updateClient } from "@/services/api";
import type { Client, KanbanStatus } from "@/types/client";
import { toast } from "@/hooks/use-toast";

export default function Pipeline() {
  const [clients, setClients] = useState<Client[]>([]);

  const load = useCallback(async () => {
    setClients(await getClients());
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: {
    name: string;
    phone: string;
    email: string;
    notes: string;
    status: KanbanStatus;
  }) => {
    try {
      const c = await createClient(data);
      setClients((prev) => [...prev, c]);
      toast({ title: "Lead adicionado!" });
    } catch {
      toast({ title: "Erro ao criar lead", variant: "destructive" });
    }
  };

  const handleMove = async (id: string, newStatus: KanbanStatus) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    try {
      await updateClient(id, { status: newStatus });
    } catch {
      load();
      toast({ title: "Erro ao mover cliente", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funil de Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Arraste e solte para mover clientes entre etapas
          </p>
        </div>
        <QuickAddDialog onSubmit={handleCreate} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <KanbanBoard clients={clients} onMove={handleMove} />
      </motion.div>
    </div>
  );
}
