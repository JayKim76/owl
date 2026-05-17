import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';

    if (password === adminPassword) {
      // Create JWT token for mobile apps
      const encoder = new TextEncoder();
      const token = await new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encoder.encode(jwtSecret));

      // Create response with success message and token
      const response = NextResponse.json({ 
        success: true, 
        token: token,
        message: '로그인 성공' 
      });
      
      // Set HTTP-only cookie for web dashboard
      response.cookies.set({
        name: 'admin_session',
        value: token, // Store the JWT in the cookie instead of just 'authenticated'
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: '비밀번호가 일치하지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
