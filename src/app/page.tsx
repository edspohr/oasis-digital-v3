"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoadingSpinner } from "@/shared/components/feedback/LoadingSpinner";
import { Button } from "@/shared/components/ui/button";

export default function RootPage() {
  const { profile, currentOrg, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Si no hay perfil cargado, asumimos no autenticado -> Login
    if (!profile) {
      router.replace("/login");
      return;
    }

    // El rol está en currentOrg.myMembership.role, NO en profile
    const role = currentOrg?.myMembership?.role;
    const isPlatformAdmin = profile.is_platform_admin;
    const isStaff = isPlatformAdmin || (role && ["owner", "admin", "facilitador"].includes(role));

    if (isStaff) {
      const target = role === 'facilitador' ? '/facilitator' : '/admin';
      router.replace(target);
    } else {
      router.replace("/participant");
    }
  }, [profile, currentOrg, isLoading, router]);
  // Safety valve: If loading takes too long (e.g. 5s) and no profile, force to login
  useEffect(() => {
    const timer = setTimeout(() => {
        if (isLoading && !profile) {
            router.replace("/login");
        }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isLoading, profile, router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Cargando tu espacio...
        </p>

        {/* Fallback Manual Navigation if Redirect Stalls */}
        {!isLoading && profile && (
            <div className="mt-8 flex flex-col gap-2 opacity-0 animate-[fadeIn_1s_ease-in_2s_forwards]" style={{ animationDelay: '2s', animationFillMode: 'forwards' }}>
                <p className="text-xs text-gray-500 mb-2 text-center">¿No fuiste redirigido?</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
                        Ir a Admin
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push('/participant')}>
                        Ir a Participante
                    </Button>
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-2 text-center">
                    Rol: {currentOrg?.myMembership?.role || 'Ninguno'} | Admin: {profile.is_platform_admin ? 'Sí' : 'No'}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}