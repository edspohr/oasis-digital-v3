"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Map,
  Users,
  TrendingUp,
  ChevronRight,
  Search,
  BarChart3,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

interface JourneyStat {
  id: string;
  name: string;
  description: string;
  totalParticipants: number;
  activeParticipants: number;
  completedParticipants: number;
  atRiskParticipants: number;
  averageProgress: number;
  totalSteps: number;
  status: 'active' | 'draft' | 'archived';
}

// Mock data
const mockJourneys: JourneyStat[] = [
  {
    id: 'j1',
    name: 'Regulacion Emocional',
    description: 'Journey completo de 8 semanas para aprender a regular emociones.',
    totalParticipants: 12,
    activeParticipants: 8,
    completedParticipants: 2,
    atRiskParticipants: 2,
    averageProgress: 45,
    totalSteps: 8,
    status: 'active',
  },
  {
    id: 'j2',
    name: 'Mindfulness Basico',
    description: 'Introduccion a las practicas de mindfulness y meditacion.',
    totalParticipants: 8,
    activeParticipants: 5,
    completedParticipants: 3,
    atRiskParticipants: 0,
    averageProgress: 72,
    totalSteps: 6,
    status: 'active',
  },
  {
    id: 'j3',
    name: 'Liderazgo Consciente',
    description: 'Programa para desarrollar habilidades de liderazgo emocional.',
    totalParticipants: 4,
    activeParticipants: 3,
    completedParticipants: 0,
    atRiskParticipants: 1,
    averageProgress: 35,
    totalSteps: 10,
    status: 'active',
  },
];

const statusConfig = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  draft: { label: 'Borrador', color: 'bg-yellow-100 text-yellow-700' },
  archived: { label: 'Archivado', color: 'bg-gray-100 text-gray-700' },
};

export default function FacilitatorJourneysPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJourneys = mockJourneys.filter((j) =>
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalParticipants: mockJourneys.reduce((acc, j) => acc + j.totalParticipants, 0),
    activeParticipants: mockJourneys.reduce((acc, j) => acc + j.activeParticipants, 0),
    completedParticipants: mockJourneys.reduce((acc, j) => acc + j.completedParticipants, 0),
    atRiskParticipants: mockJourneys.reduce((acc, j) => acc + j.atRiskParticipants, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Journeys Asignados
          </h1>
          <p className="text-gray-600">
            Supervisa el progreso de los journeys que facilitas.
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Map className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockJourneys.length}</div>
                <div className="text-sm text-gray-500">Journeys</div>
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
                <div className="text-2xl font-bold">{totalStats.activeParticipants}</div>
                <div className="text-sm text-gray-500">Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalStats.completedParticipants}</div>
                <div className="text-sm text-gray-500">Completados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-lg p-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalStats.atRiskParticipants}</div>
                <div className="text-sm text-gray-500">En Riesgo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar journey..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Journeys Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJourneys.map((journey) => {
          const status = statusConfig[journey.status];
          return (
            <Card
              key={journey.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/facilitator/journeys/${journey.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Map className="h-5 w-5 text-primary" />
                  </div>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
                <CardTitle className="text-lg mt-3">{journey.name}</CardTitle>
                <p className="text-sm text-gray-500 line-clamp-2">{journey.description}</p>
              </CardHeader>
              <CardContent>
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Progreso promedio</span>
                    <span className="text-sm font-medium">{journey.averageProgress}%</span>
                  </div>
                  <Progress value={journey.averageProgress} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-gray-900">
                      {journey.activeParticipants}
                    </div>
                    <div className="text-xs text-gray-500">Activos</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-green-600">
                      {journey.completedParticipants}
                    </div>
                    <div className="text-xs text-gray-500">Completados</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <div className="text-lg font-semibold text-red-600">
                      {journey.atRiskParticipants}
                    </div>
                    <div className="text-xs text-gray-500">En riesgo</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {journey.totalSteps} pasos
                  </span>
                  <Button variant="ghost" size="sm">
                    Ver detalles
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredJourneys.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Map className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No se encontraron journeys</p>
        </div>
      )}
    </div>
  );
}
