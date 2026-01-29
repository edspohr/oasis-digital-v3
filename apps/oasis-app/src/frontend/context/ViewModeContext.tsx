"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

export type ViewMode = 'participant' | 'management';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isStaff: boolean;
  toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  // EXTRAEMOS currentOrg ADEMÁS DE profile
  const { profile, currentOrg, isLoading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('participant');
  const pathname = usePathname();
  const router = useRouter();

  // --- Lógica de Detección de Staff (CORREGIDA) ---
  const isStaff = React.useMemo(() => {
    if (!profile) return false;

    // 1. Si es Super Admin de la plataforma, siempre es staff
    if (profile.is_platform_admin) return true;

    // 2. Si no, miramos su rol en la ORGANIZACIÓN ACTUAL
    const orgRole = currentOrg?.myMembership?.role;

    // Lista de roles permitidos para ver el modo gestión
    const staffRoles = ['owner', 'admin', 'facilitador'];

    return orgRole ? staffRoles.includes(orgRole) : false;
  }, [profile, currentOrg]);

  // --- Sincronización Automática ---
  useEffect(() => {
    if (authLoading) return;

    // 1. Forzar modo según la URL actual (Anti-confusión)
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/facilitator')) {
      if (viewMode !== 'management') setViewMode('management');
    } else if (pathname?.startsWith('/participant')) {
      if (viewMode !== 'participant') setViewMode('participant');
    }
    
    // 2. Si el usuario pierde permisos de staff, forzar participante
    if (!isStaff && viewMode === 'management') {
      setViewMode('participant');
    }

  }, [pathname, isStaff, authLoading, viewMode]);

  // --- Acción de Cambio ---
  const toggleViewMode = () => {
    if (!isStaff) return; // Seguridad extra

    const newMode = viewMode === 'management' ? 'participant' : 'management';
    setViewMode(newMode);
    
    // Redirección inteligente
    if (newMode === 'management') {
      router.push('/admin');
    } else {
      router.push('/participant');
    }
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, isStaff, toggleViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}