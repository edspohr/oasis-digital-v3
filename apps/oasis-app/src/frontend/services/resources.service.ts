/**
 * Resources Service
 * Mock service prepared for future backend integration
 */

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'guide' | 'document' | 'audio';
  category: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'draft' | 'published' | 'archived';
  authorId?: string;
  authorName?: string;
  viewCount?: number;
  downloadCount?: number;
}

const MOCK_ENABLED = true;

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Guia de Regulacion Emocional',
    description: 'Una guia completa para entender y manejar las emociones de forma saludable.',
    type: 'guide',
    category: 'Autocuidado',
    url: '/resources/guia-regulacion.pdf',
    thumbnail: '/placeholder_guide.jpg',
    duration: 'Lectura 15m',
    createdAt: '2025-01-15',
    status: 'published',
    authorName: 'Equipo OASIS',
    viewCount: 1234,
    downloadCount: 456,
  },
  {
    id: '2',
    title: 'Video: Tecnicas de Respiracion',
    description: 'Aprende 5 tecnicas de respiracion para momentos de estres.',
    type: 'video',
    category: 'Ansiedad',
    url: '/resources/respiracion.mp4',
    thumbnail: '/placeholder_video.jpg',
    duration: '8 min',
    createdAt: '2025-01-10',
    status: 'published',
    authorName: 'Dr. Martinez',
    viewCount: 2456,
  },
  {
    id: '3',
    title: 'Podcast: Mindfulness para Principiantes',
    description: 'Introduccion al mindfulness en formato audio.',
    type: 'audio',
    category: 'Mindfulness',
    url: '/resources/mindfulness-intro.mp3',
    thumbnail: '/placeholder_audio.jpg',
    duration: '25 min',
    createdAt: '2025-01-05',
    status: 'published',
    authorName: 'Maria Lopez',
    viewCount: 890,
  },
  {
    id: '4',
    title: 'Articulo: La Ciencia del Sueno',
    description: 'Como mejorar la calidad del sueno segun la neurociencia.',
    type: 'article',
    category: 'Bienestar',
    url: '/resources/ciencia-sueno',
    thumbnail: '/placeholder_article.jpg',
    duration: 'Lectura 10m',
    createdAt: '2025-01-20',
    status: 'published',
    authorName: 'Dr. Garcia',
    viewCount: 567,
  },
  {
    id: '5',
    title: 'Plantilla: Diario de Gratitud',
    description: 'Documento descargable para practicar la gratitud diaria.',
    type: 'document',
    category: 'Autocuidado',
    url: '/resources/diario-gratitud.docx',
    thumbnail: '/placeholder_doc.jpg',
    createdAt: '2025-01-18',
    status: 'draft',
    authorName: 'Equipo OASIS',
    downloadCount: 234,
  },
];

export const resourcesService = {
  async getResources(filters?: { category?: string; type?: string; status?: string }): Promise<Resource[]> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = [...mockResources];
      if (filters?.category) {
        filtered = filtered.filter(r => r.category === filters.category);
      }
      if (filters?.type) {
        filtered = filtered.filter(r => r.type === filters.type);
      }
      if (filters?.status) {
        filtered = filtered.filter(r => r.status === filters.status);
      }
      return filtered;
    }
    // TODO: Replace with actual API call
    // return apiClient.get('/resources', { params: filters });
    return [];
  },

  async getResourceById(resourceId: string): Promise<Resource | null> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockResources.find(r => r.id === resourceId) || null;
    }
    // TODO: Replace with actual API call
    // return apiClient.get(`/resources/${resourceId}`);
    return null;
  },

  async createResource(data: Omit<Resource, 'id' | 'createdAt' | 'viewCount' | 'downloadCount'>): Promise<Resource> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newResource: Resource = {
        ...data,
        id: String(mockResources.length + 1),
        createdAt: new Date().toISOString().split('T')[0],
        viewCount: 0,
        downloadCount: 0,
      };
      mockResources.push(newResource);
      return newResource;
    }
    // TODO: Replace with actual API call
    // return apiClient.post('/resources', data);
    throw new Error('Service not available');
  },

  async updateResource(resourceId: string, data: Partial<Resource>): Promise<Resource | null> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockResources.findIndex(r => r.id === resourceId);
      if (index !== -1) {
        mockResources[index] = { ...mockResources[index], ...data, updatedAt: new Date().toISOString().split('T')[0] };
        return mockResources[index];
      }
      return null;
    }
    // TODO: Replace with actual API call
    // return apiClient.patch(`/resources/${resourceId}`, data);
    return null;
  },

  async deleteResource(resourceId: string): Promise<boolean> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const index = mockResources.findIndex(r => r.id === resourceId);
      if (index !== -1) {
        mockResources.splice(index, 1);
        return true;
      }
      return false;
    }
    // TODO: Replace with actual API call
    // return apiClient.delete(`/resources/${resourceId}`);
    return false;
  },

  async getCategories(): Promise<string[]> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return ['Ansiedad', 'Crianza', 'Liderazgo', 'Autocuidado', 'Mindfulness', 'Bienestar'];
    }
    // TODO: Replace with actual API call
    // return apiClient.get('/resources/categories');
    return [];
  },
};
