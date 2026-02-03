/**
 * API layer barrel export
 * Aquí inicializamos y exportamos las instancias listas para usar
 */

import { createAuthApi } from './auth.api';
import { createJourneyApi } from './journey.api';
import { createWebhookApi } from './webhook.api';
import { createBackofficeApi } from './backoffice.api';
import { createGamificationAdminApi } from './gamification-admin.api';

// 1. Función para obtener el token
// Esta función se ejecuta en cada petición, permitiendo que el token se actualice dinámicamente
const getAccessToken = async () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('oasis_token');
  }
  return null;
};

// 2. Función para obtener el Organization ID actual
const getOrganizationId = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('oasis_org_id');
  }
  return null;
};

// 3. Crear instancias Singleton
// Estas son las variables que importas como `import { authApi } ...`
export const authApi = createAuthApi(getAccessToken);
export const journeyApi = createJourneyApi(getAccessToken, getOrganizationId);
export const webhookApi = createWebhookApi(getAccessToken);
export const backofficeApi = createBackofficeApi(getAccessToken);
export const gamificationAdminApi = createGamificationAdminApi(getAccessToken, getOrganizationId);

// 4. Exportar tipos y fábricas
// Por si necesitas los tipos en otros archivos
export * from './client';
export * from './types';
export * from './auth.api';
export * from './journey.api';
export * from './webhook.api';
export * from './backoffice.api';
export * from './gamification-admin.api';