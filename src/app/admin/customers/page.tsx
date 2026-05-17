import prisma from "@/lib/prisma";
import { Users, Search, MoreVertical } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { estimates: true, tasks: true }
      }
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={24} className="text-blue-600" />
            고객 관리
          </h1>
          <p className="text-sm text-slate-500 mt-1">총 {customers.length}명의 고객이 등록되어 있습니다.</p>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="이름 또는 연락처 검색..." 
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white shadow-sm"
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
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">고객명</th>
                <th className="px-6 py-4">연락처</th>
                <th className="px-6 py-4">견적 내역 수</th>
                <th className="px-6 py-4">진행 작업 수</th>
                <th className="px-6 py-4">등록일</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    등록된 고객이 없습니다.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-400">#{customer.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {customer.name || "미등록"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {customer.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        {customer._count.estimates}건
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold">
                        {customer._count.tasks}건
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {customer.createdAt.toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
