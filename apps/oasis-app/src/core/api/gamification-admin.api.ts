/**
 * Gamification Admin API Client
 * Endpoints for managing levels and rewards/badges
 */

import { createApiClient, type ApiClient } from './client';
import { SERVICES } from '@/core/config/services';

// ============================================================================
// Types
// ============================================================================

export interface Level {
  id: string;
  organization_id: string | null;
  name: string;
  min_points: number;
  icon_url: string | null;
  benefits: Record<string, unknown>;
  created_at: string;
  users_at_level: number;
}

export interface Reward {
  id: string;
  organization_id: string | null;
  name: string;
  description: string | null;
  type: 'badge' | 'points';
  icon_url: string | null;
  unlock_condition: Record<string, unknown>;
  times_awarded: number;
}

export interface LevelCreate {
  name: string;
  min_points: number;
  icon_url?: string;
  benefits?: Record<string, unknown>;
}

export interface LevelUpdate {
  name?: string;
  min_points?: number;
  icon_url?: string;
  benefits?: Record<string, unknown>;
}

export interface RewardCreate {
  name: string;
  description?: string;
  type: 'badge' | 'points';
  icon_url?: string;
  unlock_condition?: Record<string, unknown>;
}

export interface RewardUpdate {
  name?: string;
  description?: string;
  type?: 'badge' | 'points';
  icon_url?: string;
  unlock_condition?: Record<string, unknown>;
}

interface OasisResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================================================
// Gamification Admin API Client
// ============================================================================

export function createGamificationAdminApi(
  getAccessToken?: () => Promise<string | null>,
  getOrganizationId?: () => string | null,
  onUnauthorized?: () => void
) {
  const client = createApiClient({
    baseUrl: SERVICES.JOURNEY,
    getAccessToken,
    getOrganizationId,
    onUnauthorized,
  });

  return {
    // ========================================================================
    // Levels
    // ========================================================================

    /**
     * List all levels for the organization
     */
    async listLevels(): Promise<Level[]> {
      const response = await client.get<OasisResponse<Level[]>>('/admin/levels');
      return response.data;
    },

    /**
     * Create a new level
     */
    async createLevel(data: LevelCreate): Promise<Level> {
      const response = await client.post<OasisResponse<Level>>('/admin/levels', data);
      return response.data;
    },

    /**
     * Update a level
     */
    async updateLevel(levelId: string, data: LevelUpdate): Promise<Level> {
      const response = await client.put<OasisResponse<Level>>(`/admin/levels/${levelId}`, data);
      return response.data;
    },

    /**
     * Delete a level
     */
    async deleteLevel(levelId: string): Promise<void> {
      await client.delete<OasisResponse<{ deleted_id: string }>>(`/admin/levels/${levelId}`);
    },

    // ========================================================================
    // Rewards (Badges)
    // ========================================================================

    /**
     * List all rewards/badges for the organization
     */
    async listRewards(): Promise<Reward[]> {
      const response = await client.get<OasisResponse<Reward[]>>('/admin/rewards');
      return response.data;
    },

    /**
     * Create a new reward
     */
    async createReward(data: RewardCreate): Promise<Reward> {
      const response = await client.post<OasisResponse<Reward>>('/admin/rewards', data);
      return response.data;
    },

    /**
     * Update a reward
     */
    async updateReward(rewardId: string, data: RewardUpdate): Promise<Reward> {
      const response = await client.put<OasisResponse<Reward>>(`/admin/rewards/${rewardId}`, data);
      return response.data;
    },

    /**
     * Delete a reward
     */
    async deleteReward(rewardId: string): Promise<void> {
      await client.delete<OasisResponse<{ deleted_id: string }>>(`/admin/rewards/${rewardId}`);
    },

    // ========================================================================
    // Utility
    // ========================================================================

    /**
     * Get raw client for custom requests
     */
    getClient(): ApiClient {
      return client;
    },
  };
}

export type GamificationAdminApi = ReturnType<typeof createGamificationAdminApi>;
