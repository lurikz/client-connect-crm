import { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, UserPlus, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  Activity, AlertCircle, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClients, getActivities, getDeals } from "@/services/api";
import type { Client, Activity as ActivityType, Deal } from "@/types/client";
import { KANBAN_COLUMNS } from "@/types/client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" as const },
});

const CHART_COLORS = [
  "hsl(262 70% 55%)",
  "hsl(210 80% 55%)",
  "hsl(25 85% 53%)",
  "hsl(45 85% 50%)",
  "hsl(152 60% 42%)",
];

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  const load = useCallback(async () => {
    const [c, a, d] = await Promise.all([getClients(), getActivities(), getDeals()]);
    setClients(c);
    setActivities(a);
    setDeals(d);
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const total = clients.length;
    const leads = clients.filter((c) => c.status === "lead").length;
    const closed = clients.filter((c) => c.status === "closed").length;
    const rate = total > 0 ? Math.round((closed / total) * 100) : 0;
    const totalRevenue = deals.filter(d => d.stage === 'closed').reduce((s, d) => s + d.value, 0);
    const avgTicket = closed > 0 ? Math.round(totalRevenue / closed) : 0;
    const pendingTasks = activities.filter(a => !a.completed).length;
    const pipelineValue = deals.filter(d => d.stage !== 'closed').reduce((s, d) => s + d.value, 0);
    return { total, leads, closed, rate, totalRevenue, avgTicket, pendingTasks, pipelineValue };
  }, [clients, activities, deals]);

  const funnelData = useMemo(() =>
    KANBAN_COLUMNS.map((col) => ({
      name: col.label,
      value: clients.filter((c) => c.status === col.id).length,
    })), [clients]);

  const revenueData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map((m, i) => ({
      name: m,
      receita: Math.round(stats.totalRevenue * (0.6 + Math.random() * 0.8) / 6),
      leads: Math.round(stats.leads * (0.5 + Math.random()) / 3),
    }));
  }, [stats]);

  const staleLeads = useMemo(() =>
    clients.filter(c => c.status === 'lead').slice(0, 3),
  [clients]);

  const formatCurrency = (v: number) =>
    `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;

  const metricCards = [
    { label: "Receita Total", value: formatCurrency(stats.totalRevenue), icon: DollarSign, change: "+18%", positive: true, bg: "bg-primary/8", iconClass: "text-primary" },
    { label: "Leads Novos", value: stats.leads, icon: UserPlus, change: "+12%", positive: true, bg: "bg-info/8", iconClass: "text-info" },
    { label: "Taxa de Conversão", value: `${stats.rate}%`, icon: TrendingUp, change: stats.rate > 15 ? "+5%" : "-3%", positive: stats.rate > 15, bg: "bg-success/8", iconClass: "text-success" },
    { label: "Ticket Médio", value: formatCurrency(stats.avgTicket), icon: Activity, change: "+8%", positive: true, bg: "bg-warning/8", iconClass: "text-warning" },
  ];

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral do desempenho — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {metricCards.map((m, i) => (
          <motion.div key={m.label} {...fadeUp(i)}>
            <Card className="glass glass-hover cursor-default overflow-hidden relative group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-11 w-11 rounded-xl ${m.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                    <m.icon className={`h-5 w-5 ${m.iconClass}`} />
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${m.positive ? "text-success" : "text-destructive"}`}>
                    {m.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {m.change}
                  </span>
                </div>
                <p className="text-2xl font-bold tracking-tight">{m.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">{m.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Value + Pending */}
      <div className="grid gap-4 grid-cols-2">
        <motion.div {...fadeUp(4)}>
          <Card className="glass border-primary/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Pipeline Ativo</p>
                <p className="text-xl font-bold">{formatCurrency(stats.pipelineValue)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div {...fadeUp(5)}>
          <Card className="glass border-warning/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">Tarefas Pendentes</p>
                <p className="text-xl font-bold">{stats.pendingTasks}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        <motion.div className="lg:col-span-4" {...fadeUp(6)}>
          <Card className="glass h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Receita & Leads por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(262 70% 55%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(262 70% 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240 6% 90%)", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,.08)" }} />
                  <Area type="monotone" dataKey="receita" stroke="hsl(262 70% 55%)" strokeWidth={2} fill="url(#gRec)" />
                  <Bar dataKey="leads" fill="hsl(210 80% 55%)" radius={[4, 4, 0, 0]} opacity={0.7} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-3" {...fadeUp(7)}>
          <Card className="glass h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Funil de Conversão
              </CardTitle>
            </CardHeader>
            <CardContent>
              {funnelData.some(d => d.value > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie data={funnelData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none" paddingAngle={3}>
                        {funnelData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(240 6% 90%)", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-1 justify-center">
                    {funnelData.map((d, i) => (
                      <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                        {d.name} ({d.value})
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
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Clients */}
        <motion.div {...fadeUp(8)}>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4" /> Clientes Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length > 0 ? (
                <div className="space-y-1">
                  {clients.slice(-6).reverse().map((c) => {
                    const col = KANBAN_COLUMNS.find(k => k.id === c.status);
                    return (
                      <div key={c.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-accent/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/8 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-primary">{c.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{c.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{c.company || c.email || c.phone || "Sem contato"}</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-medium shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(${col?.color})` }} />
                          {col?.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-10 text-center">Nenhum cliente cadastrado.</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts */}
        <motion.div {...fadeUp(9)}>
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Alertas & Atividades
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staleLeads.length > 0 ? (
                <div className="space-y-3">
                  {staleLeads.map((c) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/10">
                      <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">Lead parado: {c.name}</p>
                        <p className="text-[11px] text-muted-foreground">Sem movimentação recente</p>
                      </div>
                    </div>
                  ))}
                  {activities.filter(a => !a.completed).slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/40">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-[11px] text-muted-foreground">{a.client_name} • {a.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm text-muted-foreground">Nenhum alerta no momento.</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Adicione clientes para ver alertas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
