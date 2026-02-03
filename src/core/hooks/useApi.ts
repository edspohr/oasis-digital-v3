import { useMemo, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { createJourneyApi } from '@/core/api/journey.api';
import { createAuthApi } from '@/core/api/auth.api';
import { createWebhookApi } from '@/core/api/webhook.api';
import { createClient } from '@/backend/supabase/client';
import type { CurrentOrganization } from '@/features/auth/context/AuthProvider';
import type { Organization } from '@/core/types';

export function useApi() {
  const { currentOrg, signOut } = useAuth();
  
  // Create a stable getAccessToken function
  const getAccessToken = useCallback(async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }, []);

  // Create a stable getOrganizationId function
  const getOrganizationId = useCallback(() => {
    // Attempt to get ID from various shapes of currentOrg
    if (!currentOrg) return null;
    
    // Check if it's the CurrentOrganization type
    if ('data' in currentOrg) {
      return (currentOrg as CurrentOrganization).data.id;
    }
    
    // Check if it's the raw Organization type
    if ('id' in currentOrg) {
        return (currentOrg as Organization).id;
    }

    return null;
  }, [currentOrg]);

  // Handle unauthorized responses by signing out
  const onUnauthorized = useCallback(() => {
    signOut();
  }, [signOut]);

  const api = useMemo(() => {
    return {
      auth: createAuthApi(getAccessToken, getOrganizationId, onUnauthorized),
      journey: createJourneyApi(getAccessToken, getOrganizationId, onUnauthorized),
      webhook: createWebhookApi(getAccessToken, getOrganizationId, onUnauthorized),
    };
  }, [getAccessToken, getOrganizationId, onUnauthorized]);

  return api;
}
