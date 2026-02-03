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
import type { Level } from "@/core/api/gamification-admin.api";

interface LevelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level?: Level | null;
  isSaving: boolean;
  onSave: (data: LevelFormData) => void;
}

export interface LevelFormData {
  name: string;
  min_points: number;
  icon_url: string;
  benefits: string; // JSON string
}

const initialFormData: LevelFormData = {
  name: "",
  min_points: 0,
  icon_url: "",
  benefits: "{}",
};

export function LevelFormDialog({
  open,
  onOpenChange,
  level,
  isSaving,
  onSave,
}: LevelFormDialogProps) {
  const [formData, setFormData] = useState<LevelFormData>(initialFormData);
  const [benefitsError, setBenefitsError] = useState<string | null>(null);

  const isEditing = !!level;

  useEffect(() => {
    if (level) {
      setFormData({
        name: level.name,
        min_points: level.min_points,
        icon_url: level.icon_url || "",
        benefits: JSON.stringify(level.benefits || {}, null, 2),
      });
    } else {
      setFormData(initialFormData);
    }
    setBenefitsError(null);
  }, [level, open]);

  const handleBenefitsChange = (value: string) => {
    setFormData({ ...formData, benefits: value });
    try {
      JSON.parse(value);
      setBenefitsError(null);
    } catch {
      setBenefitsError("JSON invalido");
    }
  };

  const handleSubmit = () => {
    if (!formData.name || formData.min_points < 0) {
      return;
    }
    try {
      JSON.parse(formData.benefits);
      onSave(formData);
    } catch {
      setBenefitsError("JSON invalido");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Nivel" : "Nuevo Nivel"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica la configuracion del nivel."
              : "Crea un nuevo nivel de progresion."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Explorador"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_points">Puntos Minimos *</Label>
            <Input
              id="min_points"
              type="number"
              min={0}
              value={formData.min_points}
              onChange={(e) =>
                setFormData({ ...formData, min_points: parseInt(e.target.value) || 0 })
              }
              placeholder="0"
            />
            <p className="text-xs text-gray-500">
              Puntos necesarios para alcanzar este nivel.
            </p>
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
            <Label htmlFor="benefits">Beneficios (JSON)</Label>
            <Textarea
              id="benefits"
              value={formData.benefits}
              onChange={(e) => handleBenefitsChange(e.target.value)}
              placeholder='{"feature": true}'
              rows={4}
              className={benefitsError ? "border-red-500" : ""}
            />
            {benefitsError && (
              <p className="text-xs text-red-500">{benefitsError}</p>
            )}
            <p className="text-xs text-gray-500">
              Objeto JSON con beneficios del nivel.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !formData.name || !!benefitsError}
          >
            {isSaving ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Nivel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
