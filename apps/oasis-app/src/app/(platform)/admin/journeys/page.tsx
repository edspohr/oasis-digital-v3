"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Map,
  Users,
  Layers,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Input } from "@/shared/components/ui/input";
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
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent } from "@/shared/components/ui/card";
import { createClient } from "@/backend/supabase/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

interface Journey {
  id: string;
  organization_id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  steps_count?: number;
  enrollments_count?: number;
}

interface JourneyFormData {
  title: string;
  slug: string;
  description: string;
  is_active: boolean;
}

const initialFormData: JourneyFormData = {
  title: "",
  slug: "",
  description: "",
  is_active: true,
};

export default function AdminJourneysPage() {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [formData, setFormData] = useState<JourneyFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();
  const { currentOrg } = useAuth();

  useEffect(() => {
    if (currentOrg?.data.id) {
      loadJourneys();
    }
  }, [currentOrg?.data.id]);

  const loadJourneys = async () => {
    if (!currentOrg?.data.id) return;

    setIsLoading(true);
    try {
      // Get journeys with counts (tables are in 'journeys' schema)
      const { data: journeysData, error } = await supabase
        .schema("journeys")
        .from("journeys")
        .select(`
          *,
          steps:steps(count),
          enrollments:enrollments(count)
        `)
        .eq("organization_id", currentOrg.data.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to include counts
      const transformedJourneys = (journeysData || []).map((j: any) => ({
        ...j,
        steps_count: j.steps?.[0]?.count || 0,
        enrollments_count: j.enrollments?.[0]?.count || 0,
      }));

      setJourneys(transformedJourneys);
    } catch (error) {
      console.error("Error loading journeys:", error);
      toast.error("Error al cargar journeys");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.slug || !currentOrg?.data.id) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.schema("journeys").from("journeys").insert({
        organization_id: currentOrg.data.id,
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        is_active: formData.is_active,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("Ya existe un journey con ese slug");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Journey creado exitosamente");
      setIsCreateOpen(false);
      setFormData(initialFormData);
      await loadJourneys();
    } catch (error) {
      console.error("Error creating journey:", error);
      toast.error("Error al crear journey");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedJourney || !formData.title) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema("journeys")
        .from("journeys")
        .update({
          title: formData.title,
          slug: formData.slug,
          description: formData.description || null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedJourney.id);

      if (error) throw error;

      toast.success("Journey actualizado exitosamente");
      setIsEditOpen(false);
      setSelectedJourney(null);
      setFormData(initialFormData);
      await loadJourneys();
    } catch (error) {
      console.error("Error updating journey:", error);
      toast.error("Error al actualizar journey");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJourney) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .schema("journeys")
        .from("journeys")
        .delete()
        .eq("id", selectedJourney.id);

      if (error) throw error;

      toast.success("Journey eliminado exitosamente");
      setIsDeleteOpen(false);
      setSelectedJourney(null);
      await loadJourneys();
    } catch (error) {
      console.error("Error deleting journey:", error);
      toast.error("Error al eliminar journey");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (journey: Journey) => {
    try {
      const { error } = await supabase
        .schema("journeys")
        .from("journeys")
        .update({ is_active: !journey.is_active, updated_at: new Date().toISOString() })
        .eq("id", journey.id);

      if (error) throw error;

      toast.success(journey.is_active ? "Journey desactivado" : "Journey activado");
      await loadJourneys();
    } catch (error) {
      console.error("Error toggling journey:", error);
      toast.error("Error al cambiar estado");
    }
  };

  const openEditDialog = (journey: Journey) => {
    setSelectedJourney(journey);
    setFormData({
      title: journey.title,
      slug: journey.slug,
      description: journey.description || "",
      is_active: journey.is_active,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (journey: Journey) => {
    setSelectedJourney(journey);
    setIsDeleteOpen(true);
  };

  const filteredJourneys = journeys.filter((journey) => {
    const matchesSearch =
      journey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      journey.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && journey.is_active) ||
      (filterStatus === "inactive" && !journey.is_active);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: journeys.length,
    active: journeys.filter((j) => j.is_active).length,
    totalEnrollments: journeys.reduce((acc, j) => acc + (j.enrollments_count || 0), 0),
    totalSteps: journeys.reduce((acc, j) => acc + (j.steps_count || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Gestion de Journeys
          </h1>
          <p className="text-gray-600">
            Crea y administra las rutas de experiencia para tus participantes.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Journey
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Map className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-500">Journeys</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 rounded-lg p-2">
                <ToggleRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-sm text-gray-500">Activos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalSteps}</div>
                <div className="text-sm text-gray-500">Total Pasos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 rounded-lg p-2">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
                <div className="text-sm text-gray-500">Inscripciones</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar journeys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as "all" | "active" | "inactive")}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando journeys...</div>
        ) : filteredJourneys.length === 0 ? (
          <div className="p-8 text-center">
            <Map className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay journeys creados</p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primer Journey
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Journey</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Pasos</TableHead>
                <TableHead>Inscritos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJourneys.map((journey) => (
                <TableRow key={journey.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 rounded-lg p-2">
                        <Map className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{journey.title}</div>
                        {journey.description && (
                          <div className="text-sm text-gray-500 truncate max-w-[250px]">
                            {journey.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {journey.slug}
                    </code>
                  </TableCell>
                  <TableCell>{journey.steps_count || 0}</TableCell>
                  <TableCell>{journey.enrollments_count || 0}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        journey.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {journey.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(journey)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleActive(journey)}>
                          {journey.is_active ? (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(journey)}
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
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo Journey</DialogTitle>
            <DialogDescription>
              Crea una nueva ruta de experiencia para tus participantes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titulo *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ej: Regulacion Emocional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="regulacion-emocional"
              />
              <p className="text-xs text-gray-500">
                Identificador unico para URLs. Se genera automaticamente.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripcion del journey..."
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="is_active">Activo (visible para participantes)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? "Creando..." : "Crear Journey"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Journey</DialogTitle>
            <DialogDescription>Modifica los datos del journey.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titulo *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">Slug (URL)</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripcion</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-is_active">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Journey</DialogTitle>
            <DialogDescription>
              Esta accion no se puede deshacer. Se eliminara permanentemente el journey
              &quot;{selectedJourney?.title}&quot; y todos sus pasos asociados.
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
