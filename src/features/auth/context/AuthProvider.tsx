"use client";

import { createContext, useCallback, useEffect, useState } from "react";
import { createClient } from "@/backend/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, Organization, OrganizationMember, OrganizationRole } from "@/core/types";
import { getCookie, setCookie, deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation"; // Importante para redirigir al salir

// --- Tipos Internos ---
interface MemberWithOrgRaw {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  status: string;
  invited_by?: string;
  joined_at: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    logo_url?: string;
    type: string;
    settings?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
  };
}

export type UserOrganization = {
  org: Organization;
  role: OrganizationRole;
  membershipId: string;
};

export type CurrentOrganization = {
  data: Organization;
  myMembership: OrganizationMember;
};

interface AuthState {
  user: User | null;
  profile: Profile | null;
  myOrganizations: UserOrganization[];
  currentOrg: CurrentOrganization | null;
  isLoading: boolean;
}

// CORRECCIÓN: Agregamos signOut a la interfaz
interface AuthContextType extends AuthState {
  refreshProfile: () => Promise<void>;
  switchOrganization: (orgId: string) => void;
  signOut: () => Promise<void>; 
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  myOrganizations: [],
  currentOrg: null,
  isLoading: true,
  refreshProfile: async () => {},
  switchOrganization: () => {},
  signOut: async () => {}, // Valor por defecto
});

const ORG_COOKIE_NAME = "oasis_current_org";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    myOrganizations: [],
    currentOrg: null,
    isLoading: true,
  });

  const supabase = createClient();
  const router = useRouter();

