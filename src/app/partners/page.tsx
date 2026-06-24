"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Phone, Mail, Users, Briefcase,
  Star, CheckCircle2, Clock, XCircle, Building2,
  Search, Filter, MapPin, Hash, Edit, Trash2
} from "lucide-react";

// 협력사 타입 정의
type PartnerStatus = "active" | "pending" | "inactive";
type PartnerType = "일반" | "누수" | "방수" | "배관" | "도배" | "미장" | "전기" | "타일" | "목수" | "하수도고압세척" | "마루부분시공";

interface Partner {
  id: string;
  companyName: string;
  type: PartnerType;
  manager: string;
  phone: string;
  email: string;
  region: string;       // 담당 지역
  partnerCode: string;  // 파트너 코드
  status: PartnerStatus;
  rating: number; // 1~5
  completedJobs: number;
  memo: string;
}

// 초기 더미 데이터
const INITIAL_PARTNERS: Partner[] = [
  {
    id: "1",
    companyName: "한성방수",
    type: "방수",
    manager: "김한성",
    phone: "010-1234-5678",
    email: "hansung@example.com",
    region: "서울 서초·강남",
    partnerCode: "PTR-WP-001",
    status: "active",
    rating: 5,
    completedJobs: 24,
    memo: "옥상·지하 방수 전문, 신뢰도 높음",
  },
  {
    id: "2",
    companyName: "서울목공",
    type: "목수",
    manager: "박지훈",
    phone: "010-9876-5432",
    email: "seoul.wood@example.com",
    region: "서울 전 지역",
    partnerCode: "PTR-WD-002",
    status: "active",
    rating: 4,
    completedJobs: 15,
    memo: "누수 복구 후 목공 마감 담당",
  },
  {
    id: "3",
    companyName: "강남파이프",
    type: "배관",
    manager: "이민수",
    phone: "010-5555-1234",
    email: "gangnam.pipe@example.com",
    region: "강남·송파·강동",
    partnerCode: "PTR-PL-003",
    status: "pending",
    rating: 3,
    completedJobs: 5,
    memo: "신규 파트너, 검증 진행 중",
  },
  {
    id: "4",
    companyName: "믿음도배",
    type: "도배",
    manager: "최영희",
    phone: "010-7777-8888",
    email: "mideom.dobe@example.com",
    region: "경기 남부",
    partnerCode: "PTR-WP-004",
    status: "active",
    rating: 4,
    completedJobs: 11,
    memo: "빠른 시공, 마감 깔끔",
  },
  {
    id: "5",
    companyName: "드림미장",
    type: "미장",
    manager: "정재원",
    phone: "010-2222-3333",
    email: "dream.mj@example.com",
    region: "인천·부천",
    partnerCode: "PTR-PL-005",
    status: "inactive",
    rating: 2,
    completedJobs: 3,
    memo: "현재 계약 종료 상태",
  },
];

