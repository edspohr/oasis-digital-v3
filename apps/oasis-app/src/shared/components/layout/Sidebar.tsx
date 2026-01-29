"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Map, 
  LogOut,
  ShieldAlert,
  GraduationCap,
  Calendar,
  Database
} from "lucide-react";
import { toast } from "sonner";

// Definimos la interfaz para los items del menú
interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

// Menú para Admins (Plataforma y Organización)
const adminRoutes: SidebarItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Journeys", href: "/admin/journeys", icon: Map },
  { title: "Usuarios", href: "/admin/participants", icon: Users },
  { title: "CRM", href: "/admin/crm", icon: Database },
  { title: "Recursos", href: "/admin/resources", icon: GraduationCap },
  { title: "Eventos", href: "/admin/events", icon: Calendar },
  { title: "Configuración", href: "/settings", icon: Settings },
];

// Menú para Participantes
const participantRoutes: SidebarItem[] = [
  { title: "Inicio", href: "/participant", icon: LayoutDashboard },
  { title: "Mis Viajes", href: "/participant/journey", icon: Map },
  { title: "Eventos", href: "/participant/events", icon: Calendar },
  { title: "Recursos", href: "/participant/resources", icon: GraduationCap },
  { title: "Comunidad", href: "/participant/community", icon: Users },
];

// Menú para Facilitadores
const facilitatorRoutes: SidebarItem[] = [
  { title: "Mi Panel", href: "/facilitator", icon: LayoutDashboard },
  { title: "Participantes", href: "/facilitator/participants", icon: Users },
  { title: "Journeys", href: "/facilitator/journeys", icon: Map },
  { title: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isLoading, signOut } = useAuth();

  // Función de Logout usando signOut del contexto
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Sesión cerrada");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logout", error);
      // Forzar redirección incluso si falla la API
      window.location.href = "/login";
    }
  };

  // Lógica de selección de menú (Tipada correctamente)
  let items: SidebarItem[] = [];

  if (!isLoading && profile) {
    // Verificamos is_platform_admin o el rol string (cast seguro)
    const role = (profile as any).role; // Cast temporal si el tipo falla
    const isAdmin = profile.is_platform_admin || role === 'admin' || role === 'owner';
    const isFacilitador = role === 'facilitador';

    if (isFacilitador) {
      items = facilitatorRoutes;
    } else if (isAdmin) {
      items = adminRoutes;
    } else {
      items = participantRoutes;
    }
  }

  if (isLoading) {
    return <div className="w-64 border-r bg-background p-4 hidden md:block">Cargando menú...</div>;
  }

  return (
    <div className="relative border-r bg-background pb-12 w-64 hidden md:flex md:flex-col h-screen">
      <div className="space-y-4 py-4 flex-1">
        <div className="px-3 py-2">
          <h2 className="mb-6 px-4 text-xl font-bold tracking-tight text-primary flex items-center gap-2">
            <ShieldAlert className="h-6 w-6" />
            OASIS
          </h2>
          <div className="space-y-1">
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <nav className="grid gap-1 px-2">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  
                  return (
                    <Button
                      key={index}
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start transition-all",
                        isActive && "bg-secondary font-medium shadow-sm"
                      )}
                    >
                      <Link href={item.href}>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Botón de Logout en el Footer del Sidebar */}
      <div className="p-4 border-t bg-muted/20">
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}