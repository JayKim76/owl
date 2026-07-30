import prisma from "@/lib/prisma";
import { Users, FileText, TrendingUp, UserCog, Building2, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic'; // Always fetch fresh data

export default async function AdminDashboard() {
  // Fetch stats concurrently
  const [
    totalCustomers,
    totalGeneralUsers,
    totalEstimates,
    pendingCompaniesCount,
    pendingPartnersCount,
    recentEstimates
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.generalUser.count(),
    prisma.estimate.count(),
    prisma.subscription.count({ where: { status: 'pending' } }),
    prisma.partner.count({ where: { status: 'pending' } }),
    prisma.estimate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true }
    })
  ]);

  const pendingCompanies = pendingCompaniesCount + pendingPartnersCount;

  // Aggregate stats (example: sum of estimated max price)
  const estimatesAgg = await prisma.estimate.aggregate({
    _sum: {
      estimatedMaxPrice: true,
    }
  });

  const totalRevenuePotential = estimatesAgg._sum.estimatedMaxPrice || 0;

  const statsCards = [
    { title: "총 고객 수", value: `${totalCustomers}명`, icon: Users, color: "text-blue-600", bg: "bg-blue-100", href: null },
    { title: "일반 사용자 계정", value: `${totalGeneralUsers}명`, icon: UserCog, color: "text-amber-600", bg: "bg-amber-100", href: null },
    { title: "누적 견적 건수", value: `${totalEstimates}건`, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-100", href: null },
    { title: "잠재 매출액 (최대)", value: `${new Intl.NumberFormat('ko-KR').format(totalRevenuePotential)}원`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-100", href: null },
    { title: "가입 승인 대기", value: `${pendingCompanies}건`, icon: pendingCompanies > 0 ? Clock : Building2, color: pendingCompanies > 0 ? "text-amber-600" : "text-slate-400", bg: pendingCompanies > 0 ? "bg-amber-100" : "bg-slate-100", href: "/admin/companies" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          const isPending = stat.href && pendingCompanies > 0;
          const card = (
            <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm border flex items-center gap-4 hover:shadow-md transition-shadow ${isPending ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200'}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
                <Icon size={24} className={stat.color} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className={`text-2xl font-bold mt-1 ${isPending ? 'text-amber-600' : 'text-slate-800'}`}>{stat.value}</h3>
              </div>
              {isPending && <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full animate-pulse">처리 필요</span>}
            </div>
          );
          return stat.href ? <Link key={i} href={stat.href}>{card}</Link> : card;
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
