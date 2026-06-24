import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';

export const runtime = 'nodejs';

function getRedirectUrl(request: Request, pathname: string) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'www.owl-leak.kr';
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto || 
    (host.includes('localhost') || host.match(/^(127\.|192\.|10\.|172\.)/) ? 'http' : 'https');

  return new URL(pathname, `${protocol}://${host}`);
}

async function readPassword(request: Request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return String(formData.get('password') || '');
  }

  const body = await request.json();
  return String(body.password || '');
}

function wantsHtmlRedirect(request: Request) {
  const accept = request.headers.get('accept') || '';
  const contentType = request.headers.get('content-type') || '';

  return accept.includes('text/html') || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
}

export async function POST(request: Request) {
  try {
    const password = await readPassword(request);
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const shouldRedirect = wantsHtmlRedirect(request);

    const adminUser = await prisma.adminUser.findFirst({
      where: { username: 'admin', isActive: true },
    });

    const isDbPasswordValid = adminUser
      ? verifyPassword(password, adminUser.passwordHash)
      : false;

    // Allow fallback ADMIN_PASSWORD to act as a master password for recovery, 
    // even if a database admin row already exists.
    if (isDbPasswordValid || password === adminPassword) {
      // Create JWT token for mobile apps
      const encoder = new TextEncoder();
      const token = await new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encoder.encode(jwtSecret));

      const response = shouldRedirect
        ? NextResponse.redirect(getRedirectUrl(request, '/admin'), { status: 303 })
        : NextResponse.json({
            success: true,
            token,
            message: '로그인 성공',
          });

      // Set HTTP-only cookie for web dashboard
      response.cookies.set({
        name: 'admin_session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      response.cookies.delete('user_session');
      response.cookies.delete('company_session');

      return response;
    }

    if (shouldRedirect) {
      return NextResponse.redirect(getRedirectUrl(request, '/login?error=admin'), { status: 303 });
    }

    return NextResponse.json(
      { success: false, error: '비밀번호가 일치하지 않습니다.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);

    if (wantsHtmlRedirect(request)) {
      return NextResponse.redirect(getRedirectUrl(request, '/login?error=server'), { status: 303 });
    }

    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
