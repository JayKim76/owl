import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

export type SessionInfo =
  | { role: 'admin'; isAdmin: true; userId: null }
  | { role: 'general'; isAdmin: false; userId: number }
  | { role: 'company'; isAdmin: false; userId: null; companyId: number }
  | { role: 'anonymous'; isAdmin: false; userId: null };

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'owl_super_secret_key_2026');

export async function createSessionToken(payload: { role: 'admin' | 'general' | 'company'; userId?: number; companyId?: number }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function getSessionInfo(): Promise<SessionInfo> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  const userSession = cookieStore.get('user_session')?.value;
  const companySession = cookieStore.get('company_session')?.value;

  if (adminSession) {
    try {
      await jwtVerify(adminSession, JWT_SECRET);
      return { role: 'admin', isAdmin: true, userId: null };
    } catch {
      // Invalid admin token
    }
  }

  if (userSession) {
    try {
      const { payload } = await jwtVerify(userSession, JWT_SECRET);
      if (payload.role === 'general' && typeof payload.userId === 'number') {
        return { role: 'general', isAdmin: false, userId: payload.userId };
      }
    } catch {
      // Fallback backwards compatibility for legacy plaintext cookies temporarily
      if (userSession.startsWith('general:')) {
        const userId = parseInt(userSession.split(':')[1], 10);
        if (!isNaN(userId)) {
          return { role: 'general', isAdmin: false, userId };
        }
      }
    }
  }

  if (companySession) {
    try {
      const { payload } = await jwtVerify(companySession, JWT_SECRET);
      if (payload.role === 'company' && typeof payload.companyId === 'number') {
        return { role: 'company', isAdmin: false, userId: null, companyId: payload.companyId };
      }
    } catch {
      // Fallback backwards compatibility for legacy plaintext cookies temporarily
      if (companySession.startsWith('company:')) {
        const companyId = parseInt(companySession.split(':')[1], 10);
        if (!isNaN(companyId)) {
          return { role: 'company', isAdmin: false, userId: null, companyId };
        }
      }
    }
  }

  return { role: 'anonymous', isAdmin: false, userId: null };
}

