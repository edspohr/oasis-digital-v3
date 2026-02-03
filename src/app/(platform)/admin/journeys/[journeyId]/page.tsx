"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Save,
  Video,
  FileText,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  Flag,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Separator } from "@/shared/components/ui/separator";
import { createClient } from "@/backend/supabase/client";
import { toast } from "sonner";

type StepType =
  | "survey"
  | "event_attendance"
  | "content_view"
  | "milestone"
  | "social_interaction"
  | "resource_consumption";

interface Step {
  id: string;
  journey_id: string;
  title: string;
  type: StepType;
  order_index: number;
  config: Record<string, any>;
  gamification_rules: {
    points_base: number;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

interface Journey {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

interface StepFormData {
  title: string;
  type: StepType;
  config: {
    url?: string;
    duration_minutes?: number;
    description?: string;
  };
  points_base: number;
}

const stepTypeConfig: Record<StepType, { label: string; icon: React.ElementType; color: string }> = {
  survey: { label: "Encuesta", icon: FileText, color: "bg-blue-100 text-blue-600" },
  event_attendance: { label: "Evento/Sesion", icon: Calendar, color: "bg-purple-100 text-purple-600" },
  content_view: { label: "Video/Contenido", icon: Video, color: "bg-red-100 text-red-600" },
  milestone: { label: "Hito", icon: Flag, color: "bg-green-100 text-green-600" },
  social_interaction: { label: "Interaccion Social", icon: MessageSquare, color: "bg-yellow-100 text-yellow-600" },
  resource_consumption: { label: "Lectura/Recurso", icon: BookOpen, color: "bg-orange-100 text-orange-600" },
};

const initialStepForm: StepFormData = {
  title: "",
  type: "content_view",
  config: {},
  points_base: 10,
};

export default function JourneyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const journeyId = params.journeyId as string;

  const [journey, setJourney] = useState<Journey | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [isDeleteStepOpen, setIsDeleteStepOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [stepForm, setStepForm] = useState<StepFormData>(initialStepForm);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [journeyId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load journey
      const { data: journeyData, error: journeyError } = await supabase
        .schema("journeys")
        .from("journeys")
        .select("*")
        .eq("id", journeyId)
        .single();

      if (journeyError) throw journeyError;
      setJourney(journeyData);

      // Load steps
      const { data: stepsData, error: stepsError } = await supabase
        .schema("journeys")
        .from("steps")
        .select("*")
        .eq("journey_id", journeyId)
        .order("order_index", { ascending: true });

      if (stepsError) throw stepsError;
      setSteps(stepsData || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar el journey");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateStep = () => {
    setEditingStep(null);
    setStepForm(initialStepForm);
    setIsStepDialogOpen(true);
  };

  const openEditStep = (step: Step) => {
    setEditingStep(step);
    setStepForm({
      title: step.title,
      type: step.type,
      config: step.config || {},
      points_base: step.gamification_rules?.points_base || 10,
    });
    setIsStepDialogOpen(true);
  };

  const openDeleteStep = (step: Step) => {
    setSelectedStep(step);
    setIsDeleteStepOpen(true);
  };

  const handleSaveStep = async () => {
    if (!stepForm.title) {
      toast.error("El titulo es requerido");
      return;
    }

    setIsSaving(true);
    try {
      if (editingStep) {
        // Update existing step
        const { error } = await supabase
          .schema("journeys")
          .from("steps")
          .update({
            title: stepForm.title,
            type: stepForm.type,
            config: stepForm.config,
            gamification_rules: { points_base: stepForm.points_base },
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingStep.id);

        if (error) throw error;
        toast.success("Paso actualizado");
      } else {
        // Create new step
        const newOrderIndex = steps.length > 0
          ? Math.max(...steps.map(s => s.order_index)) + 1
          : 0;

        const { error } = await supabase
          .schema("journeys")
          .from("steps")
          .insert({
            journey_id: journeyId,
            title: stepForm.title,
            type: stepForm.type,
            order_index: newOrderIndex,
            config: stepForm.config,
            gamification_rules: { points_base: stepForm.points_base },
          });

        if (error) throw error;
        toast.success("Paso creado");
      }

      setIsStepDialogOpen(false);
      setEditingStep(null);
      setStepForm(initialStepForm);
      await loadData();
    } catch (error) {
      console.error("Error saving step:", error);
      toast.error("Error al guardar el paso");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStep = async () => {
    if (!selectedStep) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema("journeys")
        .from("steps")
        .delete()
        .eq("id", selectedStep.id);

      if (error) throw error;

      toast.success("Paso eliminado");
      setIsDeleteStepOpen(false);
      setSelectedStep(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting step:", error);
      toast.error("Error al eliminar el paso");
    } finally {
      setIsSaving(false);
    }
  };

  const moveStep = async (step: Step, direction: "up" | "down") => {
    const currentIndex = steps.findIndex(s => s.id === step.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= steps.length) return;

    const otherStep = steps[newIndex];

    try {
      // Swap order_index values
      await supabase
        .schema("journeys")
        .from("steps")
        .update({ order_index: otherStep.order_index })
        .eq("id", step.id);

      await supabase
        .schema("journeys")
        .from("steps")
        .update({ order_index: step.order_index })
        .eq("id", otherStep.id);

      await loadData();
    } catch (error) {
      console.error("Error reordering steps:", error);
      toast.error("Error al reordenar");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Journey no encontrado</p>
        <Button className="mt-4" onClick={() => router.push("/admin/journeys")}>
          Volver a Journeys
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/journeys")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-gray-800">
              {journey.title}
            </h1>
            <Badge className={journey.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
              {journey.is_active ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          {journey.description && (
            <p className="text-gray-600 mt-1">{journey.description}</p>
          )}
        </div>
      </div>

      {/* Journey Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Informacion del Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Slug:</span>
              <code className="ml-2 bg-gray-100 px-2 py-0.5 rounded">{journey.slug}</code>
            </div>
            <div>
              <span className="text-gray-500">Pasos:</span>
              <span className="ml-2 font-medium">{steps.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Puntos totales:</span>
              <span className="ml-2 font-medium">
                {steps.reduce((acc, s) => acc + (s.gamification_rules?.points_base || 0), 0)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Creado:</span>
              <span className="ml-2">
                {new Date(journey.created_at).toLocaleDateString("es-ES")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Pasos del Journey ({steps.length})
        </h2>
        <Button onClick={openCreateStep}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Paso
        </Button>
      </div>

      {steps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Flag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No hay pasos en este journey</p>
            <Button onClick={openCreateStep}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primer paso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => {
            const typeConfig = stepTypeConfig[step.type];
            const Icon = typeConfig.icon;

            return (
              <Card key={step.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Order controls */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => moveStep(step, "up")}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === steps.length - 1}
                        onClick={() => moveStep(step, "down")}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Step number */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {index + 1}
                    </div>

                    {/* Type icon */}
                    <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Step info */}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{step.title}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-3">
                        <span>{typeConfig.label}</span>
                        <span>•</span>
                        <span>{step.gamification_rules?.points_base || 0} puntos</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditStep(step)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteStep(step)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Step Dialog (Create/Edit) */}
      <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? "Editar Paso" : "Nuevo Paso"}
            </DialogTitle>
            <DialogDescription>
              {editingStep
                ? "Modifica la configuracion del paso."
                : "Agrega un nuevo paso al journey."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="step-title">Titulo *</Label>
              <Input
                id="step-title"
                value={stepForm.title}
                onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                placeholder="Ej: Ver video introductorio"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Paso</Label>
              <Select
                value={stepForm.type}
                onValueChange={(v) => setStepForm({ ...stepForm, type: v as StepType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(stepTypeConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Config based on type */}
            {(stepForm.type === "content_view" || stepForm.type === "resource_consumption") && (
              <div className="space-y-2">
                <Label htmlFor="step-url">URL del contenido</Label>
                <Input
                  id="step-url"
                  value={stepForm.config.url || ""}
                  onChange={(e) =>
                    setStepForm({
                      ...stepForm,
                      config: { ...stepForm.config, url: e.target.value },
                    })
                  }
                  placeholder="https://..."
                />
              </div>
            )}

            {stepForm.type === "survey" && (
              <div className="space-y-2">
                <Label htmlFor="survey-url">URL del formulario (Typeform, Google Forms, etc.)</Label>
                <Input
                  id="survey-url"
                  value={stepForm.config.url || ""}
                  onChange={(e) =>
                    setStepForm({
                      ...stepForm,
                      config: { ...stepForm.config, url: e.target.value },
                    })
                  }
                  placeholder="https://..."
                />
              </div>
            )}

            {stepForm.type === "event_attendance" && (
              <div className="space-y-2">
                <Label htmlFor="event-desc">Descripcion del evento</Label>
                <Textarea
                  id="event-desc"
                  value={stepForm.config.description || ""}
                  onChange={(e) =>
                    setStepForm({
                      ...stepForm,
                      config: { ...stepForm.config, description: e.target.value },
                    })
                  }
                  placeholder="Detalles de la sesion o evento..."
                  rows={2}
                />
              </div>
            )}

            {stepForm.type === "milestone" && (
              <div className="space-y-2">
                <Label htmlFor="milestone-desc">Descripcion del hito</Label>
                <Textarea
                  id="milestone-desc"
                  value={stepForm.config.description || ""}
                  onChange={(e) =>
                    setStepForm({
                      ...stepForm,
                      config: { ...stepForm.config, description: e.target.value },
                    })
                  }
                  placeholder="Que representa este hito..."
                  rows={2}
                />
              </div>
            )}

            <Separator />

            {/* Gamification */}
            <div className="space-y-2">
              <Label htmlFor="points">Puntos al completar</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={stepForm.points_base}
                onChange={(e) =>
                  setStepForm({ ...stepForm, points_base: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-gray-500">
                Puntos que gana el participante al completar este paso.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStepDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveStep} disabled={isSaving}>
              {isSaving ? "Guardando..." : editingStep ? "Guardar Cambios" : "Crear Paso"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Step Dialog */}
      <Dialog open={isDeleteStepOpen} onOpenChange={setIsDeleteStepOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Paso</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Se eliminara el paso
              &quot;{selectedStep?.title}&quot; y todo el progreso asociado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteStepOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteStep} disabled={isSaving}>
              {isSaving ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
