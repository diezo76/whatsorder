import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  const { pathname } = request.nextUrl;

  // IMPORTANT: Ne JAMAIS rediriger depuis la page d'accueil (/)
  // La landing page doit toujours être accessible, même pour les utilisateurs connectés
  if (pathname === '/') {
    return NextResponse.next(); // Laisser passer sans redirection
  }

  // IMPORTANT: Ne pas rediriger les routes publiques (menu restaurant)
  // Les routes dynamiques comme /[slug] doivent être accessibles sans authentification
  if (pathname.match(/^\/[^/]+$/)) {
    // Route dynamique de type /nile-bites, /restaurant-slug, etc.
    return NextResponse.next();
  }

  // Routes protégées - vérification basique du token
  // Note: Le token est stocké dans localStorage côté client, donc on vérifie seulement les cookies
  // La vraie vérification se fait côté client dans AuthContext
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    // On laisse passer et la vérification se fera côté client
    return NextResponse.next();
  }

  // Rediriger les utilisateurs connectés depuis /login ou /register vers /dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
