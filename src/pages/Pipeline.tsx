import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { KanbanBoard } from "@/components/KanbanBoard";
import { QuickAddDialog } from "@/components/QuickAddDialog";
import { getClients, createClient, updateClient } from "@/services/api";
import type { Client, KanbanStatus } from "@/types/client";
import { toast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { KANBAN_COLUMNS } from "@/types/client";
import { Badge } from "@/components/ui/badge";

export default function Pipeline() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const load = useCallback(async () => { setClients(await getClients()); }, []);
  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: {
    name: string; phone: string; email: string; notes: string; status: KanbanStatus;
    company?: string; origin?: string; responsible?: string; tags?: string[]; deal_value?: number;
  }) => {
    try {
      const c = await createClient({
        name: data.name, phone: data.phone, email: data.email, notes: data.notes,
        status: data.status, company: data.company || "", origin: data.origin || "",
        responsible: data.responsible || "", tags: data.tags || [], deal_value: data.deal_value || 0,
      });
      setClients(prev => [...prev, c]);
      toast({ title: "Lead adicionado!" });
    } catch { toast({ title: "Erro ao criar lead", variant: "destructive" }); }
  };

  const handleMove = async (id: string, newStatus: KanbanStatus) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, status: newStatus } : c)));
    try { await updateClient(id, { status: newStatus }); }
    catch { load(); toast({ title: "Erro ao mover", variant: "destructive" }); }
  };

  const col = selectedClient ? KANBAN_COLUMNS.find(k => k.id === selectedClient.status) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Funil de Vendas</h1>
          <p className="text-muted-foreground text-sm mt-1">Arraste e solte entre etapas</p>
        </div>
        <QuickAddDialog onSubmit={handleCreate} />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <KanbanBoard clients={clients} onMove={handleMove} onCardClick={(c) => setSelectedClient(c)} />
      </motion.div>

      {/* Side panel */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="w-full sm:max-w-md glass border-border/50 overflow-y-auto">
          {selectedClient && (
            <>
              <SheetHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{selectedClient.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <SheetTitle className="text-lg">{selectedClient.name}</SheetTitle>
                    {selectedClient.company && <p className="text-sm text-muted-foreground">{selectedClient.company}</p>}
                  </div>
                </div>
              </SheetHeader>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Status</p>
                    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${col?.color})` }} />
                      {col?.label}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Valor</p>
                    <p className="text-sm font-medium">R$ {(selectedClient.deal_value || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Telefone</p>
                    <p className="text-sm">{selectedClient.phone || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1">Email</p>
                    <p className="text-sm truncate">{selectedClient.email || "—"}</p>
                  </div>
                </div>
                {selectedClient.tags?.length > 0 && (
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedClient.tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                    </div>
                  </div>
                )}
                {selectedClient.notes && (
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Notas</p>
                    <p className="text-sm bg-muted/40 rounded-lg p-3">{selectedClient.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
