'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/backend/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';
// Importamos los tipos exactos de tu definición
import type { UserStats, Badge, LeaderboardEntry } from '@/core/types/journey';

const POINTS_PER_LEVEL = 100;

interface UseGamificationReturn {
  stats: UserStats | null;
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useGamification(): UseGamificationReturn {
  const { profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchGamificationData = useCallback(async () => {
    if (!profile) {
      setStats(null);
      setBadges([]);
      setLeaderboard([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // -----------------------------------------------------------------------
      // 1. Obtener Métricas del Usuario
      // -----------------------------------------------------------------------
      
      // A. Inscripciones
      const { data: enrollments, error: enrollError } = await supabase
        .schema('journeys')
        .from('enrollments')
        .select('status, progress_percentage')
        .eq('user_id', profile.id);

      if (enrollError) throw new Error(`Enrollments Error: ${enrollError.message}`);

      // B. Puntos Totales
      const { data: pointsData, error: pointsError } = await supabase
        .schema('journeys')
        .from('points_ledger')
        .select('amount')
        .eq('user_id', profile.id);

      if (pointsError) throw new Error(`Points Error: ${pointsError.message}`);

      // C. Medallas Ganadas
      const { data: rewardsData, error: rewardsError } = await supabase
        .schema('journeys')
        .from('user_rewards')
        .select(`
          earned_at,
          reward:rewards_catalog (
            id, name, description, icon_url, type
          )
        `)
        .eq('user_id', profile.id);

      if (rewardsError) throw new Error(`Rewards Error: ${rewardsError.message}`);

      // -----------------------------------------------------------------------
      // 2. Procesamiento de Datos (Cálculos)
      // -----------------------------------------------------------------------

      const totalPoints = pointsData?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const currentLevel = Math.floor(totalPoints / POINTS_PER_LEVEL) + 1;
      const levelProgress = totalPoints % POINTS_PER_LEVEL;
      
      const completedJourneys = enrollments?.filter(e => e.status === 'completed').length || 0;
      const activeJourneys = enrollments?.filter(e => e.status === 'active' || e.status === 'in_progress').length || 0;

      // FIX: Mapeo estricto a la interfaz Badge (category en lugar de type)
      const formattedBadges: Badge[] = (rewardsData || []).map((item: any) => ({
        id: item.reward?.id,
        name: item.reward?.name || 'Medalla',
        description: item.reward?.description || '',
        icon_url: item.reward?.icon_url || '',
        earned_at: item.earned_at,
        // Aquí asignamos el 'type' de la BD a la propiedad 'category' requerida por tu interfaz
        category: item.reward?.type || 'achievement' 
      }));

      // -----------------------------------------------------------------------
      // 3. Leaderboard
      // -----------------------------------------------------------------------
      
      const { data: allPoints, error: leaderboardError } = await supabase
        .schema('journeys')
        .from('points_ledger')
        .select('user_id, amount');

      if (leaderboardError) throw new Error(`Leaderboard Error: ${leaderboardError.message}`);

      const pointsByUser = new Map<string, number>();
      allPoints?.forEach((entry) => {
        const current = pointsByUser.get(entry.user_id) || 0;
        pointsByUser.set(entry.user_id, current + entry.amount);
      });

      const topUsers = Array.from(pointsByUser.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      const topUserIds = topUsers.map(([uid]) => uid);

      let leaderboardEntries: LeaderboardEntry[] = [];
      
      if (topUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', topUserIds);

        // FIX: Mapeo estricto a LeaderboardEntry (sin campos extra como level o badges_count)
        leaderboardEntries = topUsers.map(([uid, points], index) => {
          const userProfile = profilesData?.find(p => p.id === uid);
          return {
            rank: index + 1,
            user_id: uid,
            full_name: userProfile?.full_name || 'Usuario Anónimo',
            avatar_url: userProfile?.avatar_url || null,
            points: points
          };
        });
      }

      // -----------------------------------------------------------------------
      // 4. Actualizar Estado
      // -----------------------------------------------------------------------
      
      setStats({
        total_points: totalPoints,
        level: currentLevel,
        level_name: `Nivel ${currentLevel}`,
        level_progress: levelProgress,
        journeys_completed: completedJourneys,
        journeys_in_progress: activeJourneys,
        badges_earned: formattedBadges.length,
        rank: leaderboardEntries.find(e => e.user_id === profile.id)?.rank
      });

      setBadges(formattedBadges);
      setLeaderboard(leaderboardEntries);

    } catch (err: any) {
      console.error('Gamification Fetch Error:', JSON.stringify(err, null, 2));
      setError(err instanceof Error ? err.message : 'Error cargando gamificación');
    } finally {
      setIsLoading(false);
    }
  }, [profile, supabase]);

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  return { 
    stats, 
    badges, 
    leaderboard, 
    isLoading, 
    error, 
    refresh: fetchGamificationData 
  };
}