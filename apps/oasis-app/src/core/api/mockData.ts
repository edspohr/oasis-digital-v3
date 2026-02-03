import { 
  Profile, 
  Organization, 
  OrganizationMember, 
  Journey, 
  EnrollmentWithJourney 
} from '@/core/types';

// --- MOCK CONSTANTS ---

const MOCK_ORGS: Organization[] = [
  {
    id: 'org-summer-001',
    name: 'Fundación Summer',
    slug: 'fundacion-summer',
    description: 'Organización central de Summer',
    logo_url: null,
    type: 'enterprise',
    settings: {}, // Enterprise features
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'org-tech-002',
    name: 'Tech Corp',
    slug: 'tech-corp',
    description: 'Empresa tecnológica innovadora',
    logo_url: null,
    type: 'community',
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'org-edu-003',
    name: 'Edu Global',
    slug: 'edu-global',
    description: 'Red educativa internacional',
    logo_url: null,
    type: 'community',
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const MOCK_PROFILES: Profile[] = [
  // Superadmin en Summer
  {
    id: 'usr-super-001',
    email: 'super@summer.com',
    full_name: 'Super Admin Summer',
    avatar_url: null,
    is_platform_admin: true,
    status: 'active',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Admin en Tech Corp
  {
    id: 'usr-admin-002',
    email: 'admin@techcorp.com',
    full_name: 'Admin Tech Corp',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Participante/Suscriptor en Tech Corp
  {
    id: 'usr-part-003',
    email: 'user1@techcorp.com',
    full_name: 'Juan Participante',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
   // Participante en Edu Global
  {
    id: 'usr-part-004',
    email: 'student@eduglobal.com',
    full_name: 'Maria Estudiante',
    avatar_url: null,
    is_platform_admin: false,
    status: 'active',
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Memberships linking Users <-> Orgs
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MOCK_MEMBERSHIPS: OrganizationMember[] = [
  // Superadmin membership in Summer
  {
    id: 'mem-summer-001',
    organization_id: 'org-summer-001',
    user_id: 'usr-super-001',
    role: 'owner', // Or admin
    status: 'active',
    invited_by: null,
    joined_at: new Date().toISOString(),
  },
  // Admin membership in Tech Corp
  {
    id: 'mem-tech-001',
    organization_id: 'org-tech-002',
    user_id: 'usr-admin-002',
    role: 'admin',
    status: 'active',
    invited_by: 'usr-super-001',
    joined_at: new Date().toISOString(),
  },
  // Participant in Tech Corp
  {
    id: 'mem-tech-002',
    organization_id: 'org-tech-002',
    user_id: 'usr-part-003',
    role: 'participante',
    status: 'active',
    invited_by: 'usr-admin-002',
    joined_at: new Date().toISOString(),
  },
   // Participant in Edu Global
  {
    id: 'mem-edu-001',
    organization_id: 'org-edu-003',
    user_id: 'usr-part-004',
    role: 'participante',
    status: 'active',
    invited_by: 'usr-super-001',
    joined_at: new Date().toISOString(),
  }
];

const MOCK_JOURNEYS: Journey[] = [
  {
    id: 'j-onboarding-001',
    organization_id: 'org-tech-002',
    title: 'Onboarding Corporativo',
    description: 'Conoce los valores y herramientas de Tech Corp.',
    cover_image_url: null,
    status: 'active',
    settings: {},
    total_steps: 5,
    total_points: 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: [
        {
            id: 'step-1',
            journey_id: 'j-onboarding-001',
            title: 'Bienvenida del CEO',
            description: 'Un mensaje especial de nuestro fundador.',
            type: 'video',
            content: { video_url: 'https://vimeo.com/123456789' },
            points: 50,
            order: 1,
            is_required: true,
            duration_minutes: 5,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'step-2',
            journey_id: 'j-onboarding-001',
            title: 'Cuestionario de Cultura',
            description: 'Demuestra qué tanto sabes de nosotros.',
            type: 'quiz',
            content: { quiz_id: 'quiz-123' },
            points: 100,
            order: 2,
            is_required: true,
            duration_minutes: 15,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ]
  },
  {
     id: 'j-liderazgo-002',
     organization_id: 'org-tech-002',
     title: 'Liderazgo Ágil',
     description: 'Curso avanzado para líderes de equipo.',
     cover_image_url: null,
     status: 'active',
     settings: {},
     total_steps: 10,
     total_points: 1000,
     created_at: new Date().toISOString(),
     updated_at: new Date().toISOString(),
  }
];

const MOCK_ENROLLMENTS: EnrollmentWithJourney[] = [
    {
        id: 'enr-001',
        journey_id: 'j-onboarding-001',
        user_id: 'usr-part-003',
        status: 'in_progress',
        progress: 20,
        completed_steps: 1,
        total_steps: 5,
        points_earned: 50,
        enrolled_at: new Date().toISOString(),
        completed_at: null,
        journey: MOCK_JOURNEYS[0]
    }
];

// --- MOCK HANDLER ---

export const mockHandler = {
  get: async (path: string, params?: Record<string, unknown>) => {
    console.log(`[MOCK API] GET ${path}`, params);
    
    // Auth / Me
    if (path.includes('/auth/me')) {
        let storedId = 'usr-part-003'; // Default to participant
        if (typeof window !== 'undefined') {
            const stored = window.localStorage.getItem('MOCK_USER_ID');
            if (stored) storedId = stored;
        }

        const user = MOCK_PROFILES.find(u => u.id === storedId) || MOCK_PROFILES[2];
        
        return {
            user
        };
    }

    // Organizations
    if (path.includes('/organizations')) {
        return { data: MOCK_ORGS, count: MOCK_ORGS.length };
    }

    // Journeys
    if (path.includes('/journeys')) {
        // Filter by org if needed, but for now return all active for simplicity
        return { data: MOCK_JOURNEYS, count: MOCK_JOURNEYS.length };
    }
    
    // Single Journey
    if (path.match(/\/journeys\/[\w-]+$/)) {
        const id = path.split('/').pop();
        const journey = MOCK_JOURNEYS.find(j => j.id === id);
        return journey || null;
    }

    // Enrollments
    if (path.includes('/enrollments')) {
        return MOCK_ENROLLMENTS;
    }

    return null;
  },
  
  post: async (path: string, body: unknown) => {
     console.log(`[MOCK API] POST ${path}`, body);
     return { success: true, id: 'mock-id-' + Date.now() };
  }
};
