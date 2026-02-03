"use client";

import { useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { Event } from "@/frontend/services/events.service";

interface EventsCalendarProps {
  events: Event[];
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  currentMonth?: Date;
  onMonthChange?: (date: Date) => void;
}

const typeColors: Record<Event['type'], string> = {
  workshop: 'bg-purple-500',
  webinar: 'bg-blue-500',
  meetup: 'bg-green-500',
  conference: 'bg-orange-500',
};

export function EventsCalendar({
  events,
  selectedDate,
  onDateSelect,
  currentMonth = new Date(),
  onMonthChange,
}: EventsCalendarProps) {
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const dateKey = event.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });
    return map;
  }, [events]);

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    const startDay = monthStart.getDay();

    // Add empty cells for days before the month starts
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= monthEnd.getDate(); day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    }

    return days;
  }, [currentMonth, monthStart, monthEnd]);

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const goToPrevMonth = () => {
    onMonthChange?.(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    onMonthChange?.(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const monthName = currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Calendario
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium capitalize min-w-[140px] text-center">
            {monthName}
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateKey = formatDateKey(date);
          const dayEvents = eventsByDate.get(dateKey) || [];
          const isSelected = selectedDate === dateKey;
          const isToday = formatDateKey(new Date()) === dateKey;
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={dateKey}
              onClick={() => onDateSelect?.(dateKey)}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors",
                isSelected && "bg-primary text-primary-foreground",
                !isSelected && isToday && "bg-gray-100",
                !isSelected && !isToday && "hover:bg-gray-50",
                hasEvents && !isSelected && "font-medium"
              )}
            >
              <span className="text-sm">{date.getDate()}</span>
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((event, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-white/80" : typeColors[event.type]
                      )}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span>Taller</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Webinar</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Encuentro</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Conferencia</span>
        </div>
      </div>
    </div>
  );
}
