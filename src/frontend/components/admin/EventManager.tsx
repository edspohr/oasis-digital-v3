"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Badge } from "@/frontend/components/ui/badge";
import { Calendar, Search, MoreHorizontal, Map, ChevronRight, Users, Target } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";

// Mock data with relationship to Journeys
interface Journey {
  id: string;
  title: string;
  progress: number;
  status: 'draft' | 'active' | 'completed';
  totalSteps: number;
  completedParticipants: number;
  totalParticipants: number;
}

interface Event {
  id: number;
  title: string;
  date: string;
  participants: number;
  status: 'Programado' | 'Abierto' | 'Finalizado';
  type: 'Taller' | 'Webinar' | 'Programa';
  cohort?: string;
  journeys: Journey[];
}

const initialEvents: Event[] = [
  { 
    id: 1, 
    title: "Taller de Empatía Corporativa", 
    date: "2024-10-15", 
    participants: 24, 
    status: "Programado",
    type: "Taller",
    cohort: "Taller PAP - Nov 2024",
    journeys: [
      { id: "j1", title: "Fundamentos de Empatía", progress: 0, status: 'draft', totalSteps: 5, completedParticipants: 0, totalParticipants: 24 },
      { id: "j2", title: "Práctica de Escucha Activa", progress: 0, status: 'draft', totalSteps: 4, completedParticipants: 0, totalParticipants: 24 },
    ]
  },
  { 
    id: 2, 
    title: "Webinar: Pausa Sagrada", 
    date: "2024-10-20", 
    participants: 150, 
    status: "Abierto",
    type: "Webinar",
    journeys: [
      { id: "j3", title: "Meditación Guiada", progress: 65, status: 'active', totalSteps: 3, completedParticipants: 98, totalParticipants: 150 },
    ]
  },
  { 
    id: 3, 
    title: "Círculo de Escucha Activa", 
    date: "2024-10-12", 
    participants: 15, 
    status: "Finalizado",
    type: "Taller",
    cohort: "Taller PAP - Sep 2024",
    journeys: [
      { id: "j4", title: "Técnicas de Escucha", progress: 100, status: 'completed', totalSteps: 6, completedParticipants: 14, totalParticipants: 15 },
      { id: "j5", title: "Aplicación Práctica", progress: 100, status: 'completed', totalSteps: 4, completedParticipants: 14, totalParticipants: 15 },
    ]
  },
  {
    id: 4,
    title: "Programa de Primeros Auxilios Psicológicos",
    date: "2024-11-01",
    participants: 45,
    status: "Abierto",
    type: "Programa",
    cohort: "Programa Vigilancia Q4",
    journeys: [
      { id: "j6", title: "Introducción PAP", progress: 80, status: 'active', totalSteps: 5, completedParticipants: 36, totalParticipants: 45 },
      { id: "j7", title: "Técnicas de Intervención", progress: 45, status: 'active', totalSteps: 8, completedParticipants: 20, totalParticipants: 45 },
      { id: "j8", title: "Casos Prácticos", progress: 10, status: 'active', totalSteps: 6, completedParticipants: 5, totalParticipants: 45 },
    ]
  }
];

