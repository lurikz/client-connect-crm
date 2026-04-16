import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients } from "@/services/api";
import type { Client } from "@/types/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const PIE_COLORS = [
  "hsl(262 80% 55%)",
  "hsl(210 80% 55%)",
  "hsl(38 92% 50%)",
  "hsl(152 60% 45%)",
  "hsl(0 72% 55%)",
];

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);

  const load = useCallback(async () => {
    setClients(await getClients());
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const total = clients.length;
    const leads = clients.filter((c) => c.status === "lead").length;
    const closed = clients.filter((c) => c.status === "closed").length;
    const rate = total > 0 ? Math.round((closed / total) * 100) : 0;
    return { total, leads, closed, rate };
  }, [clients]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    clients.forEach((c) => {
      const label = { lead: "Lead", contacted: "Contato", proposal: "Proposta", negotiation: "Negociação", closed: "Fechado" }[c.status] || c.status;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [clients]);

  const metrics = [
    { label: "Clientes Ativos", value: stats.total, icon: Users, change: "+12%", positive: true, color: "primary" },
    { label: "Leads em Aberto", value: stats.leads, icon: UserPlus, change: "+8%", positive: true, color: "info" },
    { label: "Vendas Fechadas", value: stats.closed, icon: DollarSign, change: "+24%", positive: true, color: "success" },
    { label: "Taxa de Conversão", value: `${stats.rate}%`, icon: TrendingUp, change: stats.rate > 20 ? "+5%" : "-2%", positive: stats.rate > 20, color: "warning" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Visão geral do seu CRM</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} custom={i} variants={cardVariants} initial="hidden" animate="visible">
            <Card className="glass glass-hover group cursor-default">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`h-10 w-10 rounded-xl bg-${m.color}/10 flex items-center justify-center`}>
                    <m.icon className={`h-5 w-5 text-${m.color}`} />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${m.positive ? "text-success" : "text-destructive"}`}>
                    {m.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {m.change}
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-tight">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={statusData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240 6% 90%)", fontSize: 13 }} />
                    <Bar dataKey="value" fill="hsl(262 80% 55%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Funil de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" stroke="none">
                      {statusData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240 6% 90%)", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
                  Nenhum dado disponível
                </div>
              )}
              {statusData.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {statusData.map((d, i) => (
                    <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      {d.name}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Clients */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Clientes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length > 0 ? (
              <div className="space-y-3">
                {clients.slice(-5).reverse().map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {c.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email || c.phone || "Sem contato"}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum cliente cadastrado ainda.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
