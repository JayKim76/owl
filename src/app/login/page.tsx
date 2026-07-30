import { Lock, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  const plans = [
    {
      name: "일반 사용자",
      badge: "단일 플랜",
      price: "₩99,000",
      period: "/월",
      color: "from-emerald-600 to-teal-700",
      border: "border-emerald-400/50",
      features: [
        "고객 및 현장 무제한 등록",
        "AI 누수 정밀 진단",
        "견적서 산출 및 양식 커스텀",
        "탐지절차 체크리스트 & 현장 사진 관리",
        "협력사 등록 및 관리",
      ],
    },
  ];

  const errorMessage =
    params?.error === "admin"
      ? "관리자 비밀번호가 일치하지 않습니다."
      : params?.error === "auth-fail"
        ? "연락처 또는 비밀번호가 올바르지 않습니다."
      : params?.error === "pending"
        ? "관리자 승인 대기 중입니다. 승인 후 서비스를 이용하실 수 있습니다."
      : params?.error === "no-password"
        ? "비밀번호를 입력해주세요."
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

        <div className="max-w-md mx-auto">
          <LoginForm errorMessage={errorMessage} />
        </div>

        {/* 구독 섹션 구분선 */}
        <div className="mt-12 mb-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-700"></div>
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Sparkles size={14} className="text-yellow-400" />
            신규 업체 구독 서비스
            <Sparkles size={14} className="text-yellow-400" />
          </div>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* 구독 플랜 카드 (일반 사용자 단일 플랜) */}
        <div className="max-w-md mx-auto mb-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white/5 backdrop-blur-xl border ${plan.border} rounded-2xl p-6 flex flex-col gap-4 shadow-xl`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${plan.color} text-white`}>
                  {plan.badge}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                <span className="text-slate-400 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 가입 CTA */}
        <div className="text-center pb-8">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-[0.98]"
          >
            <Sparkles size={18} />
            구독 및 서비스 신청하기
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
