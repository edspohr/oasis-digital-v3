"use client";

import { useEffect, useState } from "react";
import { Trophy, Award, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { useGamificationAdmin } from "@/features/gamification/hooks/useGamificationAdmin";

export default function AdminGamificationPage() {
  const { levels, rewards, loadLevels, loadRewards, isLoading } = useGamificationAdmin();
  const [stats, setStats] = useState({
    totalLevels: 0,
    totalBadges: 0,
    usersWithLevel: 0,
    badgesAwarded: 0,
  });

  useEffect(() => {
    Promise.all([loadLevels(), loadRewards()]).then(([levelsData, rewardsData]) => {
      setStats({
        totalLevels: levelsData?.length || 0,
        totalBadges: rewardsData?.length || 0,
        usersWithLevel: levelsData?.reduce((acc, l) => acc + l.users_at_level, 0) || 0,
        badgesAwarded: rewardsData?.reduce((acc, r) => acc + r.times_awarded, 0) || 0,
      });
    }).catch(() => {});
  }, [loadLevels, loadRewards]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Gamificacion
          </h1>
          <p className="text-gray-600">
            Configura niveles y badges para motivar a tus participantes.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 rounded-lg p-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? "-" : stats.totalLevels}
                </div>
                <div className="text-sm text-gray-500">Niveles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? "-" : stats.totalBadges}
                </div>
                <div className="text-sm text-gray-500">Badges</div>
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
                  {isLoading ? "-" : stats.usersWithLevel}
                </div>
                <div className="text-sm text-gray-500">Usuarios con Nivel</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {isLoading ? "-" : stats.badgesAwarded}
                </div>
                <div className="text-sm text-gray-500">Badges Otorgados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 rounded-lg p-3">
                <Trophy className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Niveles</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Define los niveles de progresion basados en puntos.
                  Cada nivel puede tener beneficios especiales.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="default" size="sm">
                    <Link href="/admin/gamification/levels">Gestionar Niveles</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-lg p-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Badges</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Crea insignias y recompensas para reconocer logros.
                  Se otorgan automaticamente al cumplir condiciones.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="default" size="sm">
                    <Link href="/admin/gamification/badges">Gestionar Badges</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Levels */}
      {levels.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Niveles Configurados</h3>
            <div className="flex flex-wrap gap-2">
              {levels.slice(0, 5).map((level, index) => (
                <div
                  key={level.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: `hsl(${(index * 60) % 360}, 70%, 95%)`,
                  }}
                >
                  <Trophy
                    className="h-4 w-4"
                    style={{ color: `hsl(${(index * 60) % 360}, 70%, 40%)` }}
                  />
                  <span className="text-sm font-medium">{level.name}</span>
                  <span className="text-xs text-gray-500">
                    ({level.min_points.toLocaleString()} pts)
                  </span>
                </div>
              ))}
              {levels.length > 5 && (
                <span className="text-sm text-gray-500 self-center">
                  +{levels.length - 5} mas
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
