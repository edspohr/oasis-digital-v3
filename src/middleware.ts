import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_ROUTES, matchRoute, findRouteConfig } from '@/core/config/routes';

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

  // 2. LOGUEADO EN RUTA PÚBLICA
  if (user && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. PROTECCIÓN DE RUTAS /admin (CRÍTICO: Aquí estaba el error)
  if (path.startsWith('/admin')) {
    // A. Verificar si es Platform Admin (Superusuario)
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_platform_admin')
      .eq('id', user?.id)
      .single();

    if (profile?.is_platform_admin) {
      return response; // Pase directo al superadmin
    }

    // B. Verificar rol en la organización actual (Si no es superadmin)
    const orgId = request.cookies.get(ORG_COOKIE_NAME)?.value;
    
    if (orgId) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user?.id)
        .eq('organization_id', orgId)
        .single();

      const role = membership?.role;
      // Roles permitidos en /admin (owner, admin, facilitador)
      if (role === 'owner' || role === 'admin' || role === 'facilitador') {
        return response; // Pase concedido
      }
    }

    // C. Si fallan las comprobaciones, redirigir a participant (PERO NO SI YA ESTAMOS AHÍ)
    return NextResponse.redirect(new URL('/participant', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};