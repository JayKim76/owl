'use client';

import { useEffect, useState, useCallback } from 'react';
import { Building2, Clock, CheckCircle2, XCircle, ShieldOff, Trash2, RefreshCw, Mail, Phone, Calendar, CreditCard } from 'lucide-react';

type Subscription = {
  plan: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
};

type Company = {
  id: number | string;
  isPartner?: boolean;
  partnerId?: number;
  name: string;
  ownerName: string;
  phone: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  subscription: Subscription | null;
};

const PLAN_LABEL: Record<string, string> = { trial: '체험판 (14일)', basic: 'Basic', pro: 'Pro' };
const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:   { label: '승인 대기', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  active:    { label: '이용 중', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  expired:   { label: '만료', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  cancelled: { label: '거절됨', color: 'bg-rose-50 text-rose-600 border-rose-200' },
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/companies');
      const data = await res.json();
      setCompanies(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const doAction = async (company: Company, action: string, plan?: string) => {
    setActionLoading(company.id);
    try {
      const res = await fetch('/api/admin/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          isPartner: company.isPartner,
          partnerId: company.partnerId,
          action,
          plan,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message, 'success');
        await fetchCompanies();
      } else {
        showToast(data.error || '오류가 발생했습니다.', 'error');
      }
    } catch {
      showToast('네트워크 오류가 발생했습니다.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const pending = companies.filter(c => c.subscription?.status === 'pending');
  const others = companies.filter(c => c.subscription?.status !== 'pending');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium border animate-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 size={26} className="text-blue-600" />
            가입 업체 관리
          </h1>
          <p className="text-sm text-slate-500 mt-1">신규 가입 신청을 승인하거나 거절하고, 기존 업체의 상태를 관리합니다.</p>
        </div>
        <button onClick={fetchCompanies} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          새로고침
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '전체 업체', value: companies.length, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
          { label: '승인 대기', value: pending.length, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          { label: '이용 중', value: companies.filter(c => c.isActive).length, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
          { label: '거절/만료', value: companies.filter(c => ['cancelled','expired'].includes(c.subscription?.status||'')).length, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
            <p className={`text-xs font-semibold ${s.color} opacity-70`}>{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending section */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
        <div className="px-6 py-4 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <Clock size={18} className="text-amber-600" />
          <h2 className="text-base font-bold text-amber-800">승인 대기 중</h2>
          <span className="ml-auto text-xs font-bold bg-amber-200 text-amber-800 px-2.5 py-0.5 rounded-full">{pending.length}건</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">불러오는 중...</div>
        ) : pending.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">대기 중인 신청이 없습니다.</div>
        ) : (
          <div className="divide-y divide-amber-50">
            {pending.map(c => (
              <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-base font-bold text-slate-800">{c.name}</span>
                    <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                      {PLAN_LABEL[c.subscription?.plan || 'trial']}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Building2 size={12} /> 대표: {c.ownerName}</span>
                    <span className="flex items-center gap-1"><Phone size={12} /> {c.phone}</span>
                    {c.email && <span className="flex items-center gap-1"><Mail size={12} /> {c.email}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> 신청일: {new Date(c.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => doAction(c, 'approve', c.subscription?.plan)}
                    disabled={actionLoading === c.id}
                    className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all"
                  >
                    <CheckCircle2 size={15} />
                    승인
                  </button>
                  <button
                    onClick={() => doAction(c, 'reject')}
                    disabled={actionLoading === c.id}
                    className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-600 text-sm font-bold px-4 py-2 rounded-xl border border-rose-200 transition-all"
                  >
                    <XCircle size={15} />
                    거절
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All companies table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Building2 size={18} className="text-slate-500" />
          <h2 className="text-base font-bold text-slate-800">전체 업체 목록</h2>
          <span className="ml-auto text-xs font-medium text-slate-400">{companies.length}개 업체</span>
        </div>

        {!loading && companies.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">가입 업체가 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-semibold">
                <tr>
                  <th className="px-6 py-3">상태</th>
                  <th className="px-6 py-3">업체명</th>
                  <th className="px-6 py-3">대표자</th>
                  <th className="px-6 py-3">연락처</th>
                  <th className="px-6 py-3">플랜</th>
                  <th className="px-6 py-3">이용 기간</th>
                  <th className="px-6 py-3">신청일</th>
                  <th className="px-6 py-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {companies.map(c => {
                  const st = STATUS_LABEL[c.subscription?.status || 'pending'];
                  const isLoading = actionLoading === c.id;
                  const planText = PLAN_LABEL[c.subscription?.plan || ''] || c.subscription?.plan || '일반';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2.5 py-1 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{c.name}</td>
                      <td className="px-6 py-4 text-slate-600">{c.ownerName}</td>
                      <td className="px-6 py-4 text-slate-600">{c.phone}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <CreditCard size={12} />
                          {planText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {c.subscription?.startDate
                          ? `${new Date(c.subscription.startDate).toLocaleDateString('ko-KR')} ~ ${new Date(c.subscription.endDate!).toLocaleDateString('ko-KR')}`
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString('ko-KR')}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {c.subscription?.status === 'pending' && (
                            <button onClick={() => doAction(c, 'approve', c.subscription?.plan)} disabled={isLoading}
                              className="text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              <CheckCircle2 size={12} /> 승인
                            </button>
                          )}
                          {c.isActive && (
                            <button onClick={() => doAction(c, 'deactivate')} disabled={isLoading}
                              className="text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                              <ShieldOff size={12} /> 비활성화
                            </button>
                          )}
                          <button onClick={() => { if (confirm(`"${c.name}" 업체를 삭제하시겠습니까?`)) doAction(c, 'delete'); }} disabled={isLoading}
                            className="text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                            <Trash2 size={12} /> 삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
