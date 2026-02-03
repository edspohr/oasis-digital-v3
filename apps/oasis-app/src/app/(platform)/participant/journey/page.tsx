'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useJourneys, useJourneyDetails } from '@/features/journey/hooks/useJourneys';
import { useEnrollments } from '@/features/journey/hooks/useEnrollment';
import { JourneyCard } from '@/features/journey/components/JourneyCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  Map as MapIcon,
  LayoutGrid
} from 'lucide-react';
import { ParticipantHero } from './components/ParticipantHero';
import { JourneyPath, type MapStep } from './components/JourneyPath';
import { Button } from '@/shared/components/ui/button';
import { useRouter } from 'next/navigation';


export default function JourneyListPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const {
    journeys,
    isLoading: journeysLoading,
    error: journeysError,
    refresh,
  } = useJourneys({ status: 'active' });
  const { enroll } = useEnrollments();

  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Logic to find the "Main" Active Journey (most recent enrolled)
  const activeJourney = journeys.find(j => j.isEnrolled && j.enrollment?.status !== 'completed');
  
  // Fetch detailed steps for the active journey to populate the map
  const { journey: detailedActiveJourney, isLoading: detailsLoading } = useJourneyDetails(activeJourney?.id || '');

  const isLoading = authLoading || journeysLoading || (!!activeJourney && detailsLoading);

  // Transform generic journey steps into MapSteps for visualization
  // If no steps are returned from API yet, mock them for visualization proof
  const mapSteps: MapStep[] = detailedActiveJourney?.steps?.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description || '',
      type: step.type as MapStep['type'], // Cast to compatible type
      status: 'locked', // Logic needed to determine status from enrollment
      duration: step.duration_minutes ? `${step.duration_minutes} min` : undefined
  })) || [
      { id: '1', title: 'Bienvenida al Programa', description: 'Introducción a objetivos y metodología.', type: 'video', status: 'completed', duration: '5 min' },
      { id: '2', title: 'Fundamentos de Liderazgo', description: 'Conceptos clave para liderar en tiempos de cambio.', type: 'content', status: 'current', duration: '15 min' },
      { id: '3', title: 'Quiz de Conocimientos', description: 'Evalúa lo aprendido hasta ahora.', type: 'quiz', status: 'locked', duration: '10 min' },
      { id: '4', title: 'Taller Práctico: Comunicación', description: 'Ejercicio grupal de escucha activa.', type: 'task', status: 'locked', duration: '45 min' },
      { id: '5', title: 'Cierre de Módulo 1', description: 'Conclusiones y siguientes pasos.', type: 'video', status: 'locked', duration: '5 min' },
  ];

  const handleEnroll = async (journeyId: string) => {
    setEnrollError(null);
    setEnrollingId(journeyId);
    try {
      await enroll(journeyId);
      await refresh();
    } catch (err) {
      setEnrollError(
        err instanceof Error ? err.message : 'Error al inscribirse'
      );
    } finally {
      setEnrollingId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleStepClick = (stepId: string) => {
      // Navigate to step detail
      if (activeJourney) {
          // If we had deep linking to steps: /participant/journey/[id]/step/[stepId]
          // For now, assuming standard flow goes to journey root or next active step
          console.log('Navigating to step', stepId);
          router.push(`/participant/journey/${activeJourney.id}`);
      }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-64 rounded-3xl bg-gray-200" />
        <div className="space-y-4">
             <div className="h-8 w-1/3 bg-gray-200 rounded" />
             <div className="h-40 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  const availableJourneys = journeys.filter(j => !j.isEnrolled);
  const completedJourneys = journeys.filter(j => j.enrollment?.status === 'completed');

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Hero Section */}
      <section>
        <ParticipantHero />
      </section>

      {/* 2. Main Action / Journey Path */}
      <section>
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                <MapIcon className="h-5 w-5 text-indigo-600" />
                Mi Viaje Actual
            </h2>
             <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-gray-400 hover:text-gray-600"
            >
                <RefreshCw
                    className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Act
            </Button>
        </div>

        {activeJourney ? (
             <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 min-h-[500px]">
                 <JourneyPath 
                    journeyTitle={activeJourney.title}
                    steps={mapSteps}
                    onStepClick={handleStepClick}
                 />
             </div>
        ) : (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
                <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No tienes un viaje activo</h3>
                <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6">
                    Explora los journeys disponibles abajo y comienza tu aventura de aprendizaje.
                </p>
                <Button onClick={() => document.getElementById('available-tabs')?.scrollIntoView({ behavior: 'smooth' })}>
                    Ver Disponibles
                </Button>
            </div>
        )}
      </section>

      {/* 3. Secondary Content (Other Journeys) */}
      <section id="available-tabs">
        <Tabs defaultValue="available" className="space-y-6">
            <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 gap-8">
            <TabsTrigger
                value="available"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-3 font-medium text-gray-500 data-[state=active]:text-indigo-600 transition-all gap-2"
            >
                <LayoutGrid className="h-4 w-4" />
                Explorar ({availableJourneys.length})
            </TabsTrigger>

            <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 rounded-none px-0 pb-3 font-medium text-gray-500 data-[state=active]:text-indigo-600 transition-all gap-2"
            >
                <span className="hidden sm:inline">Historial Completado</span>
                <span className="sm:hidden">Historial</span>
            </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="mt-6">
                 {availableJourneys.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {availableJourneys.map((journey) => (
                        <JourneyCard
                            key={journey.id}
                            journey={journey}
                            onEnroll={handleEnroll}
                            isEnrolling={enrollingId === journey.id}
                        />
                    ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
                        No hay más journeys disponibles por ahora.
                    </div>
                )}
            </TabsContent>

            <TabsContent value="completed" className="mt-6">
                 {completedJourneys.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {completedJourneys.map((journey) => (
                        <JourneyCard key={journey.id} journey={journey} />
                    ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
                        Aún no has completado ningún journey.
                    </div>
                )}
            </TabsContent>
        </Tabs>
      </section>
      
      {/* Error display */}
      {(journeysError || enrollError) && (
        <Alert variant="destructive" className="fixed bottom-4 right-4 w-96 shadow-lg z-50 animate-in slide-in-from-bottom">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{journeysError || enrollError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
