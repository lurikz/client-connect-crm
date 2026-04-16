import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FileBarChart, Download, TrendingUp, Users, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClients, getDeals, getActivities } from "@/services/api";
import type { Client, Deal, Activity } from "@/types/client";
import { KANBAN_COLUMNS } from "@/types/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["hsl(262 70% 55%)", "hsl(210 80% 55%)", "hsl(25 85% 53%)", "hsl(45 85% 50%)", "hsl(152 60% 42%)"];

export default function Reports() {
  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const load = useCallback(async () => {
    const [c, d, a] = await Promise.all([getClients(), getDeals(), getActivities()]);
    setClients(c);
    setDeals(d);
    setActivities(a);
  }, []);
  useEffect(() => { load(); }, [load]);

  const funnelData = useMemo(() =>
    KANBAN_COLUMNS.map(col => ({
      name: col.label,
      clientes: clients.filter(c => c.status === col.id).length,
      valor: deals.filter(d => d.stage === col.id).reduce((s, d) => s + d.value, 0),
    })), [clients, deals]);

  const conversionData = useMemo(() => {
    const total = clients.length || 1;
    return KANBAN_COLUMNS.map(col => ({
      name: col.label,
      taxa: Math.round((clients.filter(c => c.status === col.id).length / total) * 100),
    }));
  }, [clients]);

  const summary = useMemo(() => {
    const totalClients = clients.length;
    const totalRevenue = deals.filter(d => d.stage === 'closed').reduce((s, d) => s + d.value, 0);
    const pipelineValue = deals.filter(d => d.stage !== 'closed').reduce((s, d) => s + d.value, 0);
    const completedActivities = activities.filter(a => a.completed).length;
    const conversion = totalClients > 0 ? Math.round((clients.filter(c => c.status === 'closed').length / totalClients) * 100) : 0;
    return { totalClients, totalRevenue, pipelineValue, completedActivities, conversion };
  }, [clients, deals, activities]);

  const fmt = (v: number) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground text-sm mt-1">Análises executivas do seu CRM</p>
        </div>
        <Button variant="outline" className="gap-2" disabled>
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Clientes", value: summary.totalClients, icon: Users },
          { label: "Receita", value: fmt(summary.totalRevenue), icon: DollarSign },
          { label: "Pipeline", value: fmt(summary.pipelineValue), icon: TrendingUp },
          { label: "Conversão", value: `${summary.conversion}%`, icon: BarChart3 },
          { label: "Atividades", value: summary.completedActivities, icon: FileBarChart },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass glass-hover">
              <CardContent className="p-4">
                <m.icon className="h-4 w-4 text-primary mb-2" />
                <p className="text-lg font-bold">{m.value}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Performance do Funil</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={funnelData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240 6% 90%)", fontSize: 12 }} />
                    <Bar dataKey="clientes" name="Clientes" fill="hsl(262 70% 55%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="glass h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Conversão por Etapa</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={conversionData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240 6% 90%)", fontSize: 12 }} />
                    <Line type="monotone" dataKey="taxa" name="Taxa %" stroke="hsl(262 70% 55%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(262 70% 55%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Pie + Table */}
      <div className="grid gap-6 lg:grid-cols-5">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Distribuição</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={funnelData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="clientes" stroke="none" paddingAngle={3}>
                        {funnelData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
                    {funnelData.map((d, i) => (
                      <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />{d.name}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="glass h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Detalhamento</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b text-[11px] text-muted-foreground uppercase tracking-wider text-left">
                        <th className="pb-2 pr-3">Cliente</th>
                        <th className="pb-2 pr-3">Status</th>
                        <th className="pb-2 pr-3">Valor</th>
                        <th className="pb-2">Contato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(c => {
                        const col = KANBAN_COLUMNS.find(k => k.id === c.status);
                        return (
                          <tr key={c.id} className="border-b last:border-0 hover:bg-accent/30 transition-colors">
                            <td className="py-2.5 pr-3 font-medium">{c.name}</td>
                            <td className="py-2.5 pr-3">
                              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-medium">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${col?.color})` }} />{col?.label}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">{c.deal_value > 0 ? fmt(c.deal_value) : "—"}</td>
                            <td className="py-2.5 text-muted-foreground text-xs">{c.email || c.phone || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">Sem dados</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
