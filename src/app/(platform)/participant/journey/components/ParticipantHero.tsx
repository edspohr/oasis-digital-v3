'use client';

import React from 'react';
import { LevelBadge, type UserLevel } from '@/shared/components/gamification/LevelBadge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Trophy, Flame, Target } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function ParticipantHero() {
  const { profile } = useAuth();
  
  // TODO: Fetch real stats from API
  // const { stats } = useUserGamification();
  const stats = {
    level: 'Activo' as UserLevel,
    xp: 850,
    nextLevelXp: 1500,
    streak: 3,
    completedJourneys: 2
  };
  
  const progressPercent = (stats.xp / stats.nextLevelXp) * 100;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl">
      {/* Background Patterns */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      
      <div className="relative px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          
          {/* Main Info */}
          <div className="flex items-start gap-6">
            <div className="relative hidden sm:block">
              <div className="absolute inset-0 animate-pulse rounded-full bg-white/20 blur-xl" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/10 bg-white/10 backdrop-blur-sm">
                <span className="text-4xl">🚀</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Hola, {profile?.full_name?.split(' ')[0] || 'Explorador'}
                </h1>
                <LevelBadge level={stats.level} xp={stats.xp} showProgress={false} className="bg-white/10 border-white/20 text-white backdrop-blur-md" />
              </div>
              <p className="max-w-md text-indigo-100/80 text-lg">
                Estás en una racha increíble. ¡Sigue así para desbloquear tu próximo certificado!
              </p>
              
              {/* XP Progress */}
              <div className="mt-4 max-w-sm space-y-2">
                <div className="flex justify-between text-xs font-medium text-indigo-200">
                  <span>{stats.xp} XP</span>
                  <span>{stats.nextLevelXp} XP para subir</span>
                </div>
                <Progress value={progressPercent} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-yellow-300 to-amber-500" />
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
            <StatsCard 
              icon={Flame}
              value={stats.streak}
              label="Racha Días"
              color="text-orange-400"
              bgColor="bg-orange-500/10"
            />
            <StatsCard 
              icon={Trophy}
              value={stats.completedJourneys}
              label="Journeys"
              color="text-yellow-400"
              bgColor="bg-yellow-500/10"
            />
          </div>
          
        </div>
      </div>
    </div>
  );
}

function StatsCard({ 
  icon: Icon, 
  value, 
  label, 
  color,
  bgColor 
}: { 
  icon: any, 
  value: number, 
  label: string,
  color: string,
  bgColor: string
}) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl ${bgColor} border border-white/5 p-4 backdrop-blur-sm transition-transform hover:scale-105 w-28 h-28`}>
      <Icon className={`h-8 w-8 ${color} mb-2`} />
      <span className="text-2xl font-bold text-white">{value}</span>
      <span className="text-xs font-medium text-white/60">{label}</span>
    </div>
  );
}