// Journey Status Badge
const JourneyStatusBadge = ({ status }: { status: Journey['status'] }) => {
  const config = {
    draft: { label: 'Borrador', className: 'bg-gray-100 text-gray-600' },
    active: { label: 'Activo', className: 'bg-green-100 text-green-700' },
    completed: { label: 'Completado', className: 'bg-blue-100 text-blue-700' },
  };
  const { label, className } = config[status];
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

// Progress Bar Component
const ProgressBar = ({ progress, size = 'md' }: { progress: number; size?: 'sm' | 'md' }) => {
  const color = progress >= 80 ? 'bg-green-500' : progress >= 40 ? 'bg-yellow-500' : 'bg-gray-300';
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  const width = size === 'sm' ? 'w-16' : 'w-24';
  return (
    <div className="flex items-center gap-2">
      <div className={`${height} ${width} bg-gray-100 rounded-full overflow-hidden`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-600">{progress}%</span>
    </div>
  );
};

export function EventManager() {
    const [events] = useState<Event[]>(initialEvents);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEvents = events.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl border border-white">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      placeholder="Buscar evento..." 
                      className="pl-10 bg-white" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white/80 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Evento</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Participantes</TableHead>
                            <TableHead>Journeys</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEvents.map((event) => (
                            <TableRow 
                                key={event.id} 
                                className="hover:bg-gray-50/50 cursor-pointer group"
                                onClick={() => setSelectedEvent(event)}
                            >
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                          <span className="block">{event.title}</span>
                                          {event.cohort && (
                                            <span className="text-xs text-gray-500">{event.cohort}</span>
                                          )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-normal">
                                    {event.type}
                                  </Badge>
                                </TableCell>
                                <TableCell>{event.date}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    {event.participants}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Map className="h-4 w-4 text-indigo-500" />
                                    <span className="font-medium">{event.journeys.length}</span>
                                    <span className="text-xs text-gray-500">asociados</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        event.status === 'Programado' ? 'bg-blue-100 text-blue-700' :
                                        event.status === 'Abierto' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {event.status}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Ver detalles">
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                      </Button>
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                                  <span className="sr-only">Open menu</span>
                                                  <MoreHorizontal className="h-4 w-4" />
                                              </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                              <DropdownMenuItem>Editar</DropdownMenuItem>
                                              <DropdownMenuItem>Duplicar</DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem className="text-red-600">Cancelar evento</DropdownMenuItem>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Event Details Slide-over (Shows related Journeys) */}
            <Sheet open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <SheetContent className="w-[500px] sm:w-[640px] overflow-y-auto">
                    {selectedEvent && (
                        <>
                            <SheetHeader className="pb-4 border-b">
                                <div className="flex items-start gap-4">
                                    <div className="h-14 w-14 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                        <Calendar className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1">
                                        <SheetTitle className="text-xl">{selectedEvent.title}</SheetTitle>
                                        <SheetDescription className="flex items-center gap-3 mt-1">
                                            <Badge variant="outline">{selectedEvent.type}</Badge>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                selectedEvent.status === 'Programado' ? 'bg-blue-100 text-blue-700' :
                                                selectedEvent.status === 'Abierto' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {selectedEvent.status}
                                            </span>
                                        </SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            <Tabs defaultValue="journeys" className="mt-6">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="journeys">
                                        <Map className="h-4 w-4 mr-2" />
                                        Journeys ({selectedEvent.journeys.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="info">
                                        <Target className="h-4 w-4 mr-2" />
                                        Información
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="journeys" className="mt-4 space-y-3">
                                    {selectedEvent.journeys.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Map className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                                            <p>No hay Journeys asociados a este evento.</p>
                                            <Button variant="outline" className="mt-3" size="sm">
                                                Asociar Journey
                                            </Button>
                                        </div>
                                    ) : (
                                        selectedEvent.journeys.map((journey) => (
                                            <div 
                                              key={journey.id} 
                                              className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                            <Map className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                                {journey.title}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">{journey.totalSteps} pasos</p>
                                                        </div>
                                                    </div>
                                                    <JourneyStatusBadge status={journey.status} />
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <ProgressBar progress={journey.progress} />
                                                    <div className="text-xs text-gray-500">
                                                        <Users className="h-3 w-3 inline mr-1" />
                                                        {journey.completedParticipants}/{journey.totalParticipants} completaron
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    
                                    <Button variant="outline" className="w-full mt-4" size="sm">
                                        + Asociar Nuevo Journey
                                    </Button>
                                </TabsContent>

                                <TabsContent value="info" className="mt-4 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-xs">Fecha</span>
                                            </div>
                                            <p className="font-medium">{selectedEvent.date}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                <Users className="h-4 w-4" />
                                                <span className="text-xs">Participantes</span>
                                            </div>
                                            <p className="font-medium">{selectedEvent.participants}</p>
                                        </div>
                                    </div>
                                    
                                    {selectedEvent.cohort && (
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                                <Target className="h-4 w-4" />
                                                <span className="text-xs">Cohorte</span>
                                            </div>
                                            <p className="font-medium">{selectedEvent.cohort}</p>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t flex gap-2">
                                        <Button variant="outline" className="flex-1">Editar Evento</Button>
                                        <Button className="flex-1">Ver Participantes</Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
