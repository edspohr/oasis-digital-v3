"use client";

import { Edit, Trash2, MoreHorizontal, Trophy, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
import type { Level } from "@/core/api/gamification-admin.api";

interface LevelsTableProps {
  levels: Level[];
  isLoading: boolean;
  onEdit: (level: Level) => void;
  onDelete: (level: Level) => void;
}

export function LevelsTable({
  levels,
  isLoading,
  onEdit,
  onDelete,
}: LevelsTableProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Cargando niveles...
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className="p-8 text-center">
        <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No hay niveles configurados</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nivel</TableHead>
          <TableHead>Puntos Minimos</TableHead>
          <TableHead>Icono</TableHead>
          <TableHead>Beneficios</TableHead>
          <TableHead>Usuarios</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {levels.map((level, index) => (
          <TableRow key={level.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div
                  className="rounded-lg p-2"
                  style={{
                    backgroundColor: `hsl(${(index * 60) % 360}, 70%, 90%)`,
                  }}
                >
                  <Trophy
                    className="h-5 w-5"
                    style={{ color: `hsl(${(index * 60) % 360}, 70%, 40%)` }}
                  />
                </div>
                <div className="font-medium text-gray-900">{level.name}</div>
              </div>
            </TableCell>
            <TableCell>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                {level.min_points.toLocaleString()}
              </span>
            </TableCell>
            <TableCell>
              {level.icon_url ? (
                <img
                  src={level.icon_url}
                  alt={level.name}
                  className="h-8 w-8 object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">Sin icono</span>
              )}
            </TableCell>
            <TableCell>
              {Object.keys(level.benefits || {}).length > 0 ? (
                <span className="text-sm text-gray-600">
                  {Object.keys(level.benefits).length} beneficio(s)
                </span>
              ) : (
                <span className="text-gray-400 text-sm">Sin beneficios</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-400" />
                {level.users_at_level}
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
                  <DropdownMenuItem onClick={() => onEdit(level)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onDelete(level)}
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
