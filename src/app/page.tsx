import { Wrench, PhoneCall, CalendarClock, Briefcase, FileText, ChevronRight, Settings, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans sm:bg-gray-100 sm:items-center sm:py-10">
      <main className="flex flex-col w-full max-w-md bg-white min-h-screen sm:min-h-full sm:rounded-3xl sm:overflow-hidden sm:shadow-2xl">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 bg-blue-900 text-white shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-400 text-blue-900 font-bold">
              🦉
            </div>
            <h1 className="text-xl font-bold tracking-tight">부엉이누수탐지랩</h1>
          </div>
          <button className="p-2 rounded-full hover:bg-blue-800 transition-colors">
            <Settings size={20} />
          </button>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 space-y-8">
          
          {/* Summary Cards */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">업무 요약</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <Wrench size={18} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">진행 중 공사</h3>
                <p className="text-2xl font-bold text-blue-900 mt-1">3건</p>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col justify-between">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
                  <PhoneCall size={18} />
                </div>
                <h3 className="text-sm font-medium text-gray-600">긴급 출동 대기</h3>
                <p className="text-2xl font-bold text-red-600 mt-1">1건</p>
              </div>
            </div>
          </section>

          {/* Weekly Schedule Calendar */}
          <section>
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-sm font-semibold text-gray-500">이번 주 일정</h2>
              <Link href="/calendar" className="text-xs text-blue-600 font-medium hover:underline">전체보기</Link>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-800">4월 2주차</span>
                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-md">오늘: 4월 2일 (목)</span>
              </div>
              <div className="flex justify-between">
                {[
                  { day: '월', date: '30', hasSchedule: false },
                  { day: '화', date: '31', hasSchedule: true },
                  { day: '수', date: '1', hasSchedule: false },
                  { day: '목', date: '2', hasSchedule: true, isToday: true },
                  { day: '금', date: '3', hasSchedule: true },
                  { day: '토', date: '4', hasSchedule: false },
                  { day: '일', date: '5', hasSchedule: false, isWeekend: true },
                ].map((item, idx) => (
                  <div key={idx} className={`flex flex-col items-center py-2 rounded-xl w-10 transition-colors ${item.isToday ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 cursor-pointer'}`}>
                    <span className={`text-xs mb-1 ${item.isWeekend && !item.isToday ? 'text-red-400' : ''}`}>{item.day}</span>
                    <span className={`font-semibold text-sm ${item.isToday ? 'text-white' : 'text-gray-800'}`}>{item.date}</span>
                    <div className="h-1.5 mt-1">
                      {item.hasSchedule && <div className={`w-1.5 h-1.5 rounded-full ${item.isToday ? 'bg-white' : 'bg-blue-500'}`}></div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-800">10:00 - 서초 래미안 아파트 누수 탐지</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500" />
                </div>
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-gray-800 font-bold">14:00 - 긴급: 송파 다세대 주택 배관</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-red-500" />
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 mb-3 px-1">빠른 메뉴</h2>
            <div className="space-y-3">
              <Link href="/estimate" className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">새 견적 산출</h3>
                    <p className="text-xs text-gray-500 mt-1">누수 유형별 견적 계산 및 고객 발송</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
              </Link>
              
              <Link href="/tasks" className="w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CalendarClock size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">작업 관리 및 사진</h3>
                    <p className="text-xs text-gray-500 mt-1">진행 현장 기록, 체크리스트, 사진 마크업</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-blue-500 transition-colors" />
              </Link>
            </div>
          </section>

          {/* Partner Action */}
          <section>
            <div className="p-5 rounded-2xl bg-slate-900 relative overflow-hidden">
              <div className="relative z-10 flex flex-col gap-1 text-white text-left max-w-[80%]">
                <h3 className="font-bold flex items-center gap-2">
                  <Users size={16} className="text-yellow-400" />
                  협력사(파트너) 포털
                </h3>
                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  방수, 인테리어 복구 파트너라면 전용 관리 화면으로 로그인 해주세요.
                </p>
                <button className="max-w-fit flex items-center gap-1 text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition-colors mt-1">
                  파트너 로그인 이동
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-slate-800 rounded-full opacity-50"></div>
              <div className="absolute top-4 right-4 text-slate-700 opacity-20">
                <Briefcase size={80} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
