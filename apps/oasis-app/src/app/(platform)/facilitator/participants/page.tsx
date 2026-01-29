"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  ChevronRight,
  User,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Progress } from "@/shared/components/ui/progress";
import type { ParticipantProgress } from "@/frontend/components/facilitator/ParticipantProgressCard";

// Mock data
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
  {
    id: '6',
    name: 'Juan Hernandez',
    email: 'juan@example.com',
    journeyName: 'Mindfulness Basico',
    journeyId: 'j2',
    currentStep: 4,
    totalSteps: 6,
    progressPercent: 67,
    lastActivity: '2025-01-27T09:00:00',
    status: 'active',
  },
  {
    id: '7',
    name: 'Sofia Torres',
    email: 'sofia@example.com',
    journeyName: 'Liderazgo Consciente',
    journeyId: 'j3',
    currentStep: 7,
    totalSteps: 10,
    progressPercent: 70,
    lastActivity: '2025-01-28T08:00:00',
    status: 'active',
  },
  {
    id: '8',
    name: 'Diego Morales',
    email: 'diego@example.com',
    journeyName: 'Regulacion Emocional',
    journeyId: 'j1',
    currentStep: 8,
    totalSteps: 8,
    progressPercent: 100,
    lastActivity: '2025-01-25T16:00:00',
    status: 'completed',
  },
];

const statusConfig = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
  at_risk: { label: 'En riesgo', color: 'bg-red-100 text-red-700' },
};

const journeys = [
  { id: 'all', name: 'Todos los journeys' },
  { id: 'j1', name: 'Regulacion Emocional' },
  { id: 'j2', name: 'Mindfulness Basico' },
  { id: 'j3', name: 'Liderazgo Consciente' },
];

export default function FacilitatorParticipantsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJourney, setFilterJourney] = useState<string>('all');

  const filteredParticipants = mockParticipants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchesJourney = filterJourney === 'all' || p.journeyId === filterJourney;
    return matchesSearch && matchesStatus && matchesJourney;
  });

  const formatLastActivity = (date: string) => {
    const now = new Date();
    const activity = new Date(date);
    const diffDays = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    return activity.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Participantes Asignados
          </h1>
          <p className="text-gray-600">
            {filteredParticipants.length} participantes en total
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar participante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterJourney} onValueChange={setFilterJourney}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Journey" />
          </SelectTrigger>
          <SelectContent>
            {journeys.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="at_risk">En riesgo</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participante</TableHead>
              <TableHead>Journey</TableHead>
              <TableHead>Progreso</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ultima Actividad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.map((participant) => {
              const status = statusConfig[participant.status];
              return (
                <TableRow
                  key={participant.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/facilitator/participants/${participant.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 rounded-full p-2">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{participant.name}</div>
                        <div className="text-sm text-gray-500">{participant.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{participant.journeyName}</div>
                    <div className="text-xs text-gray-500">
                      Paso {participant.currentStep}/{participant.totalSteps}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{participant.progressPercent}%</span>
                      </div>
                      <Progress value={participant.progressPercent} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={status.color}>{status.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {formatLastActivity(participant.lastActivity)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ver detalle
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {filteredParticipants.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No se encontraron participantes con los filtros seleccionados
          </div>
        )}
      </div>
    </div>
  );
}
