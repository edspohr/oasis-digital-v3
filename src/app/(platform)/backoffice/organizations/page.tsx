"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Building2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useBackoffice } from "@/features/backoffice/hooks/useBackoffice";
import { OrganizationsTable } from "@/features/backoffice/components/OrganizationsTable";
import {
  OrganizationFormDialog,
  type OrganizationFormData,
} from "@/features/backoffice/components/OrganizationFormDialog";
import type { OrganizationWithStats } from "@/core/api/backoffice.api";

export default function BackofficeOrganizationsPage() {
  const {
    organizations,
    users,
    totalOrganizations,
    isLoading,
    isSaving,
    loadOrganizations,
    loadUsers,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  } = useBackoffice();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationWithStats | null>(null);

  // Load organizations on mount and when filters change
  useEffect(() => {
    const params: { search?: string; org_type?: string } = {};
    if (searchTerm) params.search = searchTerm;
    if (filterType && filterType !== "all") params.org_type = filterType;
    loadOrganizations(params);
  }, [searchTerm, filterType, loadOrganizations]);

  const handleSearchUsers = useCallback(
    (search: string) => {
      if (search.length >= 2) {
        loadUsers({ search, limit: 10 });
      }
    },
    [loadUsers]
  );

  const handleCreate = () => {
    setSelectedOrg(null);
    setIsFormOpen(true);
  };

  const handleEdit = (org: OrganizationWithStats) => {
    setSelectedOrg(org);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (org: OrganizationWithStats) => {
    setSelectedOrg(org);
    setIsDeleteOpen(true);
  };

  const handleSave = async (data: OrganizationFormData) => {
    try {
      if (selectedOrg) {
        // Update
        await updateOrganization(selectedOrg.id, {
          name: data.name,
          slug: data.slug,
          type: data.type,
          description: data.description || undefined,
          logo_url: data.logo_url || undefined,
        });
      } else {
        // Create
        await createOrganization({
          name: data.name,
          slug: data.slug,
          type: data.type,
          description: data.description || undefined,
          logo_url: data.logo_url || undefined,
          owner_user_id: data.owner_user_id!,
        });
      }
      setIsFormOpen(false);
      setSelectedOrg(null);
      loadOrganizations();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;
    try {
      await deleteOrganization(selectedOrg.id);
      setIsDeleteOpen(false);
      setSelectedOrg(null);
      loadOrganizations();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Gestion de Organizaciones
          </h1>
          <p className="text-gray-600">
            Administra todas las organizaciones de la plataforma.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Organizacion
        </Button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 rounded-lg p-2">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalOrganizations}</div>
            <div className="text-sm text-gray-500">Total Organizaciones</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="sponsor">Sponsor</SelectItem>
            <SelectItem value="provider">Provider</SelectItem>
            <SelectItem value="community">Comunidad</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <OrganizationsTable
          organizations={organizations}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Create/Edit Dialog */}
      <OrganizationFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        organization={selectedOrg}
        users={users}
        isSaving={isSaving}
        onSave={handleSave}
        onSearchUsers={handleSearchUsers}
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Organizacion</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente la
              organizacion &quot;{selectedOrg?.name}&quot; y todas sus membresías.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
              {isSaving ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
