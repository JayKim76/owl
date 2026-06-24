"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";
import { ArrowLeft, Calculator, CheckCircle2, ChevronDown, ChevronUp, Settings, FileText, Upload } from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Kakao: any;
  }
}

interface FieldConfig { label: string; order: number; visible: boolean; required: boolean; }
interface EstimateTemplate {
  id: number; name: string; fileUrl: string | null;
  fieldMapping: Record<string, FieldConfig> | null; isDefault: boolean;
}

type CheckBoxProp = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

function Checkbox({ label, checked, onChange }: CheckBoxProp) {
  return (
    <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
      <input 
        type="checkbox" 
        className="hidden" 
        checked={checked} 
        onChange={onChange}
      />
      <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-2 border-gray-300'}`}>
        {checked && <CheckCircle2 size={14} className="text-white" />}
      </div>
      <span className={`text-sm select-none ${checked ? 'text-blue-900 font-medium' : 'text-gray-600'}`}>{label}</span>
    </label>
  );
}

// 🦉 기본 단가 초기값 상수 정의
const INITIAL_DEFAULT_COSTS: Record<string, number> = {
  "상수도 배관": 200000,
  "하수도 배관": 250000,
  "부분 철거": 150000,
  "미장/방통": 200000,
  "타일 마감": 300000,
  "마루/바닥 복구": 400000,
  "특수 방수": 500000
};

