import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 1. Skip authentication for auth APIs and public routes
  if (path.startsWith('/api/auth') || path === '/login' || path.startsWith('/_next') || path === '/favicon.ico') {
    return NextResponse.next();
  }

  // 2. Extract token from Cookie or Authorization header
  let token = request.cookies.get('admin_session')?.value;
  
  const authHeader = request.headers.get('Authorization');
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 3. Verify token
  if (!token) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware JWT verification failed:', error);
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