// 업종별 색상 맵
const TYPE_COLOR: Record<PartnerType, { bg: string; text: string; border: string }> = {
  일반: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
  누수: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  방수: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  배관: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  도배: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  미장: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  전기: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200" },
  타일: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  목수: { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-200" },
  하수도고압세척: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  마루부분시공: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

// 상태별 배지 설정
const STATUS_CONFIG: Record<PartnerStatus, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
  active: {
    label: "활성",
    icon: <CheckCircle2 size={12} />,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  pending: {
    label: "검토중",
    icon: <Clock size={12} />,
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  inactive: {
    label: "비활성",
    icon: <XCircle size={12} />,
    bg: "bg-gray-100",
    text: "text-gray-500",
  },
};

const PARTNER_TYPES: PartnerType[] = ["일반", "누수", "방수", "배관", "도배", "미장", "전기", "타일", "목수", "하수도고압세척", "마루부분시공"];

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<PartnerStatus | "all">("all");
  const [isAdmin, setIsAdmin] = useState(false);

  // 폼 상태
  const [formData, setFormData] = useState({
    companyName: "",
    type: "방수" as PartnerType,
    manager: "",
    phone: "",
    email: "",
    region: "",
    partnerCode: "",
    status: "pending" as PartnerStatus,
    memo: "",
    password: "",
  });

  const resetForm = () => {
    setFormData({ companyName: "", type: "방수", manager: "", phone: "", email: "", region: "", partnerCode: "", status: "pending", memo: "", password: "" });
    setIsEditing(false);
    setEditId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (partner: Partner) => {
    setFormData({
      companyName: partner.companyName,
      type: partner.type,
      manager: partner.manager,
      phone: partner.phone,
      email: partner.email,
      region: partner.region,
      partnerCode: partner.partnerCode,
      status: partner.status,
      memo: partner.memo,
      password: "",
    });
    setIsEditing(true);
    setEditId(partner.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const loadPartners = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/partners", { cache: "no-store" });
      if (!response.ok) throw new Error("협력사 목록을 불러오지 못했습니다.");
      const data = await response.json() as Partner[];
      setPartners(data);
    } catch (error) {
      console.error(error);
      setErrorMessage("협력사 데이터를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(document.cookie.includes('admin_session'));
    loadPartners();
  }, []);

  // 파트너 등록/수정 처리
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!formData.companyName || !formData.manager || !formData.phone) return;
    if (isAdmin && !isEditing && !formData.password) {
      setErrorMessage("협력사와 함께 생성할 일반 사용자 로그인 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/partners", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...formData }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "save-failed");
      }

      await loadPartners();
      closeModal();
    } catch (error) {
      console.error(error);
      setErrorMessage("저장에 실패했습니다. 연락처 또는 파트너 코드가 중복인지 확인해주세요.");
    }
  };

  // 파트너 삭제 처리
  const handleDeletePartner = async (partner: Partner) => {
    if (!confirm(`'${partner.companyName}' 협력사를 삭제하시겠습니까?\n연결된 일반 사용자 계정도 함께 삭제됩니다.`)) return;
    setErrorMessage("");
    try {
      const response = await fetch(`/api/partners?id=${partner.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete-failed");
      await loadPartners();
    } catch (error) {
      console.error(error);
      setErrorMessage("삭제에 실패했습니다.");
    }
  };

  // 필터링된 파트너 목록
  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.companyName.includes(searchQuery) ||
      p.manager.includes(searchQuery) ||
      p.type.includes(searchQuery);
    const matchesFilter = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // 요약 통계
  const totalPartners = partners.length;
  const activePartners = partners.filter((p) => p.status === "active").length;
  const totalJobs = partners.reduce((sum, p) => sum + p.completedJobs, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans sm:bg-gray-100 sm:items-center sm:py-10">
      <main className="flex flex-col w-full max-w-md bg-white min-h-screen sm:min-h-full sm:rounded-3xl sm:overflow-hidden sm:shadow-2xl relative">

        {/* 헤더 */}
        <header className="flex items-center justify-between px-4 py-4 bg-slate-900 text-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Link href="/" className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-300">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center">
                <Users size={14} className="text-slate-900" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">협력사 포털</h1>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-yellow-400 text-slate-900 text-sm font-bold px-3 py-2 rounded-xl hover:bg-yellow-300 transition-colors shadow"
          >
            <Plus size={16} />
            업체(협력사) 등록
          </button>
        </header>

        <div className="flex-1 overflow-y-auto pb-24">
          {errorMessage && (
            <div className="mx-6 mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* 요약 카드 섹션 */}
          <div className="bg-slate-900 px-6 pb-6 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{totalPartners}</div>
                <div className="text-xs text-slate-400 mt-1">등록 파트너</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{activePartners}</div>
                <div className="text-xs text-slate-400 mt-1">활성 파트너</div>
              </div>
              <div className="bg-slate-800 rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{totalJobs}</div>
                <div className="text-xs text-slate-400 mt-1">총 완공</div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="px-6 py-4 space-y-3 border-b border-gray-100">
            {/* 검색창 */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="업체명, 담당자, 업종으로 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            {/* 상태 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(["all", "active", "pending", "inactive"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    filterStatus === status
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {status === "all" ? "전체" : STATUS_CONFIG[status].label}
                </button>
              ))}
            </div>
          </div>

          {/* 파트너 목록 */}
          <div className="px-6 py-4 space-y-3">
            <h2 className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
              <Filter size={12} />
              파트너 목록 ({filteredPartners.length})
            </h2>

            {isLoading ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Building2 size={32} className="mx-auto text-gray-300 mb-2 animate-pulse" />
                <p className="text-sm text-gray-400 font-medium">협력사 데이터를 불러오는 중입니다.</p>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Building2 size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400 font-medium">조건에 맞는 파트너가 없습니다.</p>
              </div>
            ) : (
              filteredPartners.map((partner) => {
                const typeColor = TYPE_COLOR[partner.type] ?? TYPE_COLOR.일반;
                const statusCfg = STATUS_CONFIG[partner.status] ?? STATUS_CONFIG.pending;
                return (
                  <div
                    key={partner.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                  >
                    {/* 카드 상단: 이름/업종/상태 */}
                    <div className="p-4 pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}>
                            {partner.type}
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center gap-1 text-yellow-400 mr-1">
                            {partner.rating > 0 ? (
                              <>
                                <Star size={13} fill="currentColor" />
                                <span className="text-xs font-bold text-gray-700">{partner.rating}.0</span>
                              </>
                            ) : (
                              <span className="text-xs text-gray-400">미평가</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => openEditModal(partner)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="수정"
                            aria-label={`${partner.companyName} 수정`}
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePartner(partner)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="삭제"
                            aria-label={`${partner.companyName} 삭제`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-bold text-gray-900 text-base">{partner.companyName}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">담당자: {partner.manager}</p>

                      {/* 지역 + 파트너 코드 배지 */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {partner.region && (
                          <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                            <MapPin size={11} />
                            {partner.region}
                          </span>
                        )}
                        {partner.partnerCode && (
                          <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full font-mono font-semibold">
                            <Hash size={11} />
                            {partner.partnerCode}
                          </span>
                        )}
                      </div>

                      {partner.memo && (
                        <p className="text-xs text-gray-400 mt-2 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                          💬 {partner.memo}
                        </p>
                      )}
                    </div>

                    {/* 카드 하단: 연락처 + 완공 수 */}
                    <div className="flex items-center justify-between border-t border-gray-50 px-4 py-3 bg-gray-50/50">
                      <div className="flex gap-3">
                        <a
                          href={`tel:${partner.phone}`}
                          className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                        >
                          <Phone size={12} />
                          {partner.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <Briefcase size={12} />
                        완공 {partner.completedJobs}건
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 파트너 등록/수정 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md max-h-[calc(100vh-2rem)] rounded-3xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 flex flex-col">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{isEditing ? "협력사 수정" : "협력사 등록"}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isEditing ? "기존 파트너 업체 정보를 수정합니다" : "새 파트너 업체를 등록합니다"}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-sm text-gray-500 font-semibold hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  취소
                </button>
              </div>

              {/* 모달 폼 */}
              <form onSubmit={handleSavePartner} className="p-6 space-y-5 flex-1">
                {/* 업체명 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">업체명 *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="예: 한성방수"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium"
                  />
                </div>

                {/* 업종 선택 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 ml-1">업종 *</label>
                  <div className="flex flex-wrap gap-2">
                    {PARTNER_TYPES.map((type) => {
                      const color = TYPE_COLOR[type];
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, type })}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                            formData.type === type
                              ? `${color.bg} ${color.text} ${color.border} shadow-sm`
                              : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 담당자 / 전화번호 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">담당자명 *</label>
                    <input
                      type="text"
                      required
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                      placeholder="홍길동"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">전화번호 *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="010-0000-0000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* 일반 사용자 로그인 비밀번호 */}
                {isAdmin && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">
                      일반 사용자 로그인 비밀번호 {isEditing ? "(변경 시 입력)" : "*"}
                    </label>
                    <input
                      type="password"
                      required={!isEditing}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder={isEditing ? "비워두면 기존 비밀번호 유지" : "협력사 로그인 비밀번호"}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    />
                    <p className="text-[11px] text-gray-400 mt-1 ml-1">
                      협력사 등록 시 같은 연락처의 일반 사용자 계정이 함께 생성됩니다.
                    </p>
                  </div>
                )}

                {/* 이메일 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">이메일</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="partner@example.com"
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* 지역 / 파트너 코드 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">담당 지역</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        placeholder="예: 서울 강남"
                        className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">파트너 코드</label>
                    <div className="relative">
                      <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        disabled={!isEditing}
                        value={formData.partnerCode}
                        onChange={(e) => setFormData({ ...formData, partnerCode: e.target.value.toUpperCase() })}
                        placeholder={isEditing ? "PTR-XX-000" : "자동 생성됨"}
                        className={`w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 transition-all text-sm font-mono tracking-wide ${
                          !isEditing ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* 상태 변경 (수정 시에만 표시) */}
                {isEditing && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">상태 (관리자 승인)</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as PartnerStatus })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm appearance-none bg-white"
                    >
                      <option value="pending">검토중</option>
                      <option value="active">활동중</option>
                      <option value="inactive">비활동</option>
                    </select>
                  </div>
                )}

                {/* 메모 */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">메모 (선택)</label>
                  <textarea
                    value={formData.memo}
                    onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                    placeholder="협력사에 대한 간단한 메모를 남겨주세요."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm resize-none"
                  />
                </div>

                {/* 등록/수정 버튼 */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-2xl py-4 shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isEditing ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                    {isEditing ? "협력사 정보 수정하기" : "협력사 등록하기"}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">
                    {isEditing ? "수정해도 기존 상태, 평점, 완공 건수는 유지됩니다." : "등록 후 &apos;검토중&apos; 상태로 저장됩니다."}
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
