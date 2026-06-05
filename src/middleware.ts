import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

async function hasValidAdminSession(request: NextRequest) {
  let token = request.cookies.get('admin_session')?.value;
  const authHeader = request.headers.get('Authorization');

  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return false;
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    console.error('Middleware JWT verification failed:', error);
    return false;
  }
}

function hasGeneralUserSession(request: NextRequest) {
  const value = request.cookies.get('user_session')?.value;
  return value === 'general' || Boolean(value?.startsWith('general:'));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // 로그인 API, 로그인 페이지, 정적 파일은 인증 없이 허용합니다.
  if (
    path.startsWith('/api/auth') ||
    path === '/login' ||
    path.startsWith('/_next') ||
    path === '/favicon.ico' ||
    path === '/manifest.json' ||
    path.startsWith('/icons/')
  ) {
    return NextResponse.next();
  }

  const isAdmin = await hasValidAdminSession(request);
  const isGeneralUser = hasGeneralUserSession(request);

  // 관리자 화면은 관리자 로그인만 허용합니다.
  if (path.startsWith('/admin')) {
    if (isAdmin) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 일반 앱/API는 일반 사용자 또는 관리자 모두 접근할 수 있습니다.
  if (isAdmin || isGeneralUser) {
    return NextResponse.next();
  }

  if (path.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

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
