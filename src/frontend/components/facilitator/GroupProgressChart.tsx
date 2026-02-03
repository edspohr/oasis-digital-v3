"use client";

import { TrendingUp, Users, Target, AlertTriangle } from "lucide-react";
import { Progress } from "@/shared/components/ui/progress";

export interface GroupStats {
  totalParticipants: number;
  activeJourneys: number;
  averageProgress: number;
  completionRate: number;
  atRiskCount: number;
  completedThisWeek: number;
}

interface GroupProgressChartProps {
  stats: GroupStats;
}

export function GroupProgressChart({ stats }: GroupProgressChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-primary" />
        Resumen del Grupo
      </h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Total Participants */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-gray-600">Participantes</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalParticipants}</div>
          <div className="text-sm text-gray-500">{stats.activeJourneys} journeys activos</div>
        </div>

        {/* Average Progress */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-green-500" />
            <span className="text-sm text-gray-600">Progreso Promedio</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.averageProgress}%</div>
          <Progress value={stats.averageProgress} className="h-2 mt-2" />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="space-y-4">
        {/* Completion Rate */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="bg-green-100 rounded-full p-1.5">
              <Target className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm text-gray-700">Tasa de Finalizacion</span>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-600">{stats.completionRate}%</div>
            <div className="text-xs text-gray-500">{stats.completedThisWeek} esta semana</div>
          </div>
        </div>

        {/* At Risk */}
        {stats.atRiskCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="bg-red-100 rounded-full p-1.5">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <span className="text-sm text-gray-700">Participantes en Riesgo</span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-red-600">{stats.atRiskCount}</div>
              <div className="text-xs text-gray-500">Requieren atencion</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
