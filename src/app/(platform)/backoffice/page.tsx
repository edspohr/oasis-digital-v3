"use client";

import { useEffect, useState } from "react";
import { Building2, Users, Map, Activity } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { backofficeApi } from "@/core/api";

interface BackofficeStats {
  totalOrganizations: number;
  totalUsers: number;
  activeJourneys: number;
  systemHealth: string;
}

export default function BackofficePage() {
  const [stats, setStats] = useState<BackofficeStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    activeJourneys: 0,
    systemHealth: "OK",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [orgsResponse, usersResponse] = await Promise.all([
          backofficeApi.listOrganizations({ limit: 1 }),
          backofficeApi.listUsers({ limit: 1 }),
        ]);

        setStats({
          totalOrganizations: orgsResponse.total,
          totalUsers: usersResponse.total,
          activeJourneys: 0, // TODO: Get from journey service
          systemHealth: "OK",
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Backoffice
          </h1>
          <p className="text-gray-600">
            Panel de administracion global de la plataforma.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? "-" : stats.totalOrganizations}
                </div>
                <div className="text-sm text-gray-500">Organizaciones</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? "-" : stats.totalUsers}
                </div>
                <div className="text-sm text-gray-500">Usuarios</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <Map className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? "-" : stats.activeJourneys}
                </div>
                <div className="text-sm text-gray-500">Journeys Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 rounded-lg p-2">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.systemHealth}</div>
                <div className="text-sm text-gray-500">Sistema</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Organizaciones</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona todas las organizaciones de la plataforma.
                </p>
                <Button asChild className="mt-4" variant="outline" size="sm">
                  <Link href="/backoffice/organizations">Ver Organizaciones</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 rounded-lg p-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Usuarios</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Visualiza y gestiona usuarios globales.
                </p>
                <Button className="mt-4" variant="outline" size="sm" disabled>
                  Proximamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Logs de Sistema</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Monitorea actividad y errores del sistema.
                </p>
                <Button className="mt-4" variant="outline" size="sm" disabled>
                  Proximamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
