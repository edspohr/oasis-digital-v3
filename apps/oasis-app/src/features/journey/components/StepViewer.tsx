"use client";

import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, CheckCircle, List } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { StepContent } from './StepContent';
import { useStepProgress } from '../hooks/useStepProgress';

// Importar tipos reales
import type { Journey, JourneyStep } from '@/core/types/journey';

interface StepViewerProps {
  journey: Journey;
  currentStep: JourneyStep;
}

export function StepViewer({ journey, currentStep }: StepViewerProps) {
  const router = useRouter();
  
  // Calcular navegación
  const steps = journey.steps || [];
  const currentIndex = steps.findIndex(s => s.id === currentStep.id);
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  // Integrar Hook
  const { markStepComplete, isMarking } = useStepProgress({
    journeyId: journey.id,
    onComplete: () => router.refresh(), // Refrescar para actualizar sidebar/progreso
  });

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* Header de Navegación */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground"
          onClick={() => router.push(`/participant/journey/${journey.id}`)}
        >
          <List className="h-4 w-4" />
          Ver mapa del viaje
        </Button>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Paso {currentIndex + 1} de {steps.length}</span>
        </div>
      </div>

      {/* Título Principal */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{currentStep.title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{currentStep.description}</p>
      </div>

      <Separator />

      {/* Renderizado de Contenido Dinámico */}
      <main className="min-h-[400px] w-full">
        <StepContent step={currentStep as any} />
      </main>

      <Separator className="my-6" />

      {/* Footer de Acciones */}
      <footer className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={!prevStep}
            onClick={() => prevStep && router.push(prevStep.id)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {/* Botón Principal de Acción */}
          <Button 
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
            onClick={() => markStepComplete(currentStep.id, nextStep?.id)}
            disabled={isMarking}
          >
            {isMarking ? (
              "Guardando..."
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Marcar como Completado
              </>
            )}
          </Button>

          {nextStep && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => router.push(nextStep.id)}
            >
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}