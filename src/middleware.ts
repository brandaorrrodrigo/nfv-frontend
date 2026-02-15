import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/.')
  ) {
    return NextResponse.next();
  }

  // Verificar se tem token de autenticação
  const token = request.cookies.get('nfv_token')?.value;
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith('/api'));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // Redirecionar usuário autenticado das páginas de auth
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirecionar usuário não autenticado para login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
