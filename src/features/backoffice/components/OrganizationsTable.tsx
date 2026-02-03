"use client";

import { Edit, Trash2, MoreHorizontal, Building2, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { OrganizationWithStats } from "@/core/api/backoffice.api";

interface OrganizationsTableProps {
  organizations: OrganizationWithStats[];
  isLoading: boolean;
  onEdit: (org: OrganizationWithStats) => void;
  onDelete: (org: OrganizationWithStats) => void;
}

const typeLabels: Record<string, string> = {
  sponsor: "Sponsor",
  provider: "Provider",
  community: "Comunidad",
  enterprise: "Enterprise",
};

const typeColors: Record<string, string> = {
  sponsor: "bg-blue-100 text-blue-700",
  provider: "bg-purple-100 text-purple-700",
  community: "bg-green-100 text-green-700",
  enterprise: "bg-orange-100 text-orange-700",
};

export function OrganizationsTable({
  organizations,
  isLoading,
  onEdit,
  onDelete,
}: OrganizationsTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando organizaciones...
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="p-8 text-center">
        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay organizaciones</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Organizacion</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Miembros</TableHead>
          <TableHead>Creada</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {organizations.map((org) => (
          <TableRow key={org.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  {org.logo_url ? (
                    <img
                      src={org.logo_url}
                      alt={org.name}
                      className="h-5 w-5 object-contain"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{org.name}</div>
                  {org.description && (
                    <div className="text-sm text-gray-500 truncate max-w-[250px]">
                      {org.description}
                    </div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {org.slug}
              </code>
            </TableCell>
            <TableCell>
              <Badge className={typeColors[org.type] || "bg-gray-100 text-gray-700"}>
                {typeLabels[org.type] || org.type}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-400" />
                {org.member_count}
              </div>
            </TableCell>
            <TableCell>
              {new Date(org.created_at).toLocaleDateString("es-CL")}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(org)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(org)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
