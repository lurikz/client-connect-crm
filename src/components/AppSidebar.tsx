import {
  LayoutDashboard, Users, Kanban, FileBarChart, Shield, Settings,
  CalendarCheck, DollarSign,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Funil de Vendas", url: "/pipeline", icon: Kanban },
  { title: "Atividades", url: "/activities", icon: CalendarCheck },
  { title: "Negociações", url: "/deals", icon: DollarSign },
  { title: "Relatórios", url: "/reports", icon: FileBarChart },
];

const systemItems = [
  { title: "Controle de Acesso", url: "/access", icon: Shield },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => path === "/" ? currentPath === "/" : currentPath.startsWith(path);

  const renderItems = (items: typeof mainItems) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={isActive(item.url)}>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="hover:bg-accent/50 rounded-lg transition-all duration-200"
            activeClassName="bg-accent text-primary font-medium"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="pt-4">
        <div className="px-4 pb-4 mb-2">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                CRM<span className="text-primary">Pro</span>
              </span>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center mx-auto">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold">Principal</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(mainItems)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-semibold">Sistema</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{renderItems(systemItems)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
