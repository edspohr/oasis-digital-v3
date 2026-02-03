'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useApi } from '@/core/hooks/useApi';
import type {
  Enrollment,
  EnrollmentWithJourney,
  JourneyStep,
  StepCompletion,
} from '@/core/types';

interface EnrollmentProgress {
  enrollment: Enrollment;
  steps: JourneyStep[];
  completions: StepCompletion[];
  completedStepIds: Set<string>;
}

interface UseEnrollmentReturn {
  enrollments: EnrollmentWithJourney[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  enroll: (journeyId: string) => Promise<Enrollment>;
  drop: (enrollmentId: string) => Promise<void>;
}

export function useEnrollments(): UseEnrollmentReturn {
  const { profile } = useAuth();
  const api = useApi();
  const [enrollments, setEnrollments] = useState<EnrollmentWithJourney[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!profile) {
      setEnrollments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Usar servicio de Journey para obtener enrollments del usuario
      const data = await api.journey.getMyEnrollments();
      setEnrollments(data);
    } catch (err: unknown) {
      console.error('Error fetching enrollments:', err);
      let message = 'Error al cargar inscripciones';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
         message = (err as { message: string }).message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [profile, api]);

  const enroll = useCallback(
    async (journeyId: string): Promise<Enrollment> => {
      // Usar servicio para enrolar
      const enrollment = await api.journey.enroll({ journey_id: journeyId });
      await fetchEnrollments();
      return enrollment;
    },
    [api, fetchEnrollments]
  );

  const drop = useCallback(
    async (enrollmentId: string): Promise<void> => {
      // Usar servicio para abandonar
      await api.journey.dropEnrollment(enrollmentId);
      await fetchEnrollments();
    },
    [api, fetchEnrollments]
  );

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    isLoading,
    error,
    refresh: fetchEnrollments,
    enroll,
    drop,
  };
}

export function useEnrollmentProgress(enrollmentId: string) {
  const api = useApi();
  const [progress, setProgress] = useState<EnrollmentProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!enrollmentId) {
      setProgress(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Usar servicio para obtener progreso
      const data = await api.journey.getEnrollmentProgress(enrollmentId);
      
      const completedStepIds = new Set(
        (data.completions || []).map((c) => c.step_id)
      );

      setProgress({
        enrollment: data.enrollment,
        steps: data.steps || [],
        completions: data.completions || [],
        completedStepIds,
      });
    } catch (err: unknown) {
      console.error('Error fetching progress:', err);
      let message = 'Error al cargar progreso';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
         message = (err as { message: string }).message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [enrollmentId, api]);

  const completeStep = useCallback(
    async (stepId: string, submissionData?: Record<string, unknown>) => {
      if (!progress) throw new Error('No hay progreso cargado');

      if (progress.completedStepIds.has(stepId)) {
        return; 
      }

      // Usar servicio para completar paso
      const completion = await api.journey.completeStep(enrollmentId, stepId, {
        submission_data: submissionData,
      });

      // Actualizar enrollment localmente o refetchear
      await fetchProgress();
      return completion;
    },
    [progress, enrollmentId, api, fetchProgress]
  );

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    isLoading,
    error,
    refresh: fetchProgress,
    completeStep,
    isStepCompleted: (stepId: string) =>
      progress?.completedStepIds.has(stepId) || false,
  };
}