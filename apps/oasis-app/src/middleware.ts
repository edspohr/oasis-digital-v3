import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_ROUTES, matchRoute, findRouteConfig } from '@/core/config/routes';
import { hasPermission } from '@/core/config/permissions';
import type { OrganizationRole } from '@/core/types';

const ORG_COOKIE_NAME = 'oasis_current_org';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some(route => matchRoute(path, route));

  // 1. NO AUTENTICADO
  if (!user && !isPublic) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // 2. AUTENTICADO EN RUTA DE LOGIN (Dispatcher)
  if (user && (path === '/login' || path === '/register' || path === '/')) {
    // Aquí dejamos pasar a '/' para que page.tsx haga el despacho al dashboard correcto
    if (path === '/') return response;
    // Si está en login, lo mandamos a la raíz para ser despachado
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. VERIFICACIÓN DE PERMISOS (RBAC)
  const routeConfig = findRouteConfig(path);
  if (routeConfig && user) {
    const orgId = request.cookies.get(ORG_COOKIE_NAME)?.value;

    // A. Platform Admin
    if (routeConfig.isPlatformAdminOnly) {
      // Leemos el perfil directamente
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_platform_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_platform_admin) {
        // ERROR DE PERMISO: Mandar a /participant para EVITAR LOOP
        return NextResponse.redirect(new URL('/participant', request.url));
      }
    }
    
    // B. Org Roles
    else if (routeConfig.minRole || routeConfig.roles) {
      let query = supabase.from('organization_members').select('role').eq('user_id', user.id).eq('status', 'active');
      if (orgId) query = query.eq('organization_id', orgId);
      
      const { data: membership } = await query.limit(1).single();

      if (!membership) {
        return NextResponse.redirect(new URL('/participant', request.url));
      }

      const userRole = membership.role as OrganizationRole;
      if (
        (routeConfig.roles && !routeConfig.roles.includes(userRole)) ||
        (routeConfig.minRole && !hasPermission(userRole, routeConfig.minRole))
      ) {
        return NextResponse.redirect(new URL('/participant', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};