// Helper para parsear la org
  interface OrganizationRow {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      logo_url: string | null;
      type: string;
      settings: string | Record<string, unknown> | null;
      created_at: string;
      updated_at: string;
  }

  const getOrg = useCallback((rawOrg: unknown): Organization | null => {
    if (!rawOrg || typeof rawOrg !== 'object') return null;
    const org = rawOrg as OrganizationRow;
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      logo_url: org.logo_url,
      type: org.type as Organization["type"],
      settings: typeof org.settings === "string" ? JSON.parse(org.settings) : org.settings,
      created_at: org.created_at,
      updated_at: org.updated_at,
    };
  }, []);

  const fetchUserData = useCallback(async () => {
    // Timeout Promise
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth timeout')), 8000); // 8 second timeout
    });

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const authLogic = async () => {
          // A. LOGICA MOCK
          if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
            console.log("⚡ Modo Mock Activo: Saltando Supabase");
            
            // Importar dinamicamente para evitar bundle issues si fuera necesario, 
            // aunque aquí importamos 'mockHandler' arriba idealmente o usamos import()
            const { mockHandler } = await import("@/core/api/mockData");

            // Simulamos latencia
            await new Promise(r => setTimeout(r, 500));

            const mockResponse = await mockHandler.get('/auth/me') as { user: Profile } | null;
            if (!mockResponse || !mockResponse.user) {
                 return { user: null, profile: null, myOrganizations: [], currentOrg: null, isLoading: false };
            }

            const user = mockResponse.user;

            // Construir estructura myOrgs mocked
             const myOrgsResp = await mockHandler.get('/organizations') as { data: Organization[] } | null;
             const allOrgs = myOrgsResp?.data || [];
             
             // Por simplicidad en mock, asumimos membresía en todas o algunas
             // De hecho, deberíamos usar el mockHandler para memberships, pero lo haremos simple:
             // Filtramos las orgs "visibles" para este usuario mock o simplemente devolvemos todo lo que hay en mockData
             const myOrgs: UserOrganization[] = allOrgs.map((org: Organization) => ({
                 org,
                 role: 'admin', // Default role for mock
                 membershipId: `mem-${org.id}`
             }));

             let currentOrgData: CurrentOrganization | null = null;
             if (myOrgs.length > 0) {
                 const savedOrgId = getCookie(ORG_COOKIE_NAME);
                 const activeOrg = myOrgs.find(o => o.org.id === savedOrgId) || myOrgs[0];
                 
                 if (activeOrg) {
                     currentOrgData = {
                         data: activeOrg.org,
                         myMembership: {
                             id: activeOrg.membershipId,
                             organization_id: activeOrg.org.id,
                             user_id: user.id,
                             role: activeOrg.role,
                             status: 'active',
                             invited_by: null,
                             joined_at: new Date().toISOString()
                         }
                     };
                     setCookie(ORG_COOKIE_NAME, activeOrg.org.id);
                 }
             }

            return {
              user: { id: user.id, email: user.email } as User,
              profile: user,
              myOrganizations: myOrgs,
              currentOrg: currentOrgData,
              isLoading: false,
            };
          }

          // B. LOGICA REAL (Supabase)
          // 1. Auth User
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError || !user) {
            return { user: null, profile: null, myOrganizations: [], currentOrg: null, isLoading: false };
          }

          // 2. Profile
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (profileError) {
            console.error("Critical DB Error fetching profile:", JSON.stringify(profileError, null, 2));
          }

          if (!profile) {
            console.warn("Usuario autenticado sin perfil. Esperando creación...");
            return { user, profile: null, myOrganizations: [], currentOrg: null, isLoading: false };
          }

          // 3. Memberships
          const { data: membersData } = await supabase
            .from("organization_members")
            .select(`
              id, organization_id, user_id, role, status, invited_by, joined_at,
              organization:organizations (*)
            `)
            .eq("user_id", user.id)
            .eq("status", "active");

          // Procesar Orgs
          const members = (membersData || []) as unknown as MemberWithOrgRaw[];
          
          const myOrgs: UserOrganization[] = members
            .map((m) => {
              const org = getOrg(m.organization);
              return org ? { org, role: m.role as OrganizationRole, membershipId: m.id } : null;
            })
            .filter((item): item is UserOrganization => item !== null);

          // Determinar Org Actual
          let currentOrgData: CurrentOrganization | null = null;
          if (myOrgs.length > 0) {
            const savedOrgId = getCookie(ORG_COOKIE_NAME);
            const activeMemberRaw = members.find(m => m.organization_id === savedOrgId) || members[0];
            const org = getOrg(activeMemberRaw.organization);
            
            if (org) {
              currentOrgData = {
                data: org,
                myMembership: {
                  id: activeMemberRaw.id,
                  organization_id: activeMemberRaw.organization_id,
                  user_id: activeMemberRaw.user_id,
                  role: activeMemberRaw.role as OrganizationRole,
                  status: activeMemberRaw.status as OrganizationMember['status'],
                  invited_by: activeMemberRaw.invited_by ?? null,
                  joined_at: activeMemberRaw.joined_at,
                },
              };
              setCookie(ORG_COOKIE_NAME, org.id);
            }
          }

          return {
            user,
            profile: profile as Profile,
            myOrganizations: myOrgs,
            currentOrg: currentOrgData,
            isLoading: false,
          };
      };

      // Race against timeout
      const newState = await Promise.race([authLogic(), timeoutPromise]) as AuthState | undefined;
      
      if (newState) {
          if (!newState.user) deleteCookie(ORG_COOKIE_NAME);
          setState(newState);
      }

    } catch (err) {
      console.error("Auth Context Crash or Timeout:", err);
      // Force loading false on error/timeout
      setState((prev) => ({ 
          ...prev, 
          isLoading: false,
          user: null, 
          profile: null, 
          myOrganizations: [], 
          currentOrg: null 
      }));
      deleteCookie(ORG_COOKIE_NAME);
    }
  }, [supabase, getOrg]);

  // CORRECCIÓN: Implementación de la función signOut
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      deleteCookie(ORG_COOKIE_NAME);
      setState({
        user: null,
        profile: null,
        myOrganizations: [],
        currentOrg: null,
        isLoading: false
      });
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    // Use a flag or check to prevent synchronous state updates if already loading?
    // Actually, just wrapping in a minimal timeout puts it on various queue, valid for "sync" check usually.
    // Or simpler: verify if we can skip the first isLoading set if we are mounting.
    setTimeout(() => {
        fetchUserData(); 
    }, 0); 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setState({ user: null, profile: null, myOrganizations: [], currentOrg: null, isLoading: false });
        deleteCookie(ORG_COOKIE_NAME);
      } else {
        fetchUserData();
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchUserData, supabase]);

  const switchOrganization = (orgId: string) => {
    setCookie(ORG_COOKIE_NAME, orgId);
    fetchUserData();
  };

  return (
    <AuthContext.Provider value={{ ...state, refreshProfile: fetchUserData, switchOrganization, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}