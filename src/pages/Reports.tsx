import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FileBarChart, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClients } from "@/services/api";
import type { Client } from "@/types/client";
import { KANBAN_COLUMNS } from "@/types/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Reports() {
  const [clients, setClients] = useState<Client[]>([]);

  const load = useCallback(async () => {
    setClients(await getClients());
  }, []);

  useEffect(() => { load(); }, [load]);

  const statusReport = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => ({
      name: col.label,
      total: clients.filter((c) => c.status === col.id).length,
    }));
  }, [clients]);

  const summary = useMemo(() => {
    const total = clients.length;
    const closed = clients.filter((c) => c.status === "closed").length;
    const lost = 0; // placeholder
    const active = total - closed - lost;
    return { total, closed, active, lost, conversion: total > 0 ? Math.round((closed / total) * 100) : 0 };
  }, [clients]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground text-sm mt-1">Análises visuais do seu pipeline</p>
        </div>
        <Button variant="outline" className="gap-2" disabled>
          <Download className="h-4 w-4" /> Exportar
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total de Clientes", value: summary.total },
          { label: "Ativos no Funil", value: summary.active },
          { label: "Fechados", value: summary.closed },
          { label: "Conversão", value: `${summary.conversion}%` },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="glass glass-hover">
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Bar chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-primary" />
              Clientes por Etapa do Funil
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={statusReport}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240 6% 90%)", fontSize: 13 }} />
                  <Legend />
                  <Bar dataKey="total" name="Clientes" fill="hsl(262 80% 55%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">
                Adicione clientes para ver relatórios
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Client details table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Detalhamento por Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground text-xs uppercase tracking-wider">
                      <th className="pb-3 pr-4">Cliente</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Contato</th>
                      <th className="pb-3">Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => {
                      const col = KANBAN_COLUMNS.find((k) => k.id === c.status);
                      return (
                        <tr key={c.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                          <td className="py-3 pr-4 font-medium">{c.name}</td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${col?.color})` }} />
                              {col?.label}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{c.email || c.phone || "—"}</td>
                          <td className="py-3 text-muted-foreground truncate max-w-[200px]">{c.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum dado para relatório.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
