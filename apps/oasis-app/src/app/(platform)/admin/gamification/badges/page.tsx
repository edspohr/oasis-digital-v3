"use client";

import { useState, useEffect } from "react";
import { Plus, Award } from "lucide-react";
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
import { BadgesTable } from "@/features/gamification/components/BadgesTable";
import {
  BadgeFormDialog,
  type BadgeFormData,
} from "@/features/gamification/components/BadgeFormDialog";
import type { Reward } from "@/core/api/gamification-admin.api";

export default function AdminBadgesPage() {
  const {
    rewards: badges,
    isLoading,
    isSaving,
    loadRewards,
    createReward,
    updateReward,
    deleteReward,
  } = useGamificationAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Reward | null>(null);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const handleCreate = () => {
    setSelectedBadge(null);
    setIsFormOpen(true);
  };

  const handleEdit = (badge: Reward) => {
    setSelectedBadge(badge);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (badge: Reward) => {
    setSelectedBadge(badge);
    setIsDeleteOpen(true);
  };

  const handleSave = async (data: BadgeFormData) => {
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        type: data.type,
        icon_url: data.icon_url || undefined,
        unlock_condition: JSON.parse(data.unlock_condition),
      };

      if (selectedBadge) {
        await updateReward(selectedBadge.id, payload);
      } else {
        await createReward(payload);
      }
      setIsFormOpen(false);
      setSelectedBadge(null);
      loadRewards();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async () => {
    if (!selectedBadge) return;
    try {
      await deleteReward(selectedBadge.id);
      setIsDeleteOpen(false);
      setSelectedBadge(null);
      loadRewards();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const stats = {
    total: badges.length,
    timesAwarded: badges.reduce((acc, b) => acc + b.times_awarded, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Gestion de Badges
          </h1>
          <p className="text-gray-600">
            Configura insignias y recompensas para reconocer logros.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Badge
        </Button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-2">
              <Award className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Badges</div>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-200" />
          <div>
            <div className="text-2xl font-bold">{stats.timesAwarded}</div>
            <div className="text-sm text-gray-500">Veces Otorgados</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <BadgesTable
          badges={badges}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Create Empty State */}
      {!isLoading && badges.length === 0 && (
        <div className="text-center py-8">
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Badge
          </Button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <BadgeFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        badge={selectedBadge}
        isSaving={isSaving}
        onSave={handleSave}
      />

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Badge</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Los usuarios que ya obtuvieron este
              badge lo conservan. Se eliminara &quot;{selectedBadge?.name}&quot;.
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
