"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { Event } from "@/frontend/services/events.service";

interface EventCardProps {
  event: Event;
  onEnroll?: (eventId: string) => void;
  onCancel?: (eventId: string) => void;
  isLoading?: boolean;
}

const typeLabels: Record<Event['type'], string> = {
  workshop: 'Taller',
  webinar: 'Webinar',
  meetup: 'Encuentro',
  conference: 'Conferencia',
};

const typeColors: Record<Event['type'], string> = {
  workshop: 'bg-purple-100 text-purple-700',
  webinar: 'bg-blue-100 text-blue-700',
  meetup: 'bg-green-100 text-green-700',
  conference: 'bg-orange-100 text-orange-700',
};

const statusLabels: Record<Event['status'], string> = {
  upcoming: 'Proximo',
  ongoing: 'En curso',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
};

export function EventCard({ event, onEnroll, onCancel, isLoading }: EventCardProps) {
  const spotsLeft = event.capacity - event.enrolledCount;
  const isFull = spotsLeft <= 0;
  const isUpcoming = event.status === 'upcoming';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header with type badge */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge className={cn("font-medium", typeColors[event.type])}>
            {typeLabels[event.type]}
          </Badge>
          {event.isEnrolled && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Inscrito
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mt-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {event.description}
        </p>
      </div>

      {/* Event details */}
      <div className="px-4 py-3 space-y-2 bg-gray-50/50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="capitalize">{formatDate(event.date)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{event.time} hrs</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="truncate">{event.location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-gray-400" />
          <span>
            {event.enrolledCount}/{event.capacity} inscritos
            {!isFull && isUpcoming && (
              <span className="text-green-600 ml-1">({spotsLeft} lugares)</span>
            )}
            {isFull && <span className="text-red-500 ml-1">(Lleno)</span>}
          </span>
        </div>
      </div>

      {/* Action button */}
      <div className="p-4 pt-2">
        {isUpcoming ? (
          event.isEnrolled ? (
            <Button
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onCancel?.(event.id)}
              disabled={isLoading}
            >
              Cancelar Inscripcion
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={() => onEnroll?.(event.id)}
              disabled={isLoading || isFull}
            >
              {isFull ? 'Sin Lugares' : 'Inscribirme'}
            </Button>
          )
        ) : (
          <Badge variant="secondary" className="w-full justify-center py-2">
            {statusLabels[event.status]}
          </Badge>
        )}
      </div>
    </div>
  );
}
