import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createSessionToken } from '@/lib/session';

function getRedirectUrl(request: Request, pathname: string) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || 
    (host.includes('localhost') || host.match(/^(127\.|192\.|10\.|172\.)/) ? 'http' : 'https');
  return new URL(pathname, `${proto}://${host}`);
}

export async function POST(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  let phone = '';
  let password = '';

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const fd = await request.formData();
    phone    = String(fd.get('phone') || '');
    password = String(fd.get('password') || '');
  } else {
    const body = await request.json().catch(() => ({}));
    phone    = String(body.phone || '');
    password = String(body.password || '');
  }

  const wantsRedirect = (request.headers.get('accept') || '').includes('text/html');

  if (!phone || !password) {
    if (wantsRedirect) return NextResponse.redirect(getRedirectUrl(request, '/login?error=company-fields'), { status: 303 });
    return NextResponse.json({ error: '연락처와 비밀번호를 모두 입력해주세요.' }, { status: 400 });
  }

  // 연락처 정규화: 숫자만 추출 후 010-XXXX-XXXX 형식으로
  const digits = phone.replace(/\D/g, '');
  const normalizedPhone = digits.length === 11
    ? `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`
    : phone;

  const company = await prisma.company.findFirst({
    where: { OR: [{ phone: normalizedPhone }, { phone: digits }] },
    include: { subscription: true },
  });

  if (!company || !verifyPassword(password, company.passwordHash)) {
    if (wantsRedirect) return NextResponse.redirect(getRedirectUrl(request, '/login?error=company-auth'), { status: 303 });
    return NextResponse.json({ error: '연락처 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  if (!company.isActive) {
    if (wantsRedirect) return NextResponse.redirect(getRedirectUrl(request, '/login?error=company-pending'), { status: 303 });
    return NextResponse.json({ error: '관리자 승인 대기 중입니다. 승인 후 서비스를 이용하실 수 있습니다.' }, { status: 403 });
  }

  const token = await createSessionToken({ role: 'company', companyId: company.id });

  const response = wantsRedirect
    ? NextResponse.redirect(getRedirectUrl(request, '/dashboard'), { status: 303 })
    : NextResponse.json({ success: true, role: 'company', redirectTo: '/dashboard', token, company: { id: company.id, name: company.name } });

  response.cookies.set({
    name: 'company_session',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.delete('admin_session');
  response.cookies.delete('user_session');

  return response;
}
