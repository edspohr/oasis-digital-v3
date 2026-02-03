import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useApi } from '@/core/hooks/useApi';
import type {
  JourneyWithEnrollment,
  JourneyStatus,
} from '@/core/types';

interface UseJourneysReturn {
  journeys: JourneyWithEnrollment[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getJourneyById: (id: string) => JourneyWithEnrollment | undefined;
}

interface UseJourneysOptions {
  status?: JourneyStatus;
  onlyEnrolled?: boolean;
}

export function useJourneys(options: UseJourneysOptions = {}): UseJourneysReturn {
  const { currentOrg } = useAuth();
  const api = useApi();
  const [journeys, setJourneys] = useState<JourneyWithEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneys = useCallback(async () => {
    // Corrección para evitar crashes si currentOrg tiene estructura anidada o es null
    const orgId = currentOrg && 'id' in currentOrg 
        ? (currentOrg as any).id 
        : (currentOrg as any)?.data?.id;

    if (!orgId) {
      setJourneys([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Usar el servicio de Journey
      const response = await api.journey.getJourneys({
        status: options.status,
      });

      // El servicio ya devuelve la estructura que necesitamos (JourneyWithEnrollment)
      // debido a cómo están definidos los tipos en el cliente API.
      // Sin embargo, verificaremos si necesitamos mapear algo.
      // Nota: El endpoint getJourneys devuelve PaginatedResponse<Journey>, no JourneyWithEnrollment directo.
      //       Pero el backend suele enriquecer la respuesta si el usuario está autenticado.
      //       Asumiremos por ahora que debemos verificar enrollments por separado O que el backend los incluye.
      
      // REVISIÓN: El cliente `journey.api.ts` dice que devuelve `PaginatedResponse<Journey>`.
      // Si queremos saber si está "enrolled", necesitamos `getMyEnrollments` también.
      
      const [journeysResponse, enrollmentsResponse] = await Promise.all([
        api.journey.getJourneys({ status: options.status }),
        api.journey.getMyEnrollments()
      ]);

      const fetchedJourneys = journeysResponse.data;
      const myEnrollments = enrollmentsResponse; // Array<EnrollmentWithJourney>

      const enrollmentsMap = new Map(
        myEnrollments.map((e) => [e.journey_id, e])
      );

      const combinedJourneys: JourneyWithEnrollment[] = fetchedJourneys.map(
        (journey) => {
          const enrollment = enrollmentsMap.get(journey.id);
          return {
            ...journey,
            enrollment,
            isEnrolled: !!enrollment,
          } as JourneyWithEnrollment;
        }
      );

      // 4. Filtrar si es necesario
      const finalJourneys = options.onlyEnrolled
        ? combinedJourneys.filter((j) => j.isEnrolled)
        : combinedJourneys;

      setJourneys(finalJourneys);
    } catch (err: any) {
      console.error('Error fetching journeys:', err);
      setError(err?.message || 'Error al cargar journeys');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg, api, options.status, options.onlyEnrolled]);

  useEffect(() => {
    fetchJourneys();
  }, [fetchJourneys]);

  const getJourneyById = useCallback(
    (id: string): JourneyWithEnrollment | undefined => {
      return journeys.find((j) => j.id === id);
    },
    [journeys]
  );

  return {
    journeys,
    isLoading,
    error,
    refresh: fetchJourneys,
    getJourneyById,
  };
}

export function useJourneyDetails(journeyId: string) {
  const api = useApi();
  const [journey, setJourney] = useState<JourneyWithEnrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourney = useCallback(async () => {
    if (!journeyId) {
      setJourney(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Usar el servicio de Journey
      // Nota: El servicio getJourney(id) devuelve Journey, no JourneyWithEnrollment
      // Necesitamos verificar enrollments también
      
      const [journeyData, enrollments] = await Promise.all([
        api.journey.getJourney(journeyId),
        api.journey.getMyEnrollments(), // Esto puede ser optimizable si hubiera un endpoint 'getJourneyEnrollment'
      ]);

      const enrollment = enrollments.find(e => e.journey_id === journeyId);

      setJourney({
        ...journeyData,
        enrollment,
        isEnrolled: !!enrollment,
      } as JourneyWithEnrollment);

    } catch (err: any) {
      console.error('Error fetching journey:', err);
      setError(err?.message || 'Error al cargar el journey');
    } finally {
      setIsLoading(false);
    }
  }, [journeyId, api]);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney]);

  return {
    journey,
    isLoading,
    error,
    refresh: fetchJourney,
  };
}