export default function EstimateChecklistPage() {
  // 1. 기본 정보
  const [basicInfo, setBasicInfo] = useState({
    heatingTarget: "개별난방",
    boilerBrand: "",
    boilerError: "",
    boilerPipeSize: "",
    waterBill: "",
    managerCheck: false,
    downstairsCheck: false,
    floorLevel: "",
    leakLocation: "",
    leakAmount: "",
    urgency: "",
  });

  // 2. 피해 증상
  const [damageAreas, setDamageAreas] = useState<string[]>([]);
  const [customDamageArea, setCustomDamageArea] = useState<string>("");
  const [timing, setTiming] = useState<string>("");

  // 🦉 단가 설정용 상태 관리 레이어 정의
  const [currentCosts, setCurrentCosts] = useState<Record<string, number>>(INITIAL_DEFAULT_COSTS);
  const [settingsCosts, setSettingsCosts] = useState<Record<string, number>>(INITIAL_DEFAULT_COSTS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 4. 필요 작업 내용 (이 부분으로 견적 계산 - 최신 수정 단가가 동적으로 풀링됨)
  const [requiredWorks, setRequiredWorks] = useState<string[]>([]);
  const workOptions = [
    { name: "상수도 배관", cost: currentCosts["상수도 배관"] ?? 200000 },
    { name: "하수도 배관", cost: currentCosts["하수도 배관"] ?? 250000 },
    { name: "부분 철거", cost: currentCosts["부분 철거"] ?? 150000 },
    { name: "미장/방통", cost: currentCosts["미장/방통"] ?? 200000 },
    { name: "타일 마감", cost: currentCosts["타일 마감"] ?? 300000 },
    { name: "마루/바닥 복구", cost: currentCosts["마루/바닥 복구"] ?? 400000 },
    { name: "특수 방수", cost: currentCosts["특수 방수"] ?? 500000 }
  ];

  const [customerPhone, setCustomerPhone] = useState("");
  const [detectionFee, setDetectionFee] = useState<string>("300000");
  const [detectionDetails, setDetectionDetails] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // 템플릿 상태
  const [activeTemplate, setActiveTemplate] = useState<EstimateTemplate | null>(null);
  const [showTemplateRef, setShowTemplateRef] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<'custom' | 'default'>('custom');

  // 🦉 견적 금액 자동 계산 (파생 상태)
  const minCost = parseInt(detectionFee) || 0;
  let addedCost = 0;
  requiredWorks.forEach(workName => {
    const cost = currentCosts[workName] ?? INITIAL_DEFAULT_COSTS[workName] ?? 0;
    addedCost += cost;
  });
  const totalCost = minCost + addedCost;
  const estimatedPrice = `${new Intl.NumberFormat('ko-KR').format(totalCost)}원`;

  // 활성 템플릿 로드
  useEffect(() => {
    fetch('/api/settings/templates')
      .then(r => r.json())
      .then((list: EstimateTemplate[]) => {
        const def = list.find(t => t.isDefault) || null;
        setActiveTemplate(def);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 🦉 로컬 스토리지에 기설정된 사용자 정의 기본 단가가 있다면 로드하여 연동
      const storedDefaults = localStorage.getItem("owl_default_costs");
      let activeDefaults = INITIAL_DEFAULT_COSTS;
      if (storedDefaults) {
        try {
          const parsed = JSON.parse(storedDefaults);
          if (parsed && typeof parsed === "object") {
            activeDefaults = { ...INITIAL_DEFAULT_COSTS, ...parsed };
          }
        } catch (e) {
          console.error("Failed to parse stored defaults:", e);
        }
      }
      setCurrentCosts(activeDefaults);
      setSettingsCosts(activeDefaults);

      const params = new URLSearchParams(window.location.search);
      const leakLocation = params.get("leakLocation");
      const urgency = params.get("urgency");
      const boilerBrand = params.get("boilerBrand");
      const boilerError = params.get("boilerError");
      const boilerPipeSize = params.get("boilerPipeSize");
      const heatingTarget = params.get("heatingTarget");
      const detectChecksParam = params.get("detectChecks");
      
      const newBasicInfo = { ...basicInfo };
      if (leakLocation) newBasicInfo.leakLocation = leakLocation === "ceiling" ? "천장 부위 누수 (AI 진단)" : leakLocation === "floor" ? "바닥 배관 누수 (AI 진단)" : leakLocation === "wall" ? "벽면 균열 누수 (AI 진단)" : leakLocation;
      if (urgency) newBasicInfo.urgency = urgency === "today" ? "당일 요망 (긴급)" : urgency === "scheduled" ? "일정 조율" : urgency;
      if (boilerBrand) newBasicInfo.boilerBrand = boilerBrand;
      if (boilerError) newBasicInfo.boilerError = boilerError;
      if (boilerPipeSize) newBasicInfo.boilerPipeSize = boilerPipeSize;
      if (heatingTarget) newBasicInfo.heatingTarget = heatingTarget;
      
      // Auto downstairs check if it is a ceiling leak
      if (leakLocation === "ceiling") {
        newBasicInfo.downstairsCheck = true;
        newBasicInfo.leakAmount = "지속적으로 뚝뚝 떨어짐";
      }

      setBasicInfo(newBasicInfo);

      // Pre-fill detect checklist
      if (detectChecksParam) {
        try {
          const parsed = JSON.parse(detectChecksParam);
          if (Array.isArray(parsed)) {
            if (parsed.includes("detectFee")) {
              setDetectionFee("350000"); // AI Premium detection fee
            }
          }
        } catch (e) {
          console.error("Failed to parse detectChecks query:", e);
        }
      }

      // Pre-select some typical required works based on leak type
      if (leakLocation === "ceiling") {
        setRequiredWorks(["특수 방수", "타일 마감"]);
        setDetectionDetails("AI 진단 분석 결과: 위층 욕실 배수구 및 바닥 방수층 하자가 강력히 의심됩니다. 1차 아랫층 피해 지점 청음 점검 권장.");
      } else if (leakLocation === "floor") {
        setRequiredWorks(["상수도 배관", "부분 철거", "미장/방통"]);
        setDetectionDetails("AI 진단 분석 결과: 바닥 난방/온수 배관 노후화로 인한 크랙 파열이 강력히 의심됩니다. 청음 및 가스 탐지 후 굴착 복구 공사 권장.");
      } else if (leakLocation === "wall") {
        setRequiredWorks(["특수 방수"]);
        setDetectionDetails("AI 진단 분석 결과: 건물 외벽 크랙 혹은 창틀 주변 코킹 마모 빗물 누입이 의심됩니다. 외부 코킹 재시공 및 보강 권장.");
      }
    }
  }, []);

  // Phone number formatting helper
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCustomerPhone(formatted);
  };

  const toggleArray = (arr: string[], val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (arr.includes(val)) setter(arr.filter(item => item !== val));
    else setter([...arr, val]);
  };

  // 템플릿 필드 헬퍼
  const fieldLabel = (key: string, fallback: string) =>
    activeTemplate?.fieldMapping?.[key]?.label ?? fallback;
  const fieldVisible = (key: string) =>
    activeTemplate?.fieldMapping ? (activeTemplate.fieldMapping[key]?.visible ?? true) : true;

  const calculateEstimate = () => {
    // 이미 estimatedPrice가 자동으로 계산되므로, 결과 영역으로 스크롤만 이동합니다.
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const shareViaKakao = async () => {
    if (!estimatedPrice) return;
    setIsSending(true);
    try {
      // 1. DB에 견적 데이터 저장 (고객 연락처 있을 때만)
      if (customerPhone) {
        const dbRes = await fetch("/api/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            basicInfo,
            damageAreas,
            customDamageArea,
            timing,
            detectChecks: [],
            customDetectItem: "",
            detectionDetails,
            detectionFee,
            requiredWorks,
            estimatedPrice,
            customerPhone: customerPhone.replace(/[^0-9]/g, "")
          })
        });
        const dbData = await dbRes.json();
        if (!dbData.success) {
          console.error("견적 DB 저장 실패:", dbData.error);
        }
      }

      // 2. 카카오 공유하기
      const Kakao = window.Kakao;
      if (!Kakao) {
        alert("카카오 SDK를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      if (!Kakao.isInitialized()) {
        const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
        if (!key) {
          alert(".env에 NEXT_PUBLIC_KAKAO_JS_KEY를 설정해주세요.");
          return;
        }
        Kakao.init(key);
      }

      const works = requiredWorks.join(", ") || "상세 점검 필요";
      const location = basicInfo.leakLocation || "현장 확인";
      const imageUrl = `${window.location.origin}/icon-192x192.png`;

      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: "[부엉이누수탐지랩] 견적 결과 안내",
          description: `📍 누수 위치: ${location}\n🔧 필요 작업: ${works}\n💰 예상 견적: ${estimatedPrice}\n\n문의사항은 담당자에게 연락 부탁드립니다.`,
          imageUrl,
          link: {
            mobileWebUrl: window.location.origin,
            webUrl: window.location.origin,
          },
        },
      });

      setSendSuccess(true);
    } catch (e) {
      console.error("카카오 공유 오류:", e);
      alert("카카오톡 공유 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans sm:bg-gray-100 sm:items-center sm:py-10">
      <main className="flex flex-col w-full max-w-md bg-white min-h-screen sm:min-h-full sm:rounded-3xl sm:shadow-2xl">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">현장 체크리스트 & 견적</h1>
        </header>

        {/* 양식 참고 배너 */}
        {activeTemplate && (
          <div className="px-5 pt-3 pb-1 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
              <FileText size={14} />
              적용 양식: {activeTemplate.name}
            </div>
            {activeTemplate.fileUrl && (
              <button
                onClick={() => setShowTemplateRef(!showTemplateRef)}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                {showTemplateRef ? <><ChevronUp size={12} /> 숨기기</> : <><ChevronDown size={12} /> 양식 보기</>}
              </button>
            )}
          </div>
        )}
        {showTemplateRef && activeTemplate?.fileUrl && (
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
            {activeTemplate.fileUrl.toLowerCase().endsWith('.pdf') ? (
              <a href={activeTemplate.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <FileText size={12} /> PDF 양식 열기
              </a>
            ) : (
              <img src={activeTemplate.fileUrl} alt="양식 참고" className="w-full max-h-64 object-contain rounded-xl border border-blue-200" />
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-6 pb-24 space-y-8">

          {/* Section 1: Basic Info */}
          <section className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h2 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-200 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              기본 정보 체크
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Checkbox label="건물 관리실 체크" checked={basicInfo.managerCheck} onChange={() => setBasicInfo({...basicInfo, managerCheck: !basicInfo.managerCheck})} />
              <Checkbox label="아랫집 확인 여부" checked={basicInfo.downstairsCheck} onChange={() => setBasicInfo({...basicInfo, downstairsCheck: !basicInfo.downstairsCheck})} />
            </div>
            <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden text-sm">
              <button 
                onClick={() => setBasicInfo({...basicInfo, heatingTarget: "개별난방"})}
                className={`flex-1 py-3 font-medium transition-colors ${basicInfo.heatingTarget === "개별난방" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >개별 난방</button>
              <button 
                onClick={() => setBasicInfo({...basicInfo, heatingTarget: "지역난방"})}
                className={`flex-1 py-3 font-medium border-l border-gray-200 transition-colors ${basicInfo.heatingTarget === "지역난방" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >지역 / 통합 난방</button>
            </div>
            
            {/* 추가된 디테일 기본 정보 */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {fieldVisible('floorLevel') && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 px-1">{fieldLabel('floorLevel', '층수')}</label>
                  <input type="text" placeholder="예: 5층" value={basicInfo.floorLevel} onChange={(e) => setBasicInfo({...basicInfo, floorLevel: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-800 font-medium" />
                </div>
              )}
              {fieldVisible('leakLocation') && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 px-1">{fieldLabel('leakLocation', '누수 위치 상세')}</label>
                  <input type="text" placeholder="예: 안방 화장실 천장" value={basicInfo.leakLocation} onChange={(e) => setBasicInfo({...basicInfo, leakLocation: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-800 font-medium" />
                </div>
              )}
              {fieldVisible('leakAmount') && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 px-1">{fieldLabel('leakAmount', '누수량')}</label>
                  <input type="text" placeholder="예: 뚝뚝 떨어짐" value={basicInfo.leakAmount} onChange={(e) => setBasicInfo({...basicInfo, leakAmount: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-800 font-medium" />
                </div>
              )}
              {fieldVisible('urgency') && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 px-1">{fieldLabel('urgency', '긴급도')}</label>
                  <input type="text" placeholder="예: 당일 요망" value={basicInfo.urgency} onChange={(e) => setBasicInfo({...basicInfo, urgency: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-800 font-medium" />
                </div>
              )}
              {fieldVisible('boilerBrand') && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 px-1">{fieldLabel('boilerBrand', '보일러 브랜드')}</label>
                  <input type="text" placeholder="예: 경동, 귀뚜라미" value={basicInfo.boilerBrand} onChange={(e) => setBasicInfo({...basicInfo, boilerBrand: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-800 font-medium" />
                </div>
              )}
              {fieldVisible('boilerError') && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 px-1">{fieldLabel('boilerError', '보일러 에러코드')}</label>
                  <input type="text" placeholder="예: E001, 15" value={basicInfo.boilerError} onChange={(e) => setBasicInfo({...basicInfo, boilerError: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-800 font-medium" />
                </div>
              )}
              {fieldVisible('boilerPipeSize') && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 px-1">{fieldLabel('boilerPipeSize', '직수 사이즈')}</label>
                  <input type="text" placeholder="예: 15A" value={basicInfo.boilerPipeSize} onChange={(e) => setBasicInfo({...basicInfo, boilerPipeSize: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-800 font-medium" />
                </div>
              )}
              {fieldVisible('waterBill') && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-600 px-1">{fieldLabel('waterBill', '수도 요금')}</label>
                  <input type="text" placeholder="예: 10만원 (평형대비 과다)" value={basicInfo.waterBill} onChange={(e) => setBasicInfo({...basicInfo, waterBill: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-800 font-medium" />
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Symptoms */}
          <section>
            <h2 className="text-sm font-bold text-gray-800 mb-3 block">누수 피해 장소 (다중 선택)</h2>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {["화장실", "주방", "바닥", "거실", "아래층", "그 외"].map((area) => (
                <Checkbox 
                  key={area} 
                  label={area} 
                  checked={damageAreas.includes(area)} 
                  onChange={() => toggleArray(damageAreas, area, setDamageAreas)} 
                />
              ))}
            </div>
            <div className="mb-6">
              <input 
                type="text" 
                placeholder="현장 상황 직접 입력 (예: 발코니 배관 쪽, 안방 장롱 뒤)" 
                value={customDamageArea} 
                onChange={(e) => setCustomDamageArea(e.target.value)} 
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-700"
              />
            </div>

            <h2 className="text-sm font-bold text-gray-800 mb-3 block">누수 발생 시점</h2>
            <div className="grid grid-cols-1 gap-2">
              {["계속 물이 떨어진다", "비오거나 눈올 때만", "특정 물 사용할 때만"].map((time) => (
                <button
                  key={time}
                  onClick={() => setTiming(time)}
                  className={`p-3 text-left text-sm rounded-xl border transition-all ${
                    timing === time 
                      ? "bg-indigo-50 border-indigo-400 text-indigo-700 font-bold" 
                      : "bg-white border-gray-200 text-gray-600 hover:border-indigo-200"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </section>

          {/* Section 4: Required Works (Cost impact) */}
          <section>
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-800 mb-2 block">탐지 내용 요약</h2>
              <textarea 
                placeholder="예: 안방 화장실 천장 배관 미세 누수 확인 (원인 상세)" 
                value={detectionDetails}
                onChange={(e) => setDetectionDetails(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-gray-700 resize-none"
                rows={3}
              />
            </div>

            <div className="mb-8">
              <h2 className="text-sm font-bold text-gray-800 mb-2 block">기본 탐지비 입력</h2>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={detectionFee === "" ? "" : new Intl.NumberFormat('ko-KR').format(parseInt(detectionFee))}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setDetectionFee(val);
                  }} 
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-bold text-right text-blue-900"
                />
                <span className="text-gray-600 font-bold">원</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-sm font-bold text-gray-800">필요 작업 내용 판정</h2>
              <button 
                type="button"
                onClick={() => {
                  const storedDefaults = localStorage.getItem("owl_default_costs");
                  let activeDefaults = INITIAL_DEFAULT_COSTS;
                  if (storedDefaults) {
                    try {
                      const parsed = JSON.parse(storedDefaults);
                      if (parsed && typeof parsed === "object") {
                        activeDefaults = { ...INITIAL_DEFAULT_COSTS, ...parsed };
                      }
                    } catch (e) {}
                  }
                  setSettingsCosts(activeDefaults);
                  setIsSettingsOpen(true);
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg shadow-sm"
              >
                <Settings size={12} className="animate-spin-slow" />
                기본 단가 설정
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">* 선택된 항목을 바탕으로 예상 견적이 합산됩니다. 단가 입력 필드에서 즉시 수정 가능합니다.</p>
            <div className="flex flex-col gap-2">
              {workOptions.map((work) => {
                const isSelected = requiredWorks.includes(work.name);

                return (
                  <div
                    key={work.name}
                    className={`flex items-center justify-between gap-3 p-4 bg-white border rounded-xl transition-all ${
                      isSelected ? "border-blue-500 bg-blue-50/40 shadow-sm" : "border-gray-200 hover:border-blue-400"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleArray(requiredWorks, work.name, setRequiredWorks)}
                      aria-pressed={isSelected}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99] transition-transform"
                    >
                      <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-2 border-gray-300'}`}>
                        {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </span>
                      <span className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{work.name}</span>
                    </button>

                    {/* 🦉 단가 입력은 선택 버튼과 분리하여, 금액 수정 중에도 선택 상태가 꼬이지 않도록 처리 */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <input 
                        type="text" 
                        aria-label={`${work.name} 단가`}
                        value={currentCosts[work.name] === undefined ? "" : new Intl.NumberFormat('ko-KR').format(currentCosts[work.name])}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                          setCurrentCosts(prev => ({ ...prev, [work.name]: val }));
                        }}
                        className="w-24 px-2 py-1 text-right text-xs font-bold bg-gray-50 border border-gray-200 rounded-lg text-blue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                        placeholder="0"
                      />
                      <span className="text-xs font-semibold text-gray-400">원</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <button
            onClick={calculateEstimate}
            className="w-full py-4 mt-6 bg-blue-900 text-white font-bold rounded-2xl flex items-center justify-center gap-2 active:bg-blue-950 transition-colors shadow-lg hover:shadow-xl"
          >
            <Calculator size={20} />
            상세 견적 계산하기
          </button>

          {/* Estimate Result */}
          {estimatedPrice && (
            <section className="pt-6 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border border-yellow-200 text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Calculator size={80} />
                </div>
                <h3 className="text-sm font-bold text-yellow-800 mb-2">총 예상 누수공사 견적</h3>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{estimatedPrice}</p>
                <div className="bg-white/60 p-3 rounded-xl mt-4 text-left">
                  <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                    * 기본 탐지비 {new Intl.NumberFormat('ko-KR').format(parseInt(detectionFee) || 0)}원에 필요 작업({requiredWorks.length}건) 비용이 합산된 예상 금액입니다.<br/>
                    * 현장의 실제 상황이나 마감재 종류에 따라 비용이 추가될 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 카카오톡 공유 */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800">견적 결과 카카오톡 공유</h2>
                  {!sendSuccess && (
                    <span className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full font-bold border border-yellow-200">무료 공유</span>
                  )}
                </div>

                {/* Message Preview */}
                {!sendSuccess && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm text-xs text-gray-600 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
                    <p className="font-bold text-gray-800">[부엉이누수탐지랩] 견적 결과 안내</p>
                    <div className="space-y-1 py-1">
                      <p>📍 누수 위치: <span className="text-blue-600 font-medium">{basicInfo.leakLocation || "현장 확인"}</span></p>
                      <p>🔧 필요 작업: <span className="font-medium text-gray-800">{requiredWorks.join(", ") || "상세 점검 필요"}</span></p>
                      <p>💰 예상 견적: <span className="font-bold text-gray-900">{estimatedPrice}</span></p>
                    </div>
                    <p>문의사항은 담당자에게 연락 부탁드립니다.</p>
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <FileText size={18} />
                    문서 형태로 견적서 미리보기
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="고객 연락처 (기록용, 선택)"
                    value={customerPhone}
                    onChange={handlePhoneChange}
                    maxLength={13}
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm transition-all text-gray-800 font-medium"
                  />
                  <button
                    onClick={shareViaKakao}
                    disabled={isSending || sendSuccess}
                    className="bg-[#FFE812] hover:bg-[#F4DC00] disabled:bg-gray-100 disabled:text-gray-400 text-slate-800 px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all min-w-[84px] shadow-sm active:scale-95 text-sm"
                  >
                    {isSending ? (
                      <span className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></span>
                    ) : sendSuccess ? (
                      <CheckCircle2 size={22} className="text-green-600" />
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.6 5.1 4 6.6l-.8 3.2 3.6-2.4c1 .2 2 .4 3.2.4 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
                        </svg>
                        공유
                      </>
                    )}
                  </button>
                </div>
                {sendSuccess && (
                  <p className="text-sm text-yellow-800 font-bold flex items-center gap-2 mt-3 bg-yellow-50 p-3 rounded-xl border border-yellow-200">
                    <CheckCircle2 size={18} className="text-green-600" /> 카카오톡 공유 화면이 열렸습니다. 고객에게 메시지를 전송해주세요.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* 🦉 기본 단가 설정 편집용 유리 블러(Glassmorphism) 오버레이 모달 */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes spin-slow {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .animate-spin-slow {
                animation: spin-slow 8s linear infinite;
              }
            ` }} />
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings size={18} className="text-yellow-400 animate-spin-slow" />
                  <h3 className="font-bold text-sm">기본 설정 단가 편집</h3>
                </div>
                <span className="text-[10px] font-bold bg-blue-800 text-blue-200 px-2 py-0.5 rounded-full">영구 저장</span>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-left">
                <p className="text-xs text-gray-500 leading-relaxed mb-1">
                  * 이곳에서 수정한 금액은 브라우저에 **기본값**으로 영구 보존되어, 향후 새 견적을 작성할 때 항상 기본값으로 나타납니다.
                </p>
                {Object.keys(INITIAL_DEFAULT_COSTS).map((workName) => (
                  <div key={workName} className="flex flex-col gap-1.5 bg-gray-50 p-3 rounded-2xl border border-gray-100 hover:border-blue-100 transition-all">
                    <label className="text-[11px] font-bold text-gray-600 px-1">{workName}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={settingsCosts[workName] === undefined ? "" : new Intl.NumberFormat('ko-KR').format(settingsCosts[workName])}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0;
                          setSettingsCosts(prev => ({ ...prev, [workName]: val }));
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-right text-indigo-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                      />
                      <span className="text-xs font-bold text-gray-500">원</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-500 hover:bg-gray-100 rounded-xl text-xs font-bold text-center transition-colors"
                >
                  취소
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem("owl_default_costs", JSON.stringify(settingsCosts));
                    setCurrentCosts(settingsCosts);
                    setIsSettingsOpen(false);
                    if (typeof window !== "undefined") {
                      alert("기본 단가 설정이 안전하게 영구 저장되었습니다.");
                    }
                  }}
                  className="flex-1 py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-md shadow-blue-900/20"
                >
                  저장 및 동기화
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🦉 견적서 문서 형태 미리보기 모달 */}
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                <div className="flex items-center gap-2 text-gray-800 font-bold">
                  <FileText size={20} className="text-blue-600" />
                  견적서 미리보기
                </div>
                <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  ✕
                </button>
              </div>

              {/* 탭 선택기 */}
              <div className="flex border-b border-gray-100 bg-gray-50">
                <button
                  onClick={() => setPreviewTab('custom')}
                  className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    previewTab === 'custom'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Upload size={14} />
                  {activeTemplate?.fileUrl ? '내 양식' : '나만의 양식 없음'}
                </button>
                <button
                  onClick={() => setPreviewTab('default')}
                  className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    previewTab === 'default'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <FileText size={14} />
                  기본 양식
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-100">

                {/* ===== 내 양식 탭 ===== */}
                {previewTab === 'custom' && (
                  activeTemplate?.fileUrl ? (
                    <div className="relative bg-white mx-auto shadow-sm border border-gray-200 rounded overflow-hidden">
                      {/* 업로드된 이미지 양식 */}
                      {activeTemplate.fileUrl.toLowerCase().endsWith('.pdf') ? (
                        <div className="p-8 text-center">
                          <FileText size={48} className="mx-auto text-blue-400 mb-3" />
                          <p className="text-sm font-bold text-gray-700 mb-1">업로드된 PDF 양식</p>
                          <p className="text-xs text-gray-500 mb-4">PDF 양식 위에 데이터를 오버레이하여 표시합니다.</p>
                          {/* PDF 입력 데이터 요약 표 */}
                          <div className="text-left text-sm space-y-2 border border-gray-200 rounded-xl p-4 bg-gray-50">
                            <p><span className="font-bold text-gray-600">&#128205; 누수 위치:</span> {basicInfo.leakLocation || '-'}</p>
                            <p><span className="font-bold text-gray-600">&#128273; 필요 작업:</span> {requiredWorks.join(', ') || '없음'}</p>
                            <p><span className="font-bold text-gray-600">&#128176; 총 예상 견적:</span> <span className="text-blue-700 font-black text-lg">{estimatedPrice}</span></p>
                            <p><span className="font-bold text-gray-600">&#128203; 탐지 내용:</span> {detectionDetails || '-'}</p>
                          </div>
                          <a href={activeTemplate.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-xs text-blue-600 hover:underline">
                            <FileText size={12} /> PDF 양식 열기
                          </a>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* 이미지 양식 배경 */}
                          <img
                            src={activeTemplate.fileUrl}
                            alt="견적서 양식"
                            className="w-full block"
                          />
                          {/* 데이터 오버레이 커드 */}
                          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl p-4 sm:p-5 space-y-2">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">입력 데이터</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                                <div>
                                  <span className="text-gray-500 font-medium">작성일</span>
                                  <p className="font-bold text-gray-800">{new Date().toLocaleDateString('ko-KR')}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">고객연락처</span>
                                  <p className="font-bold text-gray-800">{customerPhone || '미지정'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">누수 위치</span>
                                  <p className="font-bold text-gray-800">{basicInfo.leakLocation || '-'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 font-medium">긴급도</span>
                                  <p className="font-bold text-gray-800">{basicInfo.urgency || '-'}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-500 font-medium">필요 작업</span>
                                  <p className="font-bold text-gray-800">{requiredWorks.join(', ') || '없음'}</p>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-gray-500 font-medium">탐지 내용</span>
                                  <p className="font-bold text-gray-800 text-[11px] leading-relaxed">{detectionDetails || '-'}</p>
                                </div>
                              </div>
                              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-600">총 예상 견적 (VAT 별도)</span>
                                <span className="text-xl font-black text-blue-700">{estimatedPrice}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* 업로드된 양식 없음 안내 */
                    <div className="bg-white mx-auto rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <Upload size={28} className="text-blue-400" />
                      </div>
                      <p className="font-bold text-gray-700">등록된 나만의 양식이 없습니다</p>
                      <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                        설정 &gt; 견적 양식에서 나만의 양식 이미지를 업로드하고<br/>
                        기본값으로 설정하면 이곣에 표시됩니다.
                      </p>
                      <a href="/settings" className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md">
                        양식 업로드 하러가기 →
                      </a>
                    </div>
                  )
                )}

                {/* ===== 기본 양식 탭 ===== */}
                {previewTab === 'default' && (
                  <div className="bg-white mx-auto shadow-sm border border-gray-200 p-8 sm:p-10 rounded text-gray-800 text-sm font-sans relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                      <span className="text-8xl font-black tracking-tighter">OWL LAB</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-center mb-8 tracking-tighter text-slate-900 border-b-2 border-slate-900 pb-4">
                      누수 탐지 및 공사 견적서
                    </h1>
                    <div className="flex justify-between items-end mb-6 text-xs text-gray-500 font-medium">
                      <div>
                        <p>작성일: {new Date().toLocaleDateString('ko-KR')}</p>
                        <p>고객 연락처: {customerPhone || "미지정"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-700">부엉이 누수탐지 랩</p>
                        <p>사업자등록번호: 123-45-67890</p>
                      </div>
                    </div>
                    <div className="mb-6 rounded border border-gray-300 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <tbody>
                          {fieldVisible('leakLocation') && (
                            <tr className="border-b border-gray-200">
                              <th className="bg-gray-50 py-3 px-4 font-bold text-gray-700 w-1/3 border-r border-gray-200">{fieldLabel('leakLocation', '현장 및 누수 위치')}</th>
                              <td className="py-3 px-4 font-medium text-gray-900">{basicInfo.leakLocation || "-"}</td>
                            </tr>
                          )}
                          {fieldVisible('leakAmount') && (
                            <tr className="border-b border-gray-200">
                              <th className="bg-gray-50 py-3 px-4 font-bold text-gray-700 border-r border-gray-200">{fieldLabel('leakAmount', '누수 상태')}</th>
                              <td className="py-3 px-4 font-medium text-gray-900">{basicInfo.leakAmount || "-"}</td>
                            </tr>
                          )}
                          <tr className="border-b border-gray-200">
                            <th className="bg-gray-50 py-3 px-4 font-bold text-gray-700 border-r border-gray-200">피해 장소</th>
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {[...damageAreas, customDamageArea].filter(Boolean).join(", ") || "-"}
                            </td>
                          </tr>
                          <tr>
                            <th className="bg-gray-50 py-3 px-4 font-bold text-gray-700 border-r border-gray-200">탐지 내용 요약</th>
                            <td className="py-3 px-4 font-medium text-gray-900 whitespace-pre-wrap">{detectionDetails || "상세 점검 필요"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <h2 className="font-bold text-slate-800 mb-2 border-l-4 border-blue-600 pl-2">상세 내역</h2>
                    <div className="mb-8 rounded border border-gray-300 overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-100 border-b border-gray-300">
                            <th className="py-2.5 px-4 font-bold text-slate-700 border-r border-gray-200">구분</th>
                            <th className="py-2.5 px-4 font-bold text-slate-700 text-right">예상 금액</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-3 px-4 text-gray-800 border-r border-gray-200">기본 누수 탐지비</td>
                            <td className="py-3 px-4 font-medium text-right text-gray-900">{new Intl.NumberFormat('ko-KR').format(parseInt(detectionFee) || 0)}원</td>
                          </tr>
                          {requiredWorks.map(work => (
                            <tr key={work} className="border-b border-gray-200">
                              <td className="py-3 px-4 text-gray-800 border-r border-gray-200">{work}</td>
                              <td className="py-3 px-4 font-medium text-right text-gray-900">{new Intl.NumberFormat('ko-KR').format(currentCosts[work] || 0)}원</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-blue-50/50">
                            <th className="py-4 px-4 font-black text-blue-900 border-r border-gray-200">총 예상 견적 (VAT 별도)</th>
                            <td className="py-4 px-4 font-black text-right text-blue-900 text-lg">{estimatedPrice}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-4">
                      * 위 금액은 1차 탐지 및 육안/청음 진단에 따른 <strong className="text-gray-700">예상 견적</strong>이며, 굴착 등 실제 시공 시 내부 배관 상태나 구조적 문제에 따라 금액이 변동될 수 있습니다.<br/>
                      * 부가가치세(VAT)는 별도입니다.<br/>
                      * 시공 완료 후 1년간 무상 하자보수(A/S)를 보장합니다.
                    </p>
                  </div>
                )}

              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3 bg-white rounded-b-2xl">
                <button onClick={() => setIsPreviewOpen(false)} className="flex-1 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  닫기
                </button>
                <button className="flex-1 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-600/20 flex items-center justify-center gap-2">
                  <FileText size={18} />
                  PDF로 저장 (준비중)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 카카오 공유하기 SDK */}
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
          if (window.Kakao && key && !window.Kakao.isInitialized()) {
            window.Kakao.init(key);
          }
        }}
      />
    </div>
  );
}
