"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import type { OrganizationWithStats, UserBasicInfo } from "@/core/api/backoffice.api";

interface OrganizationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: OrganizationWithStats | null;
  users: UserBasicInfo[];
  isSaving: boolean;
  onSave: (data: OrganizationFormData) => void;
  onSearchUsers: (search: string) => void;
}

export interface OrganizationFormData {
  name: string;
  slug: string;
  type: string;
  description: string;
  logo_url: string;
  owner_user_id?: string;
}

const initialFormData: OrganizationFormData = {
  name: "",
  slug: "",
  type: "sponsor",
  description: "",
  logo_url: "",
  owner_user_id: "",
};

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function OrganizationFormDialog({
  open,
  onOpenChange,
  organization,
  users,
  isSaving,
  onSave,
  onSearchUsers,
}: OrganizationFormDialogProps) {
  const [formData, setFormData] = useState<OrganizationFormData>(initialFormData);
  const [userSearch, setUserSearch] = useState("");

  const isEditing = !!organization;

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        slug: organization.slug,
        type: organization.type,
        description: organization.description || "",
        logo_url: organization.logo_url || "",
      });
    } else {
      setFormData(initialFormData);
    }
    setUserSearch("");
  }, [organization, open]);

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: isEditing ? formData.slug : generateSlug(name),
    });
  };

  const handleUserSearch = (search: string) => {
    setUserSearch(search);
    onSearchUsers(search);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.slug) {
      return;
    }
    if (!isEditing && !formData.owner_user_id) {
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Organizacion" : "Nueva Organizacion"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos de la organizacion."
              : "Crea una nueva organizacion y asigna un propietario."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Mi Organizacion"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="mi-organizacion"
            />
            <p className="text-xs text-gray-500">
              Identificador unico para URLs. Se genera automaticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsor">Sponsor</SelectItem>
                <SelectItem value="provider">Provider</SelectItem>
                <SelectItem value="community">Comunidad</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripcion de la organizacion..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL del Logo</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label>Propietario (Owner) *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={userSearch}
                  onChange={(e) => handleUserSearch(e.target.value)}
                  placeholder="Buscar usuario por email..."
                  className="pl-10"
                />
              </div>
              {users.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => {
                        setFormData({ ...formData, owner_user_id: user.id });
                        setUserSearch(user.email);
                      }}
                      className={`p-2 cursor-pointer hover:bg-gray-50 ${
                        formData.owner_user_id === user.id ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="font-medium text-sm">{user.email}</div>
                      {user.full_name && (
                        <div className="text-xs text-gray-500">{user.full_name}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {formData.owner_user_id && (
                <p className="text-xs text-green-600">Usuario seleccionado</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !formData.name || !formData.slug || (!isEditing && !formData.owner_user_id)}
          >
            {isSaving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Organizacion"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
