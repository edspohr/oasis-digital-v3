/**
 * Community Service
 * Mock service prepared for future backend integration
 */

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'participant' | 'facilitator' | 'admin';
  content: string;
  createdAt: string;
  likes: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'participant' | 'facilitator' | 'admin';
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  category?: string;
}

const MOCK_ENABLED = true;

const mockPosts: Post[] = [
  {
    id: '1',
    authorId: 'user-1',
    authorName: 'Maria Garcia',
    authorRole: 'participant',
    content: 'Acabo de completar el modulo de regulacion emocional y queria compartir que las tecnicas de respiracion me han ayudado muchisimo con la ansiedad. Alguien mas ha probado la tecnica 4-7-8?',
    likes: 24,
    isLiked: false,
    comments: [
      {
        id: 'c1',
        authorId: 'user-2',
        authorName: 'Carlos Lopez',
        authorRole: 'facilitator',
        content: 'Maria! Me alegra que te este funcionando. La tecnica 4-7-8 es muy efectiva. Te recomiendo practicarla antes de dormir tambien.',
        createdAt: '2025-01-20T11:30:00',
        likes: 8,
      },
    ],
    createdAt: '2025-01-20T10:00:00',
    status: 'approved',
    category: 'Experiencias',
  },
  {
    id: '2',
    authorId: 'user-3',
    authorName: 'Ana Martinez',
    authorRole: 'participant',
    content: 'Pregunta para la comunidad: Como manejan los momentos de crisis cuando estan solos? Busco consejos practicos.',
    likes: 15,
    isLiked: true,
    comments: [],
    createdAt: '2025-01-19T15:30:00',
    status: 'approved',
    category: 'Preguntas',
  },
  {
    id: '3',
    authorId: 'user-4',
    authorName: 'Dr. Rodriguez',
    authorRole: 'facilitator',
    content: 'Nuevo recurso disponible! He subido un video sobre neurociencia del estres. Espero que les sea util para entender mejor como funciona nuestro cerebro en situaciones dificiles.',
    imageUrl: '/placeholder_post.jpg',
    likes: 45,
    isLiked: false,
    comments: [],
    createdAt: '2025-01-18T09:00:00',
    status: 'approved',
    category: 'Anuncios',
  },
];

export const communityService = {
  async getPosts(filters?: { category?: string; status?: string }): Promise<Post[]> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 300));
      let filtered = [...mockPosts];
      if (filters?.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters?.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      return filtered;
    }
    // TODO: Replace with actual API call
    // return apiClient.get('/community/posts', { params: filters });
    return [];
  },

  async getPostById(postId: string): Promise<Post | null> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockPosts.find(p => p.id === postId) || null;
    }
    // TODO: Replace with actual API call
    // return apiClient.get(`/community/posts/${postId}`);
    return null;
  },

  async createPost(data: { content: string; imageUrl?: string; category?: string }): Promise<Post> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newPost: Post = {
        id: String(mockPosts.length + 1),
        authorId: 'current-user',
        authorName: 'Usuario Actual',
        authorRole: 'participant',
        content: data.content,
        imageUrl: data.imageUrl,
        likes: 0,
        isLiked: false,
        comments: [],
        createdAt: new Date().toISOString(),
        status: 'pending',
        category: data.category,
      };
      mockPosts.unshift(newPost);
      return newPost;
    }
    // TODO: Replace with actual API call
    // return apiClient.post('/community/posts', data);
    throw new Error('Service not available');
  },

  async likePost(postId: string): Promise<{ success: boolean; likes: number }> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const post = mockPosts.find(p => p.id === postId);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        return { success: true, likes: post.likes };
      }
      return { success: false, likes: 0 };
    }
    // TODO: Replace with actual API call
    // return apiClient.post(`/community/posts/${postId}/like`);
    return { success: false, likes: 0 };
  },

  async addComment(postId: string, content: string): Promise<Comment | null> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const post = mockPosts.find(p => p.id === postId);
      if (post) {
        const newComment: Comment = {
          id: `c${post.comments.length + 1}`,
          authorId: 'current-user',
          authorName: 'Usuario Actual',
          authorRole: 'participant',
          content,
          createdAt: new Date().toISOString(),
          likes: 0,
        };
        post.comments.push(newComment);
        return newComment;
      }
      return null;
    }
    // TODO: Replace with actual API call
    // return apiClient.post(`/community/posts/${postId}/comments`, { content });
    return null;
  },

  async reportPost(postId: string, reason: string): Promise<boolean> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const post = mockPosts.find(p => p.id === postId);
      if (post) {
        post.status = 'flagged';
        return true;
      }
      return false;
    }
    // TODO: Replace with actual API call
    // return apiClient.post(`/community/posts/${postId}/report`, { reason });
    return false;
  },

  // Admin/Moderator methods
  async moderatePost(postId: string, action: 'approve' | 'reject'): Promise<boolean> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const post = mockPosts.find(p => p.id === postId);
      if (post) {
        post.status = action === 'approve' ? 'approved' : 'rejected';
        return true;
      }
      return false;
    }
    // TODO: Replace with actual API call
    // return apiClient.post(`/community/posts/${postId}/moderate`, { action });
    return false;
  },

  async getFlaggedPosts(): Promise<Post[]> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockPosts.filter(p => p.status === 'flagged' || p.status === 'pending');
    }
    // TODO: Replace with actual API call
    // return apiClient.get('/community/posts/flagged');
    return [];
  },

  async getCategories(): Promise<string[]> {
    if (MOCK_ENABLED) {
      await new Promise(resolve => setTimeout(resolve, 100));
      return ['Experiencias', 'Preguntas', 'Anuncios', 'Recursos', 'General'];
    }
    // TODO: Replace with actual API call
    // return apiClient.get('/community/categories');
    return [];
  },
};
