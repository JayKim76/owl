'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    id: 'trial',
    name: '체험판',
    badge: '14일 무료',
    price: '₩0',
    period: '/월',
    features: ['고객 등록 최대 50건', '견적서 작성', '협력사 3개'],
    color: 'border-slate-500/60',
    selectedColor: 'border-slate-400 bg-slate-700/30',
    badgeColor: 'bg-slate-600',
  },
  {
    id: 'basic',
    name: 'Basic',
    badge: '인기',
    price: '₩49,000',
    period: '/월',
    features: ['고객 등록 무제한', '견적서 양식 커스텀', '협력사 무제한', '카카오 알림톡'],
    color: 'border-emerald-500/40',
    selectedColor: 'border-emerald-400 bg-emerald-900/20',
    badgeColor: 'bg-emerald-600',
  },
  {
    id: 'pro',
    name: 'Pro',
    badge: '최고 기능',
    price: '₩99,000',
    period: '/월',
    features: ['Basic 모든 기능', 'AI 누수 진단', '다중 사용자 계정', '우선 고객 지원'],
    color: 'border-blue-500/40',
    selectedColor: 'border-blue-400 bg-blue-900/20',
    badgeColor: 'bg-blue-600',
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('trial');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const [form, setForm] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    password: '',
    passwordConfirm: '',
    agree: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!form.agree) {
      setError('이용약관에 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          ownerName: form.ownerName,
          phone: form.phone,
          email: form.email || undefined,
          password: form.password,
          plan: selectedPlan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '가입 처리 중 오류가 발생했습니다.');
        return;
      }
      setCompanyName(form.name);
      setShowModal(true);
    } catch {
      setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 pt-10 font-sans">

      {/* 가입 완료 팝업 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* 모달 카드 */}
          <div className="relative w-full max-w-sm bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-5 animate-in zoom-in-95 fade-in duration-300">
            {/* 성공 아이콘 */}
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center">
              <CheckCircle2 size={44} className="text-emerald-400" />
            </div>

            {/* 제목 */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">가입 신청 완료!</h2>
              <p className="text-emerald-400 text-sm font-semibold">{companyName}</p>
            </div>

            {/* 안내 메시지 */}
            <div className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl px-5 py-4 space-y-2 text-center">
              <p className="text-slate-300 text-sm leading-6">
                가입 신청이 접수되었습니다.<br />
                관리자 승인 후 서비스를 이용하실 수 있습니다.
              </p>
              <p className="text-slate-500 text-xs">
                영업일 기준 1~2일 내 등록하신 연락처로 안내드립니다.
              </p>
            </div>

            {/* 확인 버튼 */}
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
            >
              <ArrowLeft size={16} />
              확인 (로그인 페이지로 이동)
            </button>
          </div>
        </div>
      )}
      <div className="w-full max-w-2xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mb-6">
            <ArrowLeft size={16} /> 로그인 페이지
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-400/30 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">신규 업체 가입</h1>
          </div>
          <p className="text-slate-400 text-sm">부엉이누수탐지랩 CRM 서비스를 시작해보세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 업체 정보 */}
          <section className="bg-white/5 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold text-base">업체 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">업체명 *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="예: 서울누수탐지 주식회사"
                  className="w-full bg-slate-800/60 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">대표자명 *</label>
                <input
                  name="ownerName"
                  value={form.ownerName}
                  onChange={handleChange}
                  required
                  placeholder="홍길동"
                  className="w-full bg-slate-800/60 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">연락처 *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  required
                  placeholder="010-0000-0000"
                  className="w-full bg-slate-800/60 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">이메일 (선택)</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@company.com"
                  className="w-full bg-slate-800/60 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">비밀번호 *</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  placeholder="8자 이상"
                  className="w-full bg-slate-800/60 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs mb-1.5">비밀번호 확인 *</label>
                <input
                  name="passwordConfirm"
                  type="password"
                  value={form.passwordConfirm}
                  onChange={handleChange}
                  required
                  placeholder="비밀번호 재입력"
                  className="w-full bg-slate-800/60 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>
          </section>

          {/* 구독 플랜 선택 */}
          <section className="bg-white/5 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-semibold text-base flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />
              구독 플랜 선택
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === plan.id ? plan.selectedColor : `${plan.color} bg-slate-800/30`
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-sm">{plan.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                  </div>
                  <div className="text-white font-extrabold text-lg mb-2">
                    {plan.price}<span className="text-slate-400 text-xs font-normal">{plan.period}</span>
                  </div>
                  <ul className="space-y-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-slate-300 text-xs">
                        <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </section>

          {/* 약관 동의 */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              name="agree"
              type="checkbox"
              checked={form.agree}
              onChange={handleChange}
              className="mt-0.5 w-4 h-4 accent-emerald-500"
            />
            <span className="text-slate-400 text-sm leading-6">
              <Link href="/terms" target="_blank" className="text-white font-medium underline underline-offset-2 hover:text-emerald-400 transition-colors">이용약관</Link> 및{' '}
              <Link href="/privacy" target="_blank" className="text-white font-medium underline underline-offset-2 hover:text-emerald-400 transition-colors">개인정보처리방침</Link>에 동의합니다.
              관리자 승인 후 서비스 이용이 가능하며, 가입 신청 후 영업일 기준 1~2일 내 안내드립니다.
            </span>
          </label>

          {error && (
            <p className="bg-rose-500/10 border border-rose-400/30 text-rose-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-60 text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                가입하기
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6 pb-10">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
