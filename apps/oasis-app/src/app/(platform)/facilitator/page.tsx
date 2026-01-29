"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Map,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Search,
  Calendar,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  ParticipantProgressCard,
  type ParticipantProgress,
} from "@/frontend/components/facilitator/ParticipantProgressCard";
import {
  GroupProgressChart,
  type GroupStats,
} from "@/frontend/components/facilitator/GroupProgressChart";

// Mock data - prepared for backend integration
const mockStats: GroupStats = {
  totalParticipants: 24,
  activeJourneys: 3,
  averageProgress: 62,
  completionRate: 45,
  atRiskCount: 3,
  completedThisWeek: 5,
};

const mockParticipants: ParticipantProgress[] = [
  {
    id: '1',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    journeyName: 'Regulacion Emocional',
    journeyId: 'j1',
    currentStep: 4,
    totalSteps: 8,
    progressPercent: 50,
    lastActivity: '2025-01-28T10:00:00',
    status: 'active',
  },
  {
    id: '2',
    name: 'Carlos Lopez',
    email: 'carlos@example.com',
    journeyName: 'Mindfulness Basico',
    journeyId: 'j2',
    currentStep: 6,
    totalSteps: 6,
    progressPercent: 100,
    lastActivity: '2025-01-27T15:30:00',
    status: 'completed',
  },
  {
    id: '3',
    name: 'Ana Martinez',
    email: 'ana@example.com',
    journeyName: 'Regulacion Emocional',
    journeyId: 'j1',
    currentStep: 2,
    totalSteps: 8,
    progressPercent: 25,
    lastActivity: '2025-01-15T09:00:00',
    status: 'at_risk',
  },
  {
    id: '4',
    name: 'Pedro Sanchez',
    email: 'pedro@example.com',
    journeyName: 'Liderazgo Consciente',
    journeyId: 'j3',
    currentStep: 3,
    totalSteps: 10,
    progressPercent: 30,
    lastActivity: '2025-01-26T14:00:00',
    status: 'active',
  },
  {
    id: '5',
    name: 'Laura Rodriguez',
    email: 'laura@example.com',
    journeyName: 'Regulacion Emocional',
    journeyId: 'j1',
    currentStep: 1,
    totalSteps: 8,
    progressPercent: 12,
    lastActivity: '2025-01-10T11:00:00',
    status: 'at_risk',
  },
];

const mockUpcomingEvents = [
  { id: '1', title: 'Sesion Grupal - Regulacion Emocional', date: '2025-02-01', time: '10:00' },
  { id: '2', title: 'Mentoria Individual - Maria Garcia', date: '2025-02-02', time: '14:00' },
  { id: '3', title: 'Taller: Tecnicas de Respiracion', date: '2025-02-05', time: '18:00' },
];

export default function FacilitatorDashboardPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredParticipants = mockParticipants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const atRiskParticipants = mockParticipants.filter(p => p.status === 'at_risk');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Mi Panel de Facilitador
          </h1>
          <p className="text-gray-600">
            Supervisa el progreso de tus participantes asignados.
          </p>
        </div>
        <Button onClick={() => router.push('/facilitator/participants')}>
          <Users className="h-4 w-4 mr-2" />
          Ver Todos los Participantes
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockStats.totalParticipants}</div>
                <div className="text-sm text-gray-500">Participantes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <Map className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockStats.activeJourneys}</div>
                <div className="text-sm text-gray-500">Journeys Activos</div>
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
                <div className="text-2xl font-bold">{mockStats.averageProgress}%</div>
                <div className="text-sm text-gray-500">Progreso Promedio</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 rounded-lg p-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockStats.atRiskCount}</div>
                <div className="text-sm text-gray-500">En Riesgo</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Participants needing attention */}
        <div className="lg:col-span-2 space-y-6">
          {/* At Risk Section */}
          {atRiskParticipants.length > 0 && (
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Participantes que Requieren Atencion ({atRiskParticipants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {atRiskParticipants.map((participant) => (
                    <ParticipantProgressCard
                      key={participant.id}
                      participant={participant}
                      onClick={() => router.push(`/facilitator/participants/${participant.id}`)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Participants */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-lg">Participantes Recientes</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-[200px]"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredParticipants.slice(0, 4).map((participant) => (
                  <ParticipantProgressCard
                    key={participant.id}
                    participant={participant}
                    onClick={() => router.push(`/facilitator/participants/${participant.id}`)}
                  />
                ))}
              </div>
              {filteredParticipants.length > 4 && (
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => router.push('/facilitator/participants')}
                >
                  Ver todos ({filteredParticipants.length})
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats and Events */}
        <div className="space-y-6">
          {/* Group Progress */}
          <GroupProgressChart stats={mockStats} />

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Proximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUpcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900">{event.title}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })} - {event.time}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
