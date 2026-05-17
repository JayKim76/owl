import prisma from "@/lib/prisma";
import { Users, FileText, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function AdminDashboard() {
  // Fetch stats concurrently
  const [
    totalCustomers,
    totalEstimates,
    recentEstimates
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.estimate.count(),
    prisma.estimate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true }
    })
  ]);

  // Aggregate stats (example: sum of estimated max price)
  const estimatesAgg = await prisma.estimate.aggregate({
    _sum: {
      estimatedMaxPrice: true,
    }
  });

  const totalRevenuePotential = estimatesAgg._sum.estimatedMaxPrice || 0;

  const statsCards = [
    { title: "총 고객 수", value: `${totalCustomers}명`, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "누적 견적 건수", value: `${totalEstimates}건`, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "잠재 매출액 (최대)", value: `${new Intl.NumberFormat('ko-KR').format(totalRevenuePotential)}원`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-100" },
    { title: "긴급 요망", value: "0건", icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                <Icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">최근 접수된 견적</h2>
          <Link href="/admin/estimates" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            전체 보기 &rarr;
          </Link>
        </div>
        
        {recentEstimates.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            접수된 견적이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-6 py-4">접수일</th>
                  <th className="px-6 py-4">고객 연락처</th>
                  <th className="px-6 py-4">누수 위치</th>
                  <th className="px-6 py-4">예상 견적가</th>
                  <th className="px-6 py-4 text-right">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEstimates.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">
                      {est.createdAt.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {est.customerPhone || est.customer?.phone || "미상"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                      {est.leakLocation || "미입력"}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {new Intl.NumberFormat('ko-KR').format(est.estimatedMinPrice || 0)}원 ~
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 px-3 py-1.5 rounded-lg">보기</button>
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
