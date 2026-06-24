'use client';

import { useState } from 'react';
import { ArrowRight, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm({ errorMessage }: { errorMessage: string }) {
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const isUser = mode === 'user';

  return (
    <section
      className={`bg-white/10 backdrop-blur-xl border p-7 rounded-3xl shadow-2xl transition-colors ${
        isUser ? 'border-emerald-400/30' : 'border-blue-400/30'
      }`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
            isUser
              ? 'bg-emerald-500/20 border-emerald-400/30'
              : 'bg-blue-600/20 border-blue-500/30'
          }`}
        >
          {isUser ? (
            <UserRound size={28} className="text-emerald-300" />
          ) : (
            <ShieldCheck size={28} className="text-blue-300" />
          )}
        </div>
        <div>
          <p
            className={`text-xs font-bold tracking-widest uppercase mb-1 ${
              isUser ? 'text-emerald-300' : 'text-blue-300'
            }`}
          >
            {isUser ? 'USER / COMPANY' : 'ADMIN'}
          </p>
          <h2 className="text-2xl font-bold text-white">
            {isUser ? '사용자 로그인' : '관리자 로그인'}
          </h2>
          <p className="text-slate-400 text-sm mt-2 leading-6">
            {isUser
              ? '현장 사용자는 비밀번호만, 가입 업체는 연락처와 비밀번호를 함께 입력하세요.'
              : '관리자 대시보드에서 견적·고객·사용자 계정을 관리합니다.'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5" role="radiogroup" aria-label="로그인 모드">
        <label
          className={`flex-1 text-center text-sm font-semibold py-2.5 rounded-xl border cursor-pointer transition-all ${
            isUser
              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
              : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <input
            type="radio"
            name="login-mode"
            value="user"
            checked={isUser}
            onChange={() => setMode('user')}
            className="sr-only"
          />
          일반 사용자
        </label>
        <label
          className={`flex-1 text-center text-sm font-semibold py-2.5 rounded-xl border cursor-pointer transition-all ${
            !isUser
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <input
            type="radio"
            name="login-mode"
            value="admin"
            checked={!isUser}
            onChange={() => setMode('admin')}
            className="sr-only"
          />
          관리자
        </label>
      </div>

      <form
        action={isUser ? '/api/auth/unified-login' : '/api/auth/login'}
        method="post"
        className="space-y-3"
      >
        {isUser && (
          <input
            name="phone"
            type="tel"
            placeholder="연락처 (업체 로그인 시 입력)"
            className="w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-500"
            autoComplete="tel"
          />
        )}
        <input
          name="password"
          type="password"
          placeholder={isUser ? '비밀번호 입력' : '관리자 비밀번호 입력'}
          className={`w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-slate-500 ${
            isUser ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'
          }`}
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
            isUser
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/25'
              : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-600/25'
          }`}
        >
          {isUser ? '로그인' : '관리자 로그인'} <ArrowRight size={20} />
        </button>
      </form>

      {isUser && (
        <p className="mt-4 text-center text-slate-600 text-xs">
          아직 계정이 없으신가요?{' '}
          <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
            무료 체험 신청
          </Link>
        </p>
      )}

      {errorMessage && (
        <p className="mt-5 bg-rose-500/10 border border-rose-400/30 text-rose-300 text-sm px-4 py-3 rounded-2xl flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
          <ShieldAlert size={16} /> {errorMessage}
        </p>
      )}
    </section>
  );
}
