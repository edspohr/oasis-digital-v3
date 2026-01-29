"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePathname } from 'next/navigation';

export type ViewMode = 'participant' | 'management';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isStaff: boolean;
  toggleViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const { profile, isLoading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('participant');
  const pathname = usePathname();

  // Determinar si es staff (Admin, Owner, Facilitador o Platform Admin)
  const isStaff = React.useMemo(() => {
    if (!profile) return false;
    if (profile.is_platform_admin) return true;
    const role = (profile as any).role; // Si el rol viene en el perfil plano
    return ['owner', 'admin', 'facilitador', 'facilitator'].includes(role);
  }, [profile]);

  useEffect(() => {
    if (authLoading) return; // Esperar a que auth termine

    // 1. Sincronizar URL con Modo
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/facilitator')) {
      if (viewMode !== 'management') setViewMode('management');
    } else if (pathname?.startsWith('/participant')) {
      if (viewMode !== 'participant') setViewMode('participant');
    }
    
    // 2. Si es Staff y entra a la raíz, por defecto management
    if (isStaff && pathname === '/') {
        // Dejamos que page.tsx redirija, no forzamos estado aquí todavía
    }

  }, [pathname, isStaff, authLoading, viewMode]);

  const toggleViewMode = () => {
    if (!isStaff) return;
    const newMode = viewMode === 'management' ? 'participant' : 'management';
    setViewMode(newMode);
    
    // Redirección opcional al cambiar modo
    if (newMode === 'management') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/participant';
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