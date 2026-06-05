"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

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

export default function DetectChecklistPage() {
  const [detectChecks, setDetectChecks] = useState<string[]>([]);
  const detectOptions = [
    "1) 계량기 별침 확인", "2) 변기,정수기 밸브 잠금", "3) 계량기 별침 체크", 
    "4) 보일러 직수 off", "6) 보일러 온수배관 탐지", "7) 보일러 난방배관 탐지",
    "9) 보일러 직수배관 탐지", "10) 유가, 바닥 줄눈 확인", "11) 방수 확인",
    "12) 하수도 역류 확인", "13) 샷시 실리콘 확인", "14) 건물 크랙 확인", 
    "15) 옥상 방수 확인", "16) 아랫층 천장 확인"
  ];
  const [customDetectItem, setCustomDetectItem] = useState<string>("");

  const toggleArray = (arr: string[], val: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (arr.includes(val)) setter(arr.filter(item => item !== val));
    else setter([...arr, val]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans sm:bg-gray-100 sm:items-center sm:py-10">
      <main className="flex flex-col w-full max-w-md bg-white min-h-screen sm:min-h-full sm:rounded-3xl sm:shadow-2xl">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">탐지절차 체크리스트</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 pb-24 space-y-8">
          <section className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 grid grid-cols-1 gap-2">
              <h2 className="text-sm font-bold text-slate-800 mb-2">현장 탐지 항목</h2>
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
          </section>
        </div>
      </main>
    </div>
  );
}
