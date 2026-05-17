"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, Loader2, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "비밀번호가 일치하지 않습니다.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("로그인 처리 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Lock size={32} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">관리자 로그인</h1>
          <p className="text-slate-400 text-sm mt-2">시스템 접근을 위해 비밀번호를 입력해주세요.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-500"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-rose-400 text-sm mt-2 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                <ShieldAlert size={14} /> {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-600/25 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                로그인 접속 <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            &larr; 일반 사용자 앱으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
