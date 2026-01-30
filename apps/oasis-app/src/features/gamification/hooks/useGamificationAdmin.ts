"use client";

import { useState, useCallback } from 'react';
import { gamificationAdminApi } from '@/core/api';
import type {
  Level,
  Reward,
  LevelCreate,
  LevelUpdate,
  RewardCreate,
  RewardUpdate,
} from '@/core/api/gamification-admin.api';
import { toast } from 'sonner';

export function useGamificationAdmin() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ========================================================================
  // Levels
  // ========================================================================

  const loadLevels = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await gamificationAdminApi.listLevels();
      // Sort by min_points ascending
      const sorted = [...data].sort((a, b) => a.min_points - b.min_points);
      setLevels(sorted);
      return sorted;
    } catch (error) {
      console.error('Error loading levels:', error);
      toast.error('Error al cargar niveles');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLevel = useCallback(async (data: LevelCreate) => {
    setIsSaving(true);
    try {
      const level = await gamificationAdminApi.createLevel(data);
      toast.success('Nivel creado exitosamente');
      return level;
    } catch (error: any) {
      console.error('Error creating level:', error);
      const message = error?.message || 'Error al crear nivel';
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateLevel = useCallback(async (levelId: string, data: LevelUpdate) => {
    setIsSaving(true);
    try {
      const level = await gamificationAdminApi.updateLevel(levelId, data);
      toast.success('Nivel actualizado exitosamente');
      return level;
    } catch (error: any) {
      console.error('Error updating level:', error);
      const message = error?.message || 'Error al actualizar nivel';
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteLevel = useCallback(async (levelId: string) => {
    setIsSaving(true);
    try {
      await gamificationAdminApi.deleteLevel(levelId);
      toast.success('Nivel eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting level:', error);
      const message = error?.message || 'Error al eliminar nivel';
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // ========================================================================
  // Rewards
  // ========================================================================

  const loadRewards = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await gamificationAdminApi.listRewards();
      setRewards(data);
      return data;
    } catch (error) {
      console.error('Error loading rewards:', error);
      toast.error('Error al cargar badges');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReward = useCallback(async (data: RewardCreate) => {
    setIsSaving(true);
    try {
      const reward = await gamificationAdminApi.createReward(data);
      toast.success('Badge creado exitosamente');
      return reward;
    } catch (error: any) {
      console.error('Error creating reward:', error);
      const message = error?.message || 'Error al crear badge';
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateReward = useCallback(async (rewardId: string, data: RewardUpdate) => {
    setIsSaving(true);
    try {
      const reward = await gamificationAdminApi.updateReward(rewardId, data);
      toast.success('Badge actualizado exitosamente');
      return reward;
    } catch (error: any) {
      console.error('Error updating reward:', error);
      const message = error?.message || 'Error al actualizar badge';
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteReward = useCallback(async (rewardId: string) => {
    setIsSaving(true);
    try {
      await gamificationAdminApi.deleteReward(rewardId);
      toast.success('Badge eliminado exitosamente');
    } catch (error: any) {
      console.error('Error deleting reward:', error);
      const message = error?.message || 'Error al eliminar badge';
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    // State
    levels,
    rewards,
    isLoading,
    isSaving,
    // Level actions
    loadLevels,
    createLevel,
    updateLevel,
    deleteLevel,
    // Reward actions
    loadRewards,
    createReward,
    updateReward,
    deleteReward,
  };
}
