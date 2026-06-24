import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const isGeneralUser = cookieStore.get('user_session')?.value?.startsWith('general:');
  
  // 모든 사용자를 대시보드로 이동 (대시보드 내부에서 권한별 UI 분기 처리됨)
  redirect("/dashboard");
}
