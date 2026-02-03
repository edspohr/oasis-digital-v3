"use client";

import { useState, useEffect } from "react";
import { Calendar, Filter, Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { EventCard } from "@/frontend/components/events/EventCard";
import { EventsCalendar } from "@/frontend/components/events/EventsCalendar";
import { eventsService, type Event } from "@/frontend/services/events.service";
import { toast } from "sonner";

type EventType = Event['type'] | 'all';

export default function ParticipantEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<EventType>('all');
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventsService.getEvents();
      setEvents(data);
    } catch (error) {
      toast.error("Error al cargar eventos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      const result = await eventsService.enrollInEvent(eventId);
      if (result.success) {
        toast.success(result.message);
        await loadEvents();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al inscribirse");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelEnrollment = async (eventId: string) => {
    setActionLoading(eventId);
    try {
      const result = await eventsService.cancelEnrollment(eventId);
      if (result.success) {
        toast.success(result.message);
        await loadEvents();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Error al cancelar inscripcion");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || event.type === selectedType;
    const matchesDate = !selectedDate || event.date === selectedDate;
    return matchesSearch && matchesType && matchesDate;
  });

  const myEvents = events.filter((event) => event.isEnrolled);
  const upcomingEvents = filteredEvents.filter((event) => event.status === 'upcoming');

  const typeFilters: { value: EventType; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'workshop', label: 'Talleres' },
    { value: 'webinar', label: 'Webinars' },
    { value: 'meetup', label: 'Encuentros' },
    { value: 'conference', label: 'Conferencias' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-gray-800">
            Eventos
          </h1>
          <p className="text-gray-600">
            Descubre talleres, webinars y encuentros de la comunidad.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            Lista
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Calendario
          </Button>
        </div>
      </div>

      {/* My Events Summary */}
      {myEvents.length > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
          <h2 className="font-semibold text-gray-800 mb-2">
            Mis Inscripciones ({myEvents.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {myEvents.map((event) => (
              <Badge key={event.id} variant="secondary" className="bg-white">
                {event.title} - {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {typeFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={selectedType === filter.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear date filter */}
      {selectedDate && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Filtrando: {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>
            Limpiar filtro
          </Button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border h-64 animate-pulse" />
          ))}
        </div>
      ) : view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <EventsCalendar
              events={events}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </div>
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-gray-800 mb-4">
              {selectedDate
                ? `Eventos del ${new Date(selectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`
                : 'Proximos Eventos'}
            </h2>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay eventos para esta fecha</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEnroll={handleEnroll}
                    onCancel={handleCancelEnrollment}
                    isLoading={actionLoading === event.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">Proximos ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="enrolled">Mis Eventos ({myEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay eventos proximos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEnroll={handleEnroll}
                    onCancel={handleCancelEnrollment}
                    isLoading={actionLoading === event.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrolled" className="mt-6">
            {myEvents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No estas inscrito en ningun evento</p>
                <p className="text-sm text-gray-400 mt-1">Explora los proximos eventos y registrate</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEnroll={handleEnroll}
                    onCancel={handleCancelEnrollment}
                    isLoading={actionLoading === event.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
