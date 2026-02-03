"use client";

import { Users, Activity, Building2, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useAdminStats } from "../hooks/useAdminStats";

const iconMap = {
  users: Users,
  activity: Activity,
  building: Building2,
  "credit-card": CreditCard,
};

export function AdminDashboard() {
  const { stats, isLoading, isPlatformAdmin } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Encabezado Dinámico */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isPlatformAdmin ? "Platform Overview" : "Organization Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {isPlatformAdmin 
              ? "Métricas globales y estado del sistema." 
              : "Resumen de actividad de tu equipo y licencias."}
          </p>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = iconMap[stat.icon];
          return (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change !== undefined && (
                  <p className={`text-xs flex items-center mt-1 ${
                    stat.trend === 'up' ? 'text-green-600' : 
                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : 
                     stat.trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                    {Math.abs(stat.change)}% respecto al mes pasado
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sección de Contenido Específico */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>{isPlatformAdmin ? "Actividad del Sistema" : "Actividad Reciente"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border rounded-md border-dashed text-muted-foreground">
              {isPlatformAdmin 
                ? "[Gráfico de Tráfico Global / Log de Errores]" 
                : "[Lista de últimos Journeys completados]"}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>{isPlatformAdmin ? "Top Tenants" : "Miembros Destacados"}</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="h-[300px] flex items-center justify-center border rounded-md border-dashed text-muted-foreground">
              {isPlatformAdmin 
                ? "[Tabla de Organizaciones con más uso]" 
                : "[Leaderboard del equipo]"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}