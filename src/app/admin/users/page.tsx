import prisma from "@/lib/prisma";
import { UserCog, UserPlus, Phone, StickyNote, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ error?: string }>;

export default async function AdminGeneralUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const users = await prisma.generalUser.findMany({
    include: { partner: true },
    orderBy: { createdAt: 'desc' },
  });

  const activeCount = users.filter((user) => user.isActive).length;

  const errorMessage =
    params?.error === 'name'
      ? '이름을 입력해주세요.'
      : params?.error === 'password'
        ? '일반 사용자 비밀번호를 입력해주세요.'
      : params?.error === 'duplicate'
        ? '이미 등록된 연락처입니다.'
        : '';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCog size={26} className="text-blue-600" />
            업체관리
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            업체 등록과 연결된 로그인 계정을 함께 관리합니다. 연락처가 있는 계정은 협력사 목록에도 함께 반영됩니다.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-blue-500 font-semibold">전체 업체 계정</p>
            <p className="text-2xl font-bold text-blue-900">{users.length}명</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-emerald-600 font-semibold">활성 계정</p>
            <p className="text-2xl font-bold text-emerald-900">{activeCount}명</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            새 업체 계정 등록
          </h2>
          {errorMessage && (
            <p className="mt-2 text-sm text-rose-600 font-medium">{errorMessage}</p>
          )}
        </div>
        <form action="/api/admin/users" method="post" className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_2fr_auto] gap-3">
          <input type="hidden" name="action" value="create" />
          <label className="block">
            <span className="text-xs font-bold text-slate-500">이름</span>
            <input
              name="name"
              required
              placeholder="예: 현장팀 A"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">연락처</span>
            <input
              name="phone"
              placeholder="01012345678"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">로그인 비밀번호</span>
            <input
              name="password"
              type="password"
              required
              placeholder="일반 사용자 비밀번호"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500">메모</span>
            <input
              name="memo"
              placeholder="담당 지역, 역할 등"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <button type="submit" className="lg:self-end rounded-xl bg-blue-600 text-white px-5 py-3 text-sm font-bold hover:bg-blue-700 transition-colors">
            등록
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">등록된 업체 계정</h2>
          <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">{users.length} accounts</span>
        </div>

        {users.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            아직 등록된 업체 계정이 없습니다. 위 등록 폼에서 추가해주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">상태</th>
                  <th className="px-6 py-4">이름</th>
                  <th className="px-6 py-4">연락처</th>
                  <th className="px-6 py-4">메모</th>
                  <th className="px-6 py-4">연결 협력사</th>
                  <th className="px-6 py-4">비밀번호</th>
                  <th className="px-6 py-4">최근 접속</th>
                  <th className="px-6 py-4">등록일</th>
                  <th className="px-6 py-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {user.isActive ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                        {user.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{user.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <Phone size={14} className="text-slate-400" />
                        {user.phone || '미입력'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-[260px] truncate">
                      <span className="inline-flex items-center gap-2">
                        <StickyNote size={14} className="text-slate-400" />
                        {user.memo || '메모 없음'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {user.partner ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700">
                          {user.partner.companyName}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">미연결</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <form action="/api/admin/users" method="post" className="flex items-center gap-2">
                        <input type="hidden" name="action" value="password" />
                        <input type="hidden" name="id" value={user.id} />
                        <input
                          name="password"
                          type="password"
                          placeholder="새 비밀번호"
                          className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">
                          변경
                        </button>
                      </form>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.lastLogin ? user.lastLogin.toLocaleDateString('ko-KR') : '기록 없음'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {user.createdAt.toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <form action="/api/admin/users" method="post">
                          <input type="hidden" name="action" value="toggle" />
                          <input type="hidden" name="id" value={user.id} />
                          <button type="submit" className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200">
                            {user.isActive ? '비활성화' : '활성화'}
                          </button>
                        </form>
                        <form action="/api/admin/users" method="post">
                          <input type="hidden" name="action" value="delete" />
                          <input type="hidden" name="id" value={user.id} />
                          <button type="submit" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 inline-flex items-center gap-1">
                            <Trash2 size={13} /> 삭제
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
