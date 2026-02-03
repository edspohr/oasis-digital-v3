"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/frontend/components/ui/card";
import { 
  BarChart3, 
  ExternalLink, 
  RefreshCw, 
  Users, 
  TrendingUp, 
  Award, 
  Calendar,
  Map,
  Activity
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { Badge } from "@/frontend/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, changeType = 'neutral', icon }: MetricCardProps) {
  const changeColor = changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-gray-500';
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {change && (
              <p className={`text-xs mt-1 ${changeColor}`}>{change}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard configuration
const dashboards = [
  { id: 'overview', name: 'Vista General', icon: Activity },
  { id: 'participants', name: 'Participantes', icon: Users },
  { id: 'journeys', name: 'Journeys', icon: Map },
  { id: 'events', name: 'Eventos', icon: Calendar },
];

export default function AnalyticsPage() {
  const [selectedDashboard, setSelectedDashboard] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  
  // TODO: Replace with actual Superset URL from environment
  const supersetBaseUrl = process.env.NEXT_PUBLIC_SUPERSET_URL || null;
  const supersetUrl = supersetBaseUrl ? `${supersetBaseUrl}/dashboard/${selectedDashboard}` : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analítica</h1>
          <p className="text-gray-500">
            Visualiza métricas de participación, progreso y engagement.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          {supersetBaseUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={supersetBaseUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en Superset
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Participantes Activos"
          value="1,284"
          change="+12% vs mes anterior"
          changeType="positive"
          icon={<Users className="h-6 w-6 text-indigo-600" />}
        />
        <MetricCard
          title="Journeys Completados"
          value="847"
          change="+8% vs mes anterior"
          changeType="positive"
          icon={<Map className="h-6 w-6 text-green-600" />}
        />
        <MetricCard
          title="Tasa de Completitud"
          value="72%"
          change="-2% vs mes anterior"
          changeType="negative"
          icon={<TrendingUp className="h-6 w-6 text-amber-600" />}
        />
        <MetricCard
          title="Certificaciones"
          value="523"
          change="+15% vs mes anterior"
          changeType="positive"
          icon={<Award className="h-6 w-6 text-purple-600" />}
        />
      </div>

      {/* Dashboard Tabs */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <div>
                <CardTitle className="text-lg">Dashboard de Métricas</CardTitle>
                <CardDescription>
                  Datos actualizados en tiempo real
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              En vivo
            </Badge>
          </div>
        </CardHeader>
        
        <Tabs value={selectedDashboard} onValueChange={setSelectedDashboard} className="w-full">
          <div className="border-b px-4">
            <TabsList className="h-12 bg-transparent p-0 w-full justify-start gap-4">
              {dashboards.map((dashboard) => {
                const Icon = dashboard.icon;
                return (
                  <TabsTrigger
                    key={dashboard.id}
                    value={dashboard.id}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 rounded-none px-3 pb-3"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {dashboard.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {dashboards.map((dashboard) => (
            <TabsContent key={dashboard.id} value={dashboard.id} className="mt-0">
              <CardContent className="p-0">
                {supersetUrl ? (
                  <iframe
                    src={supersetUrl}
                    className="w-full h-[600px] border-0"
                    title={`Superset ${dashboard.name} Dashboard`}
                    loading="lazy"
                  />
                ) : (
                  /* Placeholder when Superset URL is not configured */
                  <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                      <dashboard.icon className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                      Dashboard: {dashboard.name}
                    </h3>
                    <p className="text-slate-500 max-w-md mb-6">
                      El dashboard de {dashboard.name.toLowerCase()} se conectará automáticamente 
                      cuando configures la URL de Superset en las variables de entorno.
                    </p>
                    
                    {/* Mock Chart Placeholder */}
                    <div className="w-full max-w-2xl">
                      <div className="flex items-end justify-center gap-2 h-32">
                        {[40, 65, 45, 80, 55, 70, 60, 85, 50, 75, 65, 90].map((height, i) => (
                          <div
                            key={i}
                            className="w-8 rounded-t bg-indigo-200 transition-all hover:bg-indigo-400"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-3">Datos de ejemplo • Conectar Superset para datos reales</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Configuration Note */}
      {!supersetBaseUrl && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Configuración Pendiente</p>
              <p className="text-xs text-amber-700 mt-1">
                Para habilitar los dashboards de Superset, configura la variable de entorno{' '}
                <code className="bg-amber-100 px-1 rounded">NEXT_PUBLIC_SUPERSET_URL</code> con la URL de tu instancia.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
