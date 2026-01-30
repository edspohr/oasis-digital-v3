"use client";

import { useState, useEffect } from "react";
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
import type { Reward } from "@/core/api/gamification-admin.api";

interface BadgeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge?: Reward | null;
  isSaving: boolean;
  onSave: (data: BadgeFormData) => void;
}

export interface BadgeFormData {
  name: string;
  description: string;
  type: "badge" | "points";
  icon_url: string;
  unlock_condition: string; // JSON string
}

const initialFormData: BadgeFormData = {
  name: "",
  description: "",
  type: "badge",
  icon_url: "",
  unlock_condition: "{}",
};

export function BadgeFormDialog({
  open,
  onOpenChange,
  badge,
  isSaving,
  onSave,
}: BadgeFormDialogProps) {
  const [formData, setFormData] = useState<BadgeFormData>(initialFormData);
  const [conditionError, setConditionError] = useState<string | null>(null);

  const isEditing = !!badge;

  useEffect(() => {
    if (badge) {
      setFormData({
        name: badge.name,
        description: badge.description || "",
        type: badge.type as "badge" | "points",
        icon_url: badge.icon_url || "",
        unlock_condition: JSON.stringify(badge.unlock_condition || {}, null, 2),
      });
    } else {
      setFormData(initialFormData);
    }
    setConditionError(null);
  }, [badge, open]);

  const handleConditionChange = (value: string) => {
    setFormData({ ...formData, unlock_condition: value });
    try {
      JSON.parse(value);
      setConditionError(null);
    } catch {
      setConditionError("JSON invalido");
    }
  };

  const handleSubmit = () => {
    if (!formData.name) {
      return;
    }
    try {
      JSON.parse(formData.unlock_condition);
      onSave(formData);
    } catch {
      setConditionError("JSON invalido");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Badge" : "Nuevo Badge"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica la configuracion del badge."
              : "Crea un nuevo badge o recompensa."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Primer Paso"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descripcion del badge..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "badge" | "points") =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="badge">Insignia</SelectItem>
                <SelectItem value="points">Puntos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon_url">URL del Icono</Label>
            <Input
              id="icon_url"
              value={formData.icon_url}
              onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unlock_condition">Condicion de Desbloqueo (JSON)</Label>
            <Textarea
              id="unlock_condition"
              value={formData.unlock_condition}
              onChange={(e) => handleConditionChange(e.target.value)}
              placeholder='{"type": "complete_journey", "journey_id": "..."}'
              rows={4}
              className={conditionError ? "border-red-500" : ""}
            />
            {conditionError && (
              <p className="text-xs text-red-500">{conditionError}</p>
            )}
            <p className="text-xs text-gray-500">
              Objeto JSON con la condicion para desbloquear el badge.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !formData.name || !!conditionError}
          >
            {isSaving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Badge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
