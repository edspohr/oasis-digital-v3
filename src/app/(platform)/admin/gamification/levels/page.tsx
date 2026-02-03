"use client";

import { useState, useEffect } from "react";
import { Plus, Trophy } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useGamificationAdmin } from "@/features/gamification/hooks/useGamificationAdmin";
import { LevelsTable } from "@/features/gamification/components/LevelsTable";
import {
  LevelFormDialog,
  type LevelFormData,
} from "@/features/gamification/components/LevelFormDialog";
import type { Level } from "@/core/api/gamification-admin.api";

export default function AdminLevelsPage() {
  const {
    levels,
    isLoading,
    isSaving,
    loadLevels,
    createLevel,
    updateLevel,
    deleteLevel,
  } = useGamificationAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  const handleCreate = () => {
    setSelectedLevel(null);
    setIsFormOpen(true);
  };

  const handleEdit = (level: Level) => {
    setSelectedLevel(level);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (level: Level) => {
    setSelectedLevel(level);
    setIsDeleteOpen(true);
  };

  const handleSave = async (data: LevelFormData) => {
    try {
      const payload = {
        name: data.name,
        min_points: data.min_points,
        icon_url: data.icon_url || undefined,
        benefits: JSON.parse(data.benefits),
      };

      if (selectedLevel) {
        await updateLevel(selectedLevel.id, payload);
      } else {
        await createLevel(payload);
      }
      setIsFormOpen(false);
      setSelectedLevel(null);
      loadLevels();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async () => {
    if (!selectedLevel) return;
    try {
      await deleteLevel(selectedLevel.id);
      setIsDeleteOpen(false);
      setSelectedLevel(null);
      loadLevels();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const stats = {
    total: levels.length,
    usersWithLevel: levels.reduce((acc, l) => acc + l.users_at_level, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Gestion de Niveles
          </h1>
          <p className="text-gray-600">
            Configura los niveles de progresion para tu organizacion.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Nivel
        </Button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-lg p-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Niveles</div>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <div className="text-2xl font-bold">{stats.usersWithLevel}</div>
            <div className="text-sm text-gray-500">Usuarios con Nivel</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <LevelsTable
          levels={levels}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Create Empty State */}
      {!isLoading && levels.length === 0 && (
        <div className="text-center py-8">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Nivel
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <LevelFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        level={selectedLevel}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Nivel</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Los usuarios que tenian este nivel
              pasaran al nivel inferior. Se eliminara &quot;{selectedLevel?.name}&quot;.
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
