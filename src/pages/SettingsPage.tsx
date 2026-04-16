import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Kanban, FileBarChart, Shield, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Module {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

const defaultModules: Module[] = [
  { id: "pipeline", name: "Funil de Vendas", description: "Kanban com drag & drop para gestão de leads", icon: Kanban, enabled: true },
  { id: "clients", name: "Gestão de Clientes", description: "Cadastro e listagem completa de clientes", icon: Users, enabled: true },
  { id: "reports", name: "Relatórios", description: "Análises visuais e detalhamento por cliente", icon: FileBarChart, enabled: true },
  { id: "access", name: "Controle de Acesso", description: "Cargos e permissões multiusuário", icon: Shield, enabled: true },
];

export default function SettingsPage() {
  const [modules, setModules] = useState<Module[]>(defaultModules);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
    toast({ title: "Configuração salva" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize os módulos do sistema</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              Módulos do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-accent/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <mod.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{mod.name}</Label>
                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                  </div>
                </div>
                <Switch checked={mod.enabled} onCheckedChange={() => toggleModule(mod.id)} />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.3 }}>
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Sobre o Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">CRM Pro</strong> — Sistema de gestão de relacionamento com clientes</p>
            <p>Versão 1.0.0</p>
            <p>Projetado para empresas de pequeno e médio porte</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
