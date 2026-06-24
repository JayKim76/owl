import { cookies } from 'next/headers';

export type SessionInfo =
  | { role: 'admin'; isAdmin: true; userId: null }
  | { role: 'general'; isAdmin: false; userId: number }
  | { role: 'company'; isAdmin: false; userId: null; companyId: number }
  | { role: 'anonymous'; isAdmin: false; userId: null };

export async function getSessionInfo(): Promise<SessionInfo> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  const userSession = cookieStore.get('user_session')?.value;
  const companySession = cookieStore.get('company_session')?.value;

  if (adminSession) {
    return { role: 'admin', isAdmin: true, userId: null };
  }

  if (userSession && userSession.startsWith('general:')) {
    const userId = parseInt(userSession.split(':')[1], 10);
    return { role: 'general', isAdmin: false, userId };
  }

  if (companySession && companySession.startsWith('company:')) {
    const companyId = parseInt(companySession.split(':')[1], 10);
    return { role: 'company', isAdmin: false, userId: null, companyId };
  }

  return { role: 'anonymous', isAdmin: false, userId: null };
}
