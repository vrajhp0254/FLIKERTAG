import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the auth cookie
  const isLoggedIn = request.cookies.has('auth');
  const isLoginPage = request.nextUrl.pathname === '/login';
  
  // Check if the route is under authenticated group
  const isProtectedRoute = !isLoginPage;
  
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except api routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 