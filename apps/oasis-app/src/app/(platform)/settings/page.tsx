'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { ProfileForm } from '@/features/settings/components/ProfileForm';
import { Settings, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Sesión no iniciada</h2>
          <p className="text-gray-500 mt-2">Inicia sesión para acceder a la configuración.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mi Perfil</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tu información personal
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <ProfileForm />
    </div>
  );
}
