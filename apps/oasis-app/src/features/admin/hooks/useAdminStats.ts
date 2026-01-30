import { useState, useEffect } from 'react';
import { useOrganization } from '@/features/auth/hooks/useOrganization';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface AdminStat {
  label: string;
  value: string | number;
  change?: number;
  trend: 'up' | 'down' | 'neutral';
  icon: 'users' | 'activity' | 'building' | 'credit-card';
}

export function useAdminStats() {
  // CAMBIO: Desestructuramos 'profile' en lugar de 'user'
  const { profile } = useAuth();
  const { organization, role } = useOrganization();
  
  const [stats, setStats] = useState<AdminStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // CAMBIO: Usamos la propiedad del perfil que ya definiste en tu base de datos
  const isPlatformAdmin = profile?.is_platform_admin === true;

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true);
      try {
        // Simulación de API (Mismo código de antes...)
        await new Promise(r => setTimeout(r, 800));

        if (isPlatformAdmin) {
          setStats([
            { label: 'Total Organizaciones', value: 45, change: 12, trend: 'up', icon: 'building' },
            { label: 'Usuarios Globales', value: '12.5k', change: 8, trend: 'up', icon: 'users' },
            { label: 'Journeys Activos', value: 328, change: 15, trend: 'up', icon: 'activity' },
            { label: 'Tasa de Error', value: '0.2%', change: -0.1, trend: 'down', icon: 'activity' },
          ]);
        } else if (role === 'owner' || role === 'admin') {
          setStats([
            { label: 'Miembros Activos', value: 124, change: 5, trend: 'up', icon: 'users' },
            { label: 'Journeys Asignados', value: 450, change: 22, trend: 'up', icon: 'activity' },
            { label: 'Tasa de Finalización', value: '87%', change: 2.4, trend: 'up', icon: 'activity' },
            { label: 'Licencias Usadas', value: '90/100', change: 0, trend: 'neutral', icon: 'building' },
          ]);
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (organization || isPlatformAdmin) {
      fetchStats();
    }
  }, [organization, role, isPlatformAdmin]);

  return { stats, isLoading, isPlatformAdmin };
}