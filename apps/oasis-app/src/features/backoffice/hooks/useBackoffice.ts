"use client";

import { useState, useCallback } from 'react';
import { backofficeApi } from '@/core/api';
import type {
  OrganizationWithStats,
  OrganizationCreateAdmin,
  OrganizationUpdateAdmin,
  UserBasicInfo,
  ListOrganizationsParams,
  ListUsersParams,
} from '@/core/api/backoffice.api';
import { toast } from 'sonner';

export function useBackoffice() {
  const [organizations, setOrganizations] = useState<OrganizationWithStats[]>([]);
  const [users, setUsers] = useState<UserBasicInfo[]>([]);
  const [totalOrganizations, setTotalOrganizations] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadOrganizations = useCallback(async (params?: ListOrganizationsParams) => {
    setIsLoading(true);
    try {
      const response = await backofficeApi.listOrganizations(params);
      setOrganizations(response.items);
      setTotalOrganizations(response.total);
      return response;
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Error al cargar organizaciones');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async (params?: ListUsersParams) => {
    try {
      const response = await backofficeApi.listUsers(params);
      setUsers(response.items);
      setTotalUsers(response.total);
      return response;
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
      throw error;
    }
  }, []);

  const createOrganization = useCallback(async (data: OrganizationCreateAdmin) => {
    setIsSaving(true);
    try {
      const org = await backofficeApi.createOrganization(data);
      toast.success('Organizacion creada exitosamente');
      return org;
    } catch (error: any) {
      console.error('Error creating organization:', error);
      const message = error?.message || 'Error al crear organizacion';
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const updateOrganization = useCallback(async (orgId: string, data: OrganizationUpdateAdmin) => {
    setIsSaving(true);
    try {
      const org = await backofficeApi.updateOrganization(orgId, data);
      toast.success('Organizacion actualizada exitosamente');
      return org;
    } catch (error: any) {
      console.error('Error updating organization:', error);
      const message = error?.message || 'Error al actualizar organizacion';
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const deleteOrganization = useCallback(async (orgId: string) => {
    setIsSaving(true);
    try {
      await backofficeApi.deleteOrganization(orgId);
      toast.success('Organizacion eliminada exitosamente');
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      const message = error?.message || 'Error al eliminar organizacion';
      toast.error(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    // State
    organizations,
    users,
    totalOrganizations,
    totalUsers,
    isLoading,
    isSaving,
    // Actions
    loadOrganizations,
    loadUsers,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  };
}
