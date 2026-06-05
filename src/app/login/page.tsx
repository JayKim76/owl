import { ArrowRight, Lock, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMessage =
    params?.error === "admin"
      ? "관리자 비밀번호가 일치하지 않습니다."
      : params?.error === "user"
        ? "일반 사용자 비밀번호가 일치하지 않거나 활성 계정이 없습니다."
      : params?.error === "user-password"
        ? "일반 사용자 비밀번호를 입력해주세요."
      : params?.error === "server"
        ? "로그인 처리 중 서버 오류가 발생했습니다."
        : "";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-5xl relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl mb-4 shadow-inner">
            <Lock size={32} className="text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">부엉이누수탐지랩 로그인</h1>
          <p className="text-slate-400 text-sm mt-2">사용 목적에 맞는 접속 방식을 선택해주세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <section className="bg-white/10 backdrop-blur-xl border border-emerald-400/30 p-7 rounded-3xl shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center shrink-0">
                <UserRound size={28} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300 tracking-widest uppercase mb-1">FIELD USER</p>
                <h2 className="text-2xl font-bold text-white">일반 사용자</h2>
                <p className="text-slate-400 text-sm mt-2 leading-6">
                  관리자가 활성화한 일반 사용자 계정으로 현장 업무 대시보드에 접속합니다.
                </p>
              </div>
            </div>

            <form action="/api/auth/user-login" method="post" className="space-y-4">
              <input
                name="password"
                type="password"
                placeholder="일반 사용자 비밀번호 입력"
                className="w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-500"
                autoComplete="current-password"
                required
              />
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
              >
                일반 사용자 로그인 <ArrowRight size={20} />
              </button>
            </form>
          </section>

          <section className="bg-white/10 backdrop-blur-xl border border-blue-400/30 p-7 rounded-3xl shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck size={28} className="text-blue-300" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-300 tracking-widest uppercase mb-1">ADMIN</p>
                <h2 className="text-2xl font-bold text-white">관리자 로그인</h2>
                <p className="text-slate-400 text-sm mt-2 leading-6">
                  기존 관리자 대시보드에서 견적/고객/일반 사용자 계정을 관리합니다.
                </p>
              </div>
            </div>

            <form action="/api/auth/login" method="post" className="space-y-4">
              <div>
                <input
                  name="password"
                  type="password"
                  placeholder="관리자 비밀번호 입력"
                  className="w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-500"
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-600/25 active:scale-[0.98]"
              >
                관리자 로그인 <ArrowRight size={20} />
              </button>
            </form>
          </section>
        </div>

        {errorMessage && (
          <p className="mt-5 bg-rose-500/10 border border-rose-400/30 text-rose-300 text-sm px-4 py-3 rounded-2xl flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
            <ShieldAlert size={16} /> {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}
