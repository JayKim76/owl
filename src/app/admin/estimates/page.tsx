import prisma from "@/lib/prisma";
import { FileText, Search, ExternalLink, CalendarClock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminEstimatesPage() {
  const estimates = await prisma.estimate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      task: true
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileText size={24} className="text-emerald-600" />
            견적 관리
          </h1>
          <p className="text-sm text-slate-500 mt-1">총 {estimates.length}건의 견적이 등록되어 있습니다.</p>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="연락처 또는 위치 검색..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 bg-white shadow-sm"
          />
          <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">접수번호</th>
                <th className="px-6 py-4">접수일시</th>
                <th className="px-6 py-4">고객 연락처</th>
                <th className="px-6 py-4">누수 위치</th>
                <th className="px-6 py-4">필요 공사 내역</th>
                <th className="px-6 py-4">예상 견적가 (최소~최대)</th>
                <th className="px-6 py-4">상태</th>
                <th className="px-6 py-4 text-center">상세보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {estimates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    접수된 견적이 없습니다.
                  </td>
                </tr>
              ) : (
                estimates.map((est) => {
                  const reqWorks = (est.requiredWorks as string[]) || [];
                  return (
                    <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-400 font-mono">EST-{String(est.id).padStart(4, '0')}</td>
                      <td className="px-6 py-4 text-slate-600">
                        {est.createdAt.toLocaleDateString('ko-KR')} <span className="text-slate-400 text-xs">{est.createdAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {est.customerPhone?.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') || "미상"}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium max-w-[150px] truncate">
                        {est.leakLocation || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {reqWorks.length > 0 ? (
                            <>
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">
                                {reqWorks[0]}
                              </span>
                              {reqWorks.length > 1 && (
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs border border-slate-200">
                                  +{reqWorks.length - 1}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 text-xs">없음</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">
                          {new Intl.NumberFormat('ko-KR').format(est.estimatedMinPrice || 0)}원
                          <span className="text-slate-400 font-normal mx-1">~</span>
                          {new Intl.NumberFormat('ko-KR').format(est.estimatedMaxPrice || 0)}원
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {est.task ? (
                          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold w-fit">
                            <CalendarClock size={14} /> 작업 배정됨
                          </span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold">
                            대기 중
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50 inline-flex">
                          <ExternalLink size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
