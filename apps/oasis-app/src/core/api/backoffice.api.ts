/**
 * Backoffice API Client (Platform Admin)
 * Endpoints for global organization management
 */

import { createApiClient, type ApiClient } from './client';
import { SERVICES } from '@/core/config/services';

// ============================================================================
// Types
// ============================================================================

export interface OrganizationWithStats {
  id: string;
  name: string;
  slug: string;
  type: string;
  settings: Record<string, unknown>;
  logo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string | null;
  member_count: number;
}

export interface PaginatedOrganizations {
  items: OrganizationWithStats[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserBasicInfo {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface PaginatedUsers {
  items: UserBasicInfo[];
  total: number;
  skip: number;
  limit: number;
}

export interface OrganizationCreateAdmin {
  name: string;
  slug: string;
  type: string;
  description?: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
  owner_user_id: string;
}

export interface OrganizationUpdateAdmin {
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  logo_url?: string;
  settings?: Record<string, unknown>;
}

export interface ListOrganizationsParams {
  skip?: number;
  limit?: number;
  search?: string;
  org_type?: string;
}

export interface ListUsersParams {
  skip?: number;
  limit?: number;
  search?: string;
}

// ============================================================================
// Backoffice API Client
// ============================================================================

export function createBackofficeApi(
  getAccessToken?: () => Promise<string | null>,
  onUnauthorized?: () => void
) {
  const client = createApiClient({
    baseUrl: SERVICES.AUTH,
    getAccessToken,
    onUnauthorized,
  });

  return {
    // ========================================================================
    // Organizations
    // ========================================================================

    /**
     * List all organizations with stats
     */
    listOrganizations(params?: ListOrganizationsParams): Promise<PaginatedOrganizations> {
      return client.get<PaginatedOrganizations>('/backoffice/organizations', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
    },

    /**
     * Get organization by ID
     */
    getOrganization(orgId: string): Promise<OrganizationWithStats> {
      return client.get<OrganizationWithStats>(`/backoffice/organizations/${orgId}`);
    },

    /**
     * Create organization with owner assignment
     */
    createOrganization(data: OrganizationCreateAdmin): Promise<OrganizationWithStats> {
      return client.post<OrganizationWithStats>('/backoffice/organizations', data);
    },

    /**
     * Update organization
     */
    updateOrganization(orgId: string, data: OrganizationUpdateAdmin): Promise<OrganizationWithStats> {
      return client.patch<OrganizationWithStats>(`/backoffice/organizations/${orgId}`, data);
    },

    /**
     * Delete organization
     */
    deleteOrganization(orgId: string): Promise<void> {
      return client.delete<void>(`/backoffice/organizations/${orgId}`);
    },

    // ========================================================================
    // Users
    // ========================================================================

    /**
     * List all users (for owner selection)
     */
    listUsers(params?: ListUsersParams): Promise<PaginatedUsers> {
      return client.get<PaginatedUsers>('/backoffice/users', {
        params: params as Record<string, string | number | boolean | undefined>,
      });
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

export type BackofficeApi = ReturnType<typeof createBackofficeApi>;
