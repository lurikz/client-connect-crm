import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Plus, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Role {
  id: string;
  name: string;
  permissions: { view: boolean; edit: boolean; delete: boolean };
}

const defaultRoles: Role[] = [
  { id: "1", name: "Administrador", permissions: { view: true, edit: true, delete: true } },
  { id: "2", name: "Gerente", permissions: { view: true, edit: true, delete: false } },
  { id: "3", name: "Vendedor", permissions: { view: true, edit: false, delete: false } },
];

export default function AccessControl() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles);
  const [newRoleName, setNewRoleName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const togglePermission = (roleId: string, perm: keyof Role["permissions"]) => {
    setRoles((prev) =>
      prev.map((r) =>
        r.id === roleId ? { ...r, permissions: { ...r.permissions, [perm]: !r.permissions[perm] } } : r
      )
    );
    toast({ title: "Permissão atualizada" });
  };

  const addRole = () => {
    if (!newRoleName.trim()) return;
    const role: Role = {
      id: crypto.randomUUID(),
      name: newRoleName.trim(),
      permissions: { view: true, edit: false, delete: false },
    };
    setRoles((prev) => [...prev, role]);
    setNewRoleName("");
    setDialogOpen(false);
    toast({ title: "Cargo criado!" });
  };

  const PermIcon = ({ enabled }: { enabled: boolean }) =>
    enabled ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground/40" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle de Acesso</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie cargos e permissões</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary text-primary-foreground shadow-md hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Novo Cargo
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-border/50">
            <DialogHeader>
              <DialogTitle>Criar Cargo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Cargo</Label>
                <Input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Ex: Supervisor"
                  maxLength={50}
                />
              </div>
              <Button onClick={addRole} disabled={!newRoleName.trim()} className="w-full">
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role, i) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="glass glass-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {role.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(["view", "edit", "delete"] as const).map((perm) => (
                  <div key={perm} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PermIcon enabled={role.permissions[perm]} />
                      <Label className="text-sm font-normal capitalize">
                        {{ view: "Visualizar", edit: "Editar", delete: "Excluir" }[perm]}
                      </Label>
                    </div>
                    <Switch
                      checked={role.permissions[perm]}
                      onCheckedChange={() => togglePermission(role.id, perm)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
