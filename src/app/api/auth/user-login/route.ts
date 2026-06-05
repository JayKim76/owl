import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';

function getRedirectUrl(request: Request, pathname: string) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'www.owl-leak.kr';
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto || (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return new URL(pathname, `${protocol}://${host}`);
}

function wantsHtmlRedirect(request: Request) {
  const accept = request.headers.get('accept') || '';
  const contentType = request.headers.get('content-type') || '';
  const url = new URL(request.url);

  return accept.includes('text/html') || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data') || url.searchParams.get('redirect') === '1';
}

async function readPassword(request: Request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return String(formData.get('password') || '');
  }

  const body = await request.json().catch(() => ({}));
  return String(body.password || '');
}

async function ensureDefaultGeneralUser() {
  const userCount = await prisma.generalUser.count();

  if (userCount > 0) {
    return;
  }

  await prisma.generalUser.create({
    data: {
      name: '일반 사용자',
      passwordHash: hashPassword(process.env.GENERAL_USER_DEFAULT_PASSWORD || '1234'),
      memo: '기본 현장 업무 계정',
    },
  });
}

async function createUserLoginResponse(request: Request) {
  const shouldRedirect = wantsHtmlRedirect(request);
  const password = await readPassword(request);

  if (!password) {
    return shouldRedirect
      ? NextResponse.redirect(getRedirectUrl(request, '/login?error=user-password'), { status: 303 })
      : NextResponse.json(
          { success: false, error: '일반 사용자 비밀번호를 입력해주세요.' },
          { status: 400 }
        );
  }

  await ensureDefaultGeneralUser();

  const activeUsers = await prisma.generalUser.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  const loginUser = activeUsers.find((user) => verifyPassword(password, user.passwordHash));

  if (!loginUser) {
    return shouldRedirect
      ? NextResponse.redirect(getRedirectUrl(request, '/login?error=user'), { status: 303 })
      : NextResponse.json(
          { success: false, error: '일반 사용자 비밀번호가 일치하지 않거나 활성 계정이 없습니다.' },
          { status: 401 }
        );
  }

  const updatedUser = await prisma.generalUser.update({
    where: { id: loginUser.id },
    data: { lastLogin: new Date() },
  });

  const response = shouldRedirect
    ? NextResponse.redirect(getRedirectUrl(request, '/dashboard'), { status: 303 })
    : NextResponse.json({
        success: true,
        role: 'user',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
        },
        redirectTo: '/dashboard',
        message: '일반 사용자 접속 성공',
      });

  response.cookies.set({
    name: 'user_session',
    value: `general:${updatedUser.id}`,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}

export async function POST(request: Request) {
  return createUserLoginResponse(request);
}
