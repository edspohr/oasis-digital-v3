"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Map as MapIcon,
  Layers,
  ToggleLeft,
  ToggleRight,
  Loader2,
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
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useApi } from "@/core/hooks/useApi";
import { toast } from "sonner";
import type { Journey, JourneyStatus } from "@/core/types";
import { createClient } from "@/backend/supabase/client";

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

  const { currentOrg } = useAuth();
  const api = useApi();

  const loadJourneys = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.journey.getJourneys();
      // El API devuelve PaginatedResponse<Journey>, accedemos a .data
      setJourneys(response.data || []);
    } catch (error: unknown) {
      console.error("Error loading journeys:", error);
      toast.error("Error al cargar journeys");
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (currentOrg) {
      loadJourneys();
    }
  }, [currentOrg, loadJourneys]);

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
    if (!formData.title) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Crear el journey
      const newJourney = await api.journey.createJourney({
        title: formData.title,
        description: formData.description,
        // Nota: slug manual no es soportado por el API endpoint CreateJourneyRequest estándar
        // Se asume generación automática backend.
      });

      // 2. Si se requiere estado específico y difiere del default (draft)
      if (formData.is_active && newJourney.status !== 'active') {
        await api.journey.publishJourney(newJourney.id);
      } else if (!formData.is_active && newJourney.status === 'active') {
          // Si por defecto fuera active y queremos draft
         await api.journey.updateJourney(newJourney.id, { status: 'draft' });
      }

      toast.success("Journey creado exitosamente");
      setIsCreateOpen(false);
      setFormData(initialFormData);
      await loadJourneys();
    } catch (error: unknown) {
      console.error("Error creating journey:", error);
      let message = "Error al crear journey";
      if (error instanceof Error) message = error.message;
      toast.error(message);
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
      await api.journey.updateJourney(selectedJourney.id, {
        title: formData.title,
        description: formData.description,
        status: formData.is_active ? 'active' : 'draft',
      });

      toast.success("Journey actualizado exitosamente");
      setIsEditOpen(false);
      setSelectedJourney(null);
      setFormData(initialFormData);
      await loadJourneys();
    } catch (error: unknown) {
      console.error("Error updating journey:", error);
      let message = "Error al actualizar journey";
      if (error instanceof Error) message = error.message;
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedJourney) return;

    setIsSaving(true);
    try {
      await api.journey.deleteJourney(selectedJourney.id);
      
      toast.success("Journey eliminado exitosamente");
      setIsDeleteOpen(false);
      setSelectedJourney(null);
      await loadJourneys();
    } catch (error: unknown) {
      console.error("Error deleting journey:", error);
      let message = "Error al eliminar journey";
      if (error instanceof Error) message = error.message;
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (journey: Journey) => {
    try {
      const newStatus: JourneyStatus = journey.status === 'active' ? 'draft' : 'active';
      if (newStatus === 'active') {
         await api.journey.publishJourney(journey.id);
      } else {
         await api.journey.updateJourney(journey.id, { status: 'draft' });
      }

      toast.success(newStatus === 'active' ? "Journey activado" : "Journey desactivado");
      await loadJourneys();
    } catch (error: unknown) {
      console.error("Error toggling journey:", error);
      let message = "Error al cambiar estado";
      if (error instanceof Error) message = error.message;
      toast.error(message);
    }
  };

  const openEditDialog = (journey: Journey) => {
    setSelectedJourney(journey);
    setFormData({
      title: journey.title,
      slug: '', // Slug no disponible en tipo Journey por defecto, dejar vacío o extender tipo si backend lo envía
      description: journey.description || "",
      is_active: journey.status === 'active',
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (journey: Journey) => {
    setSelectedJourney(journey);
    setIsDeleteOpen(true);
  };

  const filteredJourneys = journeys.filter((journey) => {
    const matchesSearch =
      journey.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && journey.status === 'active') ||
      (filterStatus === "inactive" && journey.status !== 'active');
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: journeys.length,
    active: journeys.filter((j) => j.status === 'active').length,
    // totalEnrollments: journeys.reduce((acc, j) => acc + (j.enrollments_count || 0), 0), // No disponible en API listado simple
    totalSteps: journeys.reduce((acc, j) => acc + (j.total_steps || 0), 0),
  };

  // DEBUG: Test API Connection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [debugResult, setDebugResult] = useState<any>(null);
  
  const testConnection = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = {};
    setIsLoading(true);
    try {
      // 1. Manually get Token
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      results.auth = {
        hasToken: !!token,
        tokenPrefix: token ? token.substring(0, 15) + "..." : "NONE",
      };

      // 2. Resolve Org ID
      let orgId = null;
      if (currentOrg) {
         if ('data' in currentOrg) orgId = (currentOrg as unknown as { data: { id: string } }).data.id;
         else if ('id' in currentOrg) orgId = (currentOrg as unknown as { id: string }).id;
      }
      results.org = {
        hasOrg: !!currentOrg,
        resolvedId: orgId || "NONE"
      };

      // 3. Manual Fetch to Journeys
      const url = `${process.env.NEXT_PUBLIC_JOURNEY_SERVICE_URL || 'https://journey-service-dev-667040450291.us-central1.run.app/api/v1'}/journeys/`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (orgId) headers['X-Organization-ID'] = orgId;

      results.request = { url, headers };

      try {
        const response = await fetch(url, { headers });
        const text = await response.text();
        results.response = {
            status: response.status,
            statusText: response.statusText,
            params: 'page=1&limit=10 (implicit default)',
            bodyPreview: text.substring(0, 200)
        };
      } catch (e: unknown) {
        results.fetchError = String(e);
      }

      setDebugResult(results);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setDebugResult({ globalError: message });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* DEBUG PANEL - REMOVE AFTER FIXING */}
      <Card className="bg-yellow-50 border-yellow-200 mb-6">
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-2"> Debug Diagnostic Panel v2</h3>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="font-semibold">Org ID:</span> {currentOrg ? ('data' in currentOrg ? (currentOrg as unknown as { data: { id: string } }).data.id : (currentOrg as unknown as { id: string }).id) : 'MISSING'}
            </div>
          </div>
          <div className="flex gap-2">
             <Button size="sm" variant="outline" onClick={testConnection}>
               Run Comprehensive Diagnostics
             </Button>
          </div>
          {debugResult && (
            <div className="mt-4 p-3 bg-black/5 rounded text-xs overflow-auto max-h-60 font-mono">
              {JSON.stringify(debugResult, null, 2)}
            </div>
          )}
        </CardContent>
      </Card>

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
                <MapIcon className="h-5 w-5 text-blue-600" />
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
        {/* Ocultamos stats de inscripciones por ahora hasta que el API lo soporte en listado */}
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
          <div className="flex items-center justify-center p-12 text-gray-500">
             <Loader2 className="h-6 w-6 animate-spin mr-2" />
             Cargando journeys...
          </div>
        ) : filteredJourneys.length === 0 ? (
          <div className="p-8 text-center">
            <MapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
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
                <TableHead>Pasos</TableHead>
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
                        <MapIcon className="h-5 w-5 text-primary" />
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
                  <TableCell>{journey.total_steps || 0}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        journey.status === 'active'
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {journey.status === 'active' ? "Activo" : "Inactivo"}
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
                          {journey.status === 'active' ? (
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
            {/* Slug input hidden as API handles it */}
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
              {isSaving ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Creando...
                 </>
               ) : "Crear Journey"}
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
