import { NextResponse } from 'next/server';

function getRedirectUrl(request: Request, pathname: string) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'www.owl-leak.kr';
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const protocol = forwardedProto || (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

  return new URL(pathname, `${protocol}://${host}`);
}

function wantsHtmlRedirect(request: Request) {
  const accept = request.headers.get('accept') || '';
  const contentType = request.headers.get('content-type') || '';

  return accept.includes('text/html') || contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data');
}

export async function POST(request: Request) {
  const response = wantsHtmlRedirect(request)
    ? NextResponse.redirect(getRedirectUrl(request, '/login'), { status: 303 })
    : NextResponse.json({ success: true });

  for (const name of ['admin_session', 'user_session']) {
    response.cookies.set({
      name,
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
  }

  return response;
}
