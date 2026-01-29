"use client";

import { User, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

export interface ParticipantProgress {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  journeyName: string;
  journeyId: string;
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'completed' | 'at_risk';
}

interface ParticipantProgressCardProps {
  participant: ParticipantProgress;
  onClick?: () => void;
}

const statusConfig = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-700' },
  completed: { label: 'Completado', color: 'bg-blue-100 text-blue-700' },
  at_risk: { label: 'En riesgo', color: 'bg-red-100 text-red-700' },
};

export function ParticipantProgressCard({ participant, onClick }: ParticipantProgressCardProps) {
  const status = statusConfig[participant.status];

  const formatLastActivity = (date: string) => {
    const now = new Date();
    const activity = new Date(date);
    const diffDays = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} dias`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-gray-100 p-4 transition-all",
        onClick && "cursor-pointer hover:shadow-md hover:border-gray-200"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 rounded-full p-2">
            {participant.avatarUrl ? (
              <img
                src={participant.avatarUrl}
                alt={participant.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{participant.name}</h3>
            <p className="text-sm text-gray-500">{participant.email}</p>
          </div>
        </div>
        <Badge className={status.color}>{status.label}</Badge>
      </div>

      {/* Journey info */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{participant.journeyName}</span>
          <span className="text-sm text-gray-500">
            Paso {participant.currentStep}/{participant.totalSteps}
          </span>
        </div>
        <Progress value={participant.progressPercent} className="h-2" />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">Progreso</span>
          <span className="text-xs font-medium text-primary">{participant.progressPercent}%</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="h-4 w-4" />
          <span>{formatLastActivity(participant.lastActivity)}</span>
        </div>
        {participant.status === 'completed' && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Completado</span>
          </div>
        )}
      </div>
    </div>
  );
}
