"use client";

import { Edit, Trash2, MoreHorizontal, Award, Hash } from "lucide-react";
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
import type { Reward } from "@/core/api/gamification-admin.api";

interface BadgesTableProps {
  badges: Reward[];
  isLoading: boolean;
  onEdit: (badge: Reward) => void;
  onDelete: (badge: Reward) => void;
}

const typeLabels: Record<string, string> = {
  badge: "Insignia",
  points: "Puntos",
};

const typeColors: Record<string, string> = {
  badge: "bg-purple-100 text-purple-700",
  points: "bg-green-100 text-green-700",
};

export function BadgesTable({
  badges,
  isLoading,
  onEdit,
  onDelete,
}: BadgesTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando badges...
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="p-8 text-center">
        <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay badges configurados</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Badge</TableHead>
          <TableHead>Descripcion</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Veces Otorgado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {badges.map((badge) => (
          <TableRow key={badge.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 rounded-lg p-2">
                  {badge.icon_url ? (
                    <img
                      src={badge.icon_url}
                      alt={badge.name}
                      className="h-5 w-5 object-contain"
                    />
                  ) : (
                    <Award className="h-5 w-5 text-purple-600" />
                  )}
                </div>
                <div className="font-medium text-gray-900">{badge.name}</div>
              </div>
            </TableCell>
            <TableCell>
              {badge.description ? (
                <span className="text-sm text-gray-600 truncate max-w-[250px] block">
                  {badge.description}
                </span>
              ) : (
                <span className="text-gray-400 text-sm">Sin descripcion</span>
              )}
            </TableCell>
            <TableCell>
              <Badge className={typeColors[badge.type] || "bg-gray-100 text-gray-700"}>
                {typeLabels[badge.type] || badge.type}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Hash className="h-4 w-4 text-gray-400" />
                {badge.times_awarded}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(badge)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(badge)}
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
