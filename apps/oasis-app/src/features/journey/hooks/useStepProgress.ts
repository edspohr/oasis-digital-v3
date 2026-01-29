import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { journeyApi } from '@/core/api';

interface UseStepProgressProps {
  journeyId: string;
  onComplete?: () => void;
}

export function useStepProgress({ journeyId, onComplete }: UseStepProgressProps) {
  const router = useRouter();
  const [isMarking, setIsMarking] = useState(false);

  const markStepComplete = async (stepId: string, nextStepId?: string) => {
    setIsMarking(true);
    try {
      // 1. Llamada a la API
      await journeyApi.trackProgress({
        journey_id: journeyId,
        step_id: stepId,
        status: 'completed',
        metadata: {
            completed_at: new Date().toISOString()
        }
      });

      // 2. Feedback al usuario
      toast.success('¡Paso completado!', {
        description: 'Tu progreso ha sido guardado.',
      });

      // 3. Callback opcional (ej: recargar datos)
      if (onComplete) {
        onComplete();
      }

      // 4. Navegación automática al siguiente paso (opcional)
      if (nextStepId) {
        router.push(`/participant/journey/${journeyId}/step/${nextStepId}`);
      } else {
        // Si no hay siguiente paso, volver al mapa del journey
        router.push(`/participant/journey/${journeyId}`);
        toast.success('¡Journey finalizado! 🎉');
      }

    } catch (error) {
      console.error('Error tracking progress:', error);
      toast.error('No se pudo guardar el progreso. Intenta nuevamente.');
    } finally {
      setIsMarking(false);
    }
  };

  return {
    markStepComplete,
    isMarking
  };
}