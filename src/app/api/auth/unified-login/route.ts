import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, hashPassword } from '@/lib/password';

function getRedirectUrl(request: Request, pathname: string) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || 
    (host.includes('localhost') || host.match(/^(127\.|192\.|10\.|172\.)/) ? 'http' : 'https');
  return new URL(pathname, `${proto}://${host}`);
}

function wantsRedirect(request: Request) {
  const accept = request.headers.get('accept') || '';
  const ct = request.headers.get('content-type') || '';
  return accept.includes('text/html') || ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data');
}

async function readBody(request: Request) {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
    const fd = await request.formData();
    return { phone: String(fd.get('phone') || '').trim(), password: String(fd.get('password') || '') };
  }
  const body = await request.json().catch(() => ({}));
  return { phone: String(body.phone || '').trim(), password: String(body.password || '') };
}

async function ensureDefaultGeneralUser() {
  const count = await prisma.generalUser.count();
  if (count > 0) return;
  await prisma.generalUser.create({
    data: {
      name: '일반 사용자',
      passwordHash: hashPassword(process.env.GENERAL_USER_DEFAULT_PASSWORD || '1234'),
      memo: '기본 현장 업무 계정',
    },
  });
}

export async function POST(request: Request) {
  const redirect = wantsRedirect(request);
  const { phone, password } = await readBody(request);

  if (!password) {
    if (redirect) return NextResponse.redirect(getRedirectUrl(request, '/login?error=no-password'), { status: 303 });
    return NextResponse.json({ error: '비밀번호를 입력해주세요.' }, { status: 400 });
  }

  // ── 업체 로그인: 연락처를 입력한 경우
  if (phone) {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.length === 11
      ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
      : phone;

    const company = await prisma.company.findFirst({
      where: { OR: [{ phone: normalized }, { phone: digits }, { phone }] },
    });

    if (!company || !verifyPassword(password, company.passwordHash)) {
      if (redirect) return NextResponse.redirect(getRedirectUrl(request, '/login?error=auth-fail'), { status: 303 });
      return NextResponse.json({ error: '연락처 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    if (!company.isActive) {
      if (redirect) return NextResponse.redirect(getRedirectUrl(request, '/login?error=pending'), { status: 303 });
      return NextResponse.json({ error: '관리자 승인 대기 중입니다. 승인 후 서비스를 이용하실 수 있습니다.' }, { status: 403 });
    }

    const response = redirect
      ? NextResponse.redirect(getRedirectUrl(request, '/dashboard'), { status: 303 })
      : NextResponse.json({ success: true, role: 'company', redirectTo: '/dashboard', name: company.name });

    response.cookies.set({ name: 'company_session', value: `company:${company.id}`, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.delete('admin_session');
    response.cookies.delete('user_session');
    return response;
  }

  // ── 현장 사용자 로그인: 연락처 없이 비밀번호만 입력한 경우
  await ensureDefaultGeneralUser();

  const activeUsers = await prisma.generalUser.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });
  const matched = activeUsers.find(u => verifyPassword(password, u.passwordHash));

  if (!matched) {
    if (redirect) return NextResponse.redirect(getRedirectUrl(request, '/login?error=auth-fail'), { status: 303 });
    return NextResponse.json({ error: '비밀번호가 일치하지 않거나 활성 계정이 없습니다.' }, { status: 401 });
  }

  await prisma.generalUser.update({ where: { id: matched.id }, data: { lastLogin: new Date() } });

  const response = redirect
    ? NextResponse.redirect(getRedirectUrl(request, '/dashboard'), { status: 303 })
    : NextResponse.json({ success: true, role: 'user', redirectTo: '/dashboard', name: matched.name });

  response.cookies.set({ name: 'user_session', value: `general:${matched.id}`, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  response.cookies.delete('admin_session');
  response.cookies.delete('company_session');
  return response;
}
