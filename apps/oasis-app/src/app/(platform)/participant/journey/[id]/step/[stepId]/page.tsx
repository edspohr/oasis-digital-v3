import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { journeyApi } from '@/core/api';
import { StepViewer } from '@/features/journey/components/StepViewer';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import type { JourneyStep } from '@/core/types/journey';

// Definición de Props para Page en Next.js 15
interface PageProps {
  params: Promise<{ id: string; stepId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Lección | Journey ${id} | OASIS`,
  };
}

export default async function JourneyStepPage({ params }: PageProps) {
  const { id, stepId } = await params;

  try {
    // 1. Obtener datos del Journey completo usando el método correcto
    const journey = await journeyApi.getJourney(id);

    if (!journey) {
      return notFound();
    }

    // 2. Encontrar el paso actual con tipado explícito
    const currentStep = journey.steps?.find((s: JourneyStep) => s.id === stepId);

    if (!currentStep) {
      return (
        <div className="flex h-[50vh] w-full items-center justify-center p-8">
          <EmptyState 
            title="Paso no encontrado" 
            description="El contenido que buscas no existe o no está disponible en este momento."
            // Nota: En Server Components, 'onAction' no puede ser una función interactiva directa.
            // Si necesitas interactividad aquí, EmptyState debería estar envuelto en un Client Component.
            // Para mantenerlo simple y funcional:
          />
        </div>
      );
    }

    // 3. Renderizar el Visor
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <StepViewer journey={journey} currentStep={currentStep} />
      </div>
    );

  } catch (error) {
    console.error('Error loading step:', error);
    return (
      <div className="container mx-auto py-12 text-center text-red-500">
        Ocurrió un error al cargar el contenido. Por favor intenta más tarde.
      </div>
    );
  }
}