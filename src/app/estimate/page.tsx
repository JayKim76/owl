"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Send, CheckCircle2, CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react";

type CheckBoxProp = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

function Checkbox({ label, checked, onChange }: CheckBoxProp) {
  return (
    <label className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-blue-300 transition-colors">
      <div className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-2 border-gray-300'}`}>
        {checked && <CheckCircle2 size={14} className="text-white" />}
      </div>
      <span className={`text-sm select-none ${checked ? 'text-blue-900 font-medium' : 'text-gray-600'}`}>{label}</span>
    </label>
  );
}

export default function EstimateChecklistPage() {
  // 1. 기본 정보
  const [basicInfo, setBasicInfo] = useState({
    parking: false,
    elevator: false,
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

  // 3. 탐지 수칙
  const [detectChecks, setDetectChecks] = useState<string[]>([]);
  const detectOptions = [
    "1) 계량기 별침 확인", "2) 변기,정수기 밸브 잠금", "3) 계량기 별침 체크", 
    "4) 보일러 직수 off", "6) 보일러 온수배관 탐지", "7) 보일러 난방배관 탐지",
    "9) 보일러 직수배관 탐지", "10) 유가, 바닥 줄눈 확인", "11) 방수 확인",
    "12) 하수도 역류 확인", "13) 샷시 실리콘 확인", "14) 건물 크랙 확인", 
    "15) 옥상 방수 확인", "16) 아랫층 천장 확인"
  ];
  const [isDetectOpen, setIsDetectOpen] = useState(false);
  const [customDetectItem, setCustomDetectItem] = useState<string>("");

  // 4. 필요 작업 내용 (이 부분으로 견적 계산)
  const [requiredWorks, setRequiredWorks] = useState<string[]>([]);
  const workOptions = [
    { name: "상수도 배관", cost: 200000 },
    { name: "하수도 배관", cost: 250000 },
    { name: "부분 철거", cost: 150000 },
    { name: "미장/방통", cost: 200000 },
    { name: "타일 마감", cost: 300000 },
    { name: "마루/바닥 복구", cost: 400000 },
    { name: "특수 방수", cost: 500000 }
  ];

  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [detectionFee, setDetectionFee] = useState<string>("300000");
  const [detectionDetails, setDetectionDetails] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const toggleArray = (arr: string[], val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (arr.includes(val)) setter(arr.filter(item => item !== val));
    else setter([...arr, val]);
  };

  const calculateEstimate = () => {
    let minCost = parseInt(detectionFee) || 0; // 기본 출장 및 탐지 비용
    let addedCost = 0;

    requiredWorks.forEach(workName => {
      const option = workOptions.find(o => o.name === workName);
      if (option) addedCost += option.cost;
    });

    const totalMin = minCost + addedCost;
    const totalMax = totalMin + (totalMin * 0.2); // +20% for max range
    
    setEstimatedPrice(
      `${new Intl.NumberFormat('ko-KR').format(totalMin)}원 ~ ${new Intl.NumberFormat('ko-KR').format(totalMax)}원`
    );
    
    // Auto scroll to bottom
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const sendAlimtalk = async () => {
    if (!customerPhone || !estimatedPrice) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/kakao/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: customerPhone,
          templateId: "TPL_ESTIMATE_002",
          templateParams: {
            estimate: estimatedPrice,
            works: requiredWorks.join(", ") || "세부 점검 필요",
            damage: [...damageAreas, ...(customDamageArea ? [customDamageArea] : [])].join(", ") || "미지정"
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSendSuccess(true);
      }
    } catch (e) {
      alert("전송 에러가 발생했습니다.");
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

        <div className="flex-1 overflow-y-auto px-5 py-6 pb-24 space-y-8">
          
          {/* Section 1: Basic Info */}
          <section className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <h2 className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="bg-blue-200 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              기본 정보 체크
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Checkbox label="주차 가능 여부" checked={basicInfo.parking} onChange={() => setBasicInfo({...basicInfo, parking: !basicInfo.parking})} />
              <Checkbox label="엘리베이터 유무" checked={basicInfo.elevator} onChange={() => setBasicInfo({...basicInfo, elevator: !basicInfo.elevator})} />
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
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 px-1">층수</label>
                <input type="text" placeholder="예: 5층" value={basicInfo.floorLevel} onChange={(e) => setBasicInfo({...basicInfo, floorLevel: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 px-1">누수 위치 상세</label>
                <input type="text" placeholder="예: 안방 화장실 천장" value={basicInfo.leakLocation} onChange={(e) => setBasicInfo({...basicInfo, leakLocation: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 px-1">누수량</label>
                <input type="text" placeholder="예: 뚝뚝 떨어짐" value={basicInfo.leakAmount} onChange={(e) => setBasicInfo({...basicInfo, leakAmount: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 px-1">긴급도</label>
                <input type="text" placeholder="예: 당일 요망" value={basicInfo.urgency} onChange={(e) => setBasicInfo({...basicInfo, urgency: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 px-1">보일러 브랜드</label>
                <input type="text" placeholder="예: 경동, 귀뚜라미" value={basicInfo.boilerBrand} onChange={(e) => setBasicInfo({...basicInfo, boilerBrand: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 px-1">보일러 에러코드</label>
                <input type="text" placeholder="예: E001, 15" value={basicInfo.boilerError} onChange={(e) => setBasicInfo({...basicInfo, boilerError: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 px-1">직수 사이즈</label>
                <input type="text" placeholder="예: 15A" value={basicInfo.boilerPipeSize} onChange={(e) => setBasicInfo({...basicInfo, boilerPipeSize: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-600 px-1">수도 요금</label>
                <input type="text" placeholder="예: 10만원 (평형대비 과다)" value={basicInfo.waterBill} onChange={(e) => setBasicInfo({...basicInfo, waterBill: e.target.value})} className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all" />
              </div>
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

          {/* Section 3: Detailed Checklist */}
          <section className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setIsDetectOpen(!isDetectOpen)}
              className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <h2 className="text-sm font-bold text-slate-800">탐지 절차 체크리스트 ({detectChecks.length}/{detectOptions.length})</h2>
              {isDetectOpen ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
            </button>
            
            {isDetectOpen && (
              <div className="p-4 grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {detectOptions.map((opt) => (
                   <Checkbox 
                   key={opt} label={opt} 
                   checked={detectChecks.includes(opt)} 
                   onChange={() => toggleArray(detectChecks, opt, setDetectChecks)} 
                 />
                ))}
                
                <div className="pt-2 mt-1 border-t border-slate-200">
                  <input 
                    type="text" 
                    placeholder="기타 탐지 항목이나 특이사항 직접 입력" 
                    value={customDetectItem} 
                    onChange={(e) => setCustomDetectItem(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all text-slate-700"
                  />
                </div>
              </div>
            )}
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

            <h2 className="text-sm font-bold text-gray-800 mb-1 block">필요 작업 내용 판정</h2>
            <p className="text-xs text-gray-500 mb-4">* 선택된 항목을 바탕으로 예상 견적이 합산됩니다.</p>
            <div className="flex flex-col gap-2">
              {workOptions.map((work) => (
                <label key={work.name} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${requiredWorks.includes(work.name) ? 'bg-blue-600 border-blue-600' : 'border-2 border-gray-300'}`}>
                      {requiredWorks.includes(work.name) && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                    <span className={`text-sm font-medium ${requiredWorks.includes(work.name) ? 'text-gray-900' : 'text-gray-600'}`}>{work.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">+{new Intl.NumberFormat('ko-KR').format(work.cost)}원</span>
                  <input type="checkbox" className="hidden" checked={requiredWorks.includes(work.name)} onChange={() => toggleArray(requiredWorks, work.name, setRequiredWorks)} />
                </label>
              ))}
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
                    * 기본 탐지비 {new Intl.NumberFormat('ko-KR').format(parseInt(detectionFee) || 0)}원에 필요 작업({requiredWorks.length}건) 비용이 합산된 대략적인 금액입니다.<br/>
                    * 현장의 실제 상황이나 마감재 종류에 따라 비용이 추가될 수 있습니다.
                  </p>
                </div>
              </div>

              {/* Send Alimtalk */}
              <div className="mt-8 space-y-3">
                <h2 className="text-sm font-bold text-gray-800">결과 알림톡 고객 발송</h2>
                <div className="flex gap-2">
                  <input 
                    type="tel"
                    placeholder="고객 연락처 (예: 01012345678)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                  <button
                    onClick={sendAlimtalk}
                    disabled={!customerPhone || isSending || sendSuccess}
                    className="bg-[#FFE812] hover:bg-[#F4DC00] disabled:bg-gray-200 text-slate-800 px-5 rounded-xl font-bold flex items-center justify-center transition-colors min-w-[80px] shadow-sm"
                  >
                    {isSending ? (
                      <span className="w-5 h-5 border-2 border-slate-400 border-t-slate-800 rounded-full animate-spin"></span>
                    ) : sendSuccess ? (
                      <CheckCircle2 size={24} className="text-green-600" />
                    ) : (
                      <span className="flex items-center gap-1">발송</span>
                    )}
                  </button>
                </div>
                {sendSuccess && (
                  <p className="text-sm text-green-700 font-bold flex items-center gap-2 mt-3 bg-green-50 p-3 rounded-xl border border-green-200">
                    <CheckCircle2 size={18} /> 고객님께 알림톡이 발송되었습니다.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
