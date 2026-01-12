import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // IMPORTANT: Ne JAMAIS rediriger depuis la page d'accueil (/)
  // La landing page doit toujours être accessible, même pour les utilisateurs connectés
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next(); // Laisser passer sans redirection
  }

  // Routes protégées - vérification basique du token
  // Note: Le token est stocké dans localStorage côté client, donc on vérifie seulement les cookies
  // La vraie vérification se fait côté client dans AuthContext
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // On laisse passer et la vérification se fera côté client
    // Si pas de token dans les cookies, le client redirigera si nécessaire
  }

  // Rediriger les utilisateurs connectés depuis /login ou /register vers /dashboard
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
