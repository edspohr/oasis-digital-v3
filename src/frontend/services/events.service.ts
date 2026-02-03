/**
 * Events Service
 * Mock service prepared for future backend integration
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'workshop' | 'webinar' | 'meetup' | 'conference';
  capacity: number;
  enrolledCount: number;
  isEnrolled: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizerId: string;
  organizerName?: string;
  imageUrl?: string;
}

const MOCK_ENABLED = true;

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Taller de Regulación Emocional',
    description: 'Aprende técnicas prácticas para manejar emociones intensas y cultivar la calma interior.',
    date: '2025-02-15',
    time: '10:00',
    location: 'Sala Virtual Zoom',
    type: 'workshop',
    capacity: 30,
    enrolledCount: 18,
    isEnrolled: false,
    status: 'upcoming',
    organizerId: 'org-1',
    organizerName: 'OASIS',
    imageUrl: '/placeholder_workshop.jpg',
  },
  {
    id: '2',
    title: 'Webinar: Neurociencia del Bienestar',
    description: 'Descubre cómo el cerebro procesa las emociones y cómo podemos optimizar nuestro bienestar.',
    date: '2025-02-20',
    time: '18:00',
    location: 'YouTube Live',
    type: 'webinar',
    capacity: 500,
    enrolledCount: 245,
    isEnrolled: true,
    status: 'upcoming',
    organizerId: 'org-1',
    organizerName: 'OASIS',
    imageUrl: '/placeholder_webinar.jpg',
  },
  {
    id: '3',
    title: 'Encuentro de Facilitadores',
    description: 'Espacio de networking y compartir experiencias entre facilitadores de la comunidad.',
    date: '2025-02-25',
    time: '16:00',
    location: 'Café Central, Madrid',
    type: 'meetup',
    capacity: 20,
    enrolledCount: 12,
    isEnrolled: false,
    status: 'upcoming',
    organizerId: 'org-1',
    organizerName: 'OASIS',
    imageUrl: '/placeholder_meetup.jpg',
  },
  {
    id: '4',
    title: 'Conferencia Anual OASIS 2025',
    description: 'El evento más importante del año con ponentes internacionales y workshops especializados.',
    date: '2025-03-15',
    time: '09:00',
    location: 'Centro de Convenciones, Barcelona',
    type: 'conference',
    capacity: 200,
    enrolledCount: 87,
    isEnrolled: false,
    status: 'upcoming',
    organizerId: 'org-1',
    organizerName: 'OASIS',
    imageUrl: '/placeholder_conference.jpg',
  },
];

export const eventsService = {
  async getEvents(): Promise<Event[]> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockEvents;
    }
    // TODO: Replace with actual API call
    // return apiClient.get('/events');
    return [];
  },

  async getEventById(eventId: string): Promise<Event | null> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockEvents.find(e => e.id === eventId) || null;
    }
    // TODO: Replace with actual API call
    // return apiClient.get(`/events/${eventId}`);
    return null;
  },

  async enrollInEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const event = mockEvents.find(e => e.id === eventId);
      if (event) {
        event.isEnrolled = true;
        event.enrolledCount += 1;
        return { success: true, message: 'Inscripción exitosa' };
      }
      return { success: false, message: 'Evento no encontrado' };
    }
    // TODO: Replace with actual API call
    // return apiClient.post(`/events/${eventId}/enroll`);
    return { success: false, message: 'Service not available' };
  },

  async cancelEnrollment(eventId: string): Promise<{ success: boolean; message: string }> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const event = mockEvents.find(e => e.id === eventId);
      if (event) {
        event.isEnrolled = false;
        event.enrolledCount -= 1;
        return { success: true, message: 'Inscripción cancelada' };
      }
      return { success: false, message: 'Evento no encontrado' };
    }
    // TODO: Replace with actual API call
    // return apiClient.delete(`/events/${eventId}/enroll`);
    return { success: false, message: 'Service not available' };
  },

  async getMyEvents(): Promise<Event[]> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockEvents.filter(e => e.isEnrolled);
    }
    // TODO: Replace with actual API call
    // return apiClient.get('/events/my');
    return [];
  },
};
