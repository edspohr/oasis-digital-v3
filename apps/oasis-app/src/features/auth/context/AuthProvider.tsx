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
    settings?: any;
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
  const getOrg = useCallback((rawOrg: any): Organization | null => {
    if (!rawOrg) return null;
    return {
      id: rawOrg.id,
      name: rawOrg.name,
      slug: rawOrg.slug,
      description: rawOrg.description,
      logo_url: rawOrg.logo_url,
      type: rawOrg.type as Organization["type"],
      settings: typeof rawOrg.settings === "string" ? JSON.parse(rawOrg.settings) : rawOrg.settings,
      created_at: rawOrg.created_at,
      updated_at: rawOrg.updated_at,
    };
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // 1. Auth User
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setState({ user: null, profile: null, myOrganizations: [], currentOrg: null, isLoading: false });
        deleteCookie(ORG_COOKIE_NAME);
        return;
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
        setState({ user, profile: null, myOrganizations: [], currentOrg: null, isLoading: false });
        return;
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
        let activeMemberRaw = members.find(m => m.organization_id === savedOrgId) || members[0];
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

      setState({
        user,
        profile: profile as Profile,
        myOrganizations: myOrgs,
        currentOrg: currentOrgData,
        isLoading: false,
      });

    } catch (err) {
      console.error("Auth Context Crash:", err);
      setState((prev) => ({ ...prev, isLoading: false }));
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
    fetchUserData();
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