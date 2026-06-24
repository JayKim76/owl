'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, DollarSign, Settings2, Plus, Trash2,
  Upload, Star, ChevronUp, ChevronDown, Loader2, Check,
  Eye, ToggleLeft, ToggleRight, Save, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

// ---- 타입 ----
interface FieldConfig {
  label: string;
  order: number;
  visible: boolean;
  required: boolean;
}
interface FieldMapping {
  [key: string]: FieldConfig;
}
interface EstimateTemplate {
  id: number;
  name: string;
  description: string | null;
  fileUrl: string | null;
  fieldMapping: FieldMapping | null;
  isDefault: boolean;
  createdAt: string;
}
interface CostSetting {
  id: number;
  key: string;
  label: string;
  value: number;
}

// 견적서 기본 필드 목록
const BASE_FIELDS: { key: string; label: string; group: string }[] = [
  { key: 'parking', label: '주차 가능 여부', group: '기본 정보' },
  { key: 'elevator', label: '엘리베이터 여부', group: '기본 정보' },
  { key: 'heatingTarget', label: '난방 방식', group: '기본 정보' },
  { key: 'floorLevel', label: '층 수', group: '기본 정보' },
  { key: 'leakLocation', label: '누수 위치', group: '기본 정보' },
  { key: 'leakAmount', label: '누수량', group: '기본 정보' },
  { key: 'urgency', label: '긴급도', group: '기본 정보' },
  { key: 'boilerBrand', label: '보일러 브랜드', group: '기본 정보' },
  { key: 'boilerError', label: '보일러 에러코드', group: '기본 정보' },
  { key: 'boilerPipeSize', label: '배관 구경', group: '기본 정보' },
  { key: 'waterBill', label: '수도요금', group: '기본 정보' },
  { key: 'managerCheck', label: '관리자 확인', group: '기본 정보' },
  { key: 'downstairsCheck', label: '아래층 확인', group: '기본 정보' },
  { key: 'damageAreas', label: '피해 위치', group: '피해 증상' },
  { key: 'timing', label: '발생 시점', group: '피해 증상' },
  { key: 'detectChecks', label: '탐지 수칙 체크', group: '탐지 수칙' },
  { key: 'detectionDetails', label: '탐지 결과 메모', group: '필요 공사' },
  { key: 'detectionFee', label: '탐지 기본료', group: '필요 공사' },
  { key: 'requiredWorks', label: '필요 공사 항목', group: '필요 공사' },
  { key: 'estimatedMinPrice', label: '최소 견적가', group: '필요 공사' },
  { key: 'estimatedMaxPrice', label: '최대 견적가', group: '필요 공사' },
];

function buildDefaultMapping(): FieldMapping {
  const mapping: FieldMapping = {};
  BASE_FIELDS.forEach((f, i) => {
    mapping[f.key] = { label: f.label, order: i, visible: true, required: false };
  });
  return mapping;
}

// ---- 탭 컴포넌트 ----
type TabId = 'templates' | 'costs' | 'system';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('templates');

  // ---- 양식 상태 ----
  const [templates, setTemplates] = useState<EstimateTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<EstimateTemplate | null>(null);
  const [editMapping, setEditMapping] = useState<FieldMapping>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- 단가 상태 ----
  const [costs, setCosts] = useState<CostSetting[]>([]);
  const [costsLoading, setCostsLoading] = useState(true);
  const [costsSaving, setCostsSaving] = useState(false);
  const [costsSaved, setCostsSaved] = useState(false);

  // ---- 다크모드 ----
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (activeTab === 'templates') loadTemplates();
    if (activeTab === 'costs') loadCosts();
  }, [activeTab]);

  async function loadTemplates() {
    setTemplatesLoading(true);
    try {
      const res = await fetch('/api/settings/templates');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadTemplates error:', err);
      setTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }

  async function loadCosts() {
    setCostsLoading(true);
    try {
      const res = await fetch('/api/settings/costs');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('loadCosts error:', err);
      setCosts([]);
    } finally {
      setCostsLoading(false);
    }
  }

  // 양식 선택
  function selectTemplate(t: EstimateTemplate) {
    setSelectedTemplate(t);
    setEditMapping(t.fieldMapping ? { ...t.fieldMapping } : buildDefaultMapping());
    setPreviewUrl(t.fileUrl);
    setShowAddForm(false);
  }

  // 파일 업로드
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/settings/upload', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.url) {
      setPreviewUrl(data.url);
      if (selectedTemplate) {
        setSelectedTemplate({ ...selectedTemplate, fileUrl: data.url });
      }
    }
    setUploadLoading(false);
  }

  // 새 양식 생성
  async function createTemplate() {
    if (!newTemplateName.trim()) return;
    const res = await fetch('/api/settings/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newTemplateName.trim(),
        description: newTemplateDesc.trim() || null,
        fileUrl: previewUrl,
        fieldMapping: buildDefaultMapping(),
      }),
    });
    const t = await res.json();
    setTemplates((prev) => [t, ...prev]);
    setSelectedTemplate(t);
    setEditMapping(buildDefaultMapping());
    setShowAddForm(false);
    setNewTemplateName('');
    setNewTemplateDesc('');
  }

  // 필드 매핑 저장
  async function saveMapping() {
    if (!selectedTemplate) return;
    setSaveLoading(true);
    await fetch(`/api/settings/templates/${selectedTemplate.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fieldMapping: editMapping, fileUrl: previewUrl }),
    });
    setSaveLoading(false);
    await loadTemplates();
  }

  // 기본 양식 설정
  async function setDefault(id: number) {
    await fetch(`/api/settings/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    });
    await loadTemplates();
  }

  // 양식 삭제
  async function deleteTemplate(id: number) {
    if (!confirm('이 양식을 삭제하시겠습니까?')) return;
    await fetch(`/api/settings/templates/${id}`, { method: 'DELETE' });
    if (selectedTemplate?.id === id) setSelectedTemplate(null);
    await loadTemplates();
  }

  // 필드 순서 이동
  function moveField(key: string, dir: 'up' | 'down') {
    const sorted = sortedFields();
    const idx = sorted.findIndex((f) => f.key === key);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === sorted.length - 1) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    const newMapping = { ...editMapping };
    const aOrder = newMapping[sorted[idx].key].order;
    const bOrder = newMapping[sorted[swapIdx].key].order;
    newMapping[sorted[idx].key] = { ...newMapping[sorted[idx].key], order: bOrder };
    newMapping[sorted[swapIdx].key] = { ...newMapping[sorted[swapIdx].key], order: aOrder };
    setEditMapping(newMapping);
  }

  function sortedFields() {
    return BASE_FIELDS
      .filter((f) => editMapping[f.key])
      .sort((a, b) => editMapping[a.key].order - editMapping[b.key].order);
  }

  // 단가 저장
  async function saveCosts() {
    setCostsSaving(true);
    await fetch('/api/settings/costs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(costs.map(({ key, value }) => ({ key, value }))),
    });
    setCostsSaving(false);
    setCostsSaved(true);
    setTimeout(() => setCostsSaved(false), 2000);
  }

  const toggleDark = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  // ---- 렌더 ----
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans sm:bg-gray-100 sm:items-center sm:py-10">
      <main className="flex flex-col w-full max-w-3xl bg-white min-h-screen sm:min-h-full sm:rounded-3xl sm:overflow-hidden sm:shadow-2xl">
        {/* 헤더 */}
        <header className="flex items-center gap-3 px-6 py-5 bg-blue-900 text-white shadow-md shrink-0">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-blue-800 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">설정</h1>
            <p className="text-xs text-blue-100">견적서 양식 · 단가 · 시스템</p>
          </div>
        </header>

        {/* 탭 */}
        <div className="flex border-b border-gray-200 bg-white shrink-0">
          {([
            { id: 'templates', icon: FileText, label: '견적서 양식' },
            { id: 'costs', icon: DollarSign, label: '단가 설정' },
            { id: 'system', icon: Settings2, label: '시스템' },
          ] as { id: TabId; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="flex-1 overflow-y-auto">
          {/* ===== 견적서 양식 탭 ===== */}
          {activeTab === 'templates' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">업로드한 양식을 기반으로 견적서 필드를 커스텀합니다.</p>
                <button
                  onClick={() => { setShowAddForm(true); setSelectedTemplate(null); setPreviewUrl(null); setEditMapping(buildDefaultMapping()); }}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus size={14} /> 새 양식
                </button>
              </div>

              {/* 새 양식 추가 폼 */}
              {showAddForm && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-blue-800">새 양식 추가</h3>
                  <input
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="양식 이름 *"
                    className="w-full border border-blue-300 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    value={newTemplateDesc}
                    onChange={(e) => setNewTemplateDesc(e.target.value)}
                    placeholder="설명 (선택)"
                    className="w-full border border-blue-300 text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={createTemplate}
                      disabled={!newTemplateName.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg"
                    >
                      만들기
                    </button>
                    <button onClick={() => setShowAddForm(false)} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-2">
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 양식 목록 */}
              {templatesLoading ? (
                <div className="text-center py-10 text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />불러오는 중...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <FileText size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">등록된 양식이 없습니다.</p>
                  <p className="text-xs mt-1">"새 양식" 버튼으로 추가해보세요.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => selectTemplate(t)}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedTemplate?.id === t.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} className={selectedTemplate?.id === t.id ? 'text-blue-600' : 'text-gray-400'} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">{t.name}</span>
                            {t.isDefault && (
                              <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">기본</span>
                            )}
                          </div>
                          {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {!t.isDefault && (
                          <button
                            onClick={() => setDefault(t.id)}
                            title="기본 양식으로 설정"
                            className="p-1.5 rounded-lg hover:bg-yellow-100 text-gray-400 hover:text-yellow-500 transition-colors"
                          >
                            <Star size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="p-1.5 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 선택된 양식 편집 */}
              {selectedTemplate && (
                <div className="border border-gray-200 rounded-2xl overflow-hidden mt-4">
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700">양식 편집: {selectedTemplate.name}</h3>
                    <button
                      onClick={saveMapping}
                      disabled={saveLoading}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {saveLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                      저장
                    </button>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* 파일 업로드 */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">양식 이미지 / PDF 업로드</p>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadLoading ? (
                          <Loader2 size={20} className="animate-spin mx-auto text-blue-500" />
                        ) : previewUrl ? (
                          <div className="space-y-2">
                            {previewUrl.endsWith('.pdf') ? (
                              <p className="text-xs text-blue-600 font-medium">PDF 파일 업로드됨</p>
                            ) : (
                              <img src={previewUrl} alt="양식 미리보기" className="max-h-32 mx-auto rounded-lg object-contain" />
                            )}
                            <p className="text-xs text-gray-400">클릭하여 교체</p>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <Upload size={20} className="mx-auto mb-1" />
                            <p className="text-xs">JPG, PNG, PDF (최대 10MB)</p>
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
                      </div>
                      {previewUrl && !previewUrl.endsWith('.pdf') && (
                        <div className="mt-2 flex justify-end">
                          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                            <Eye size={12} /> 원본 보기
                          </a>
                        </div>
                      )}
                    </div>

                    {/* 필드 설정 */}
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-2">필드 표시/순서 설정</p>
                      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                        {sortedFields().map((f, idx) => {
                          const cfg = editMapping[f.key];
                          return (
                            <div key={f.key} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                              <div className="flex flex-col gap-0.5">
                                <button
                                  onClick={() => moveField(f.key, 'up')}
                                  disabled={idx === 0}
                                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                  <ChevronUp size={12} />
                                </button>
                                <button
                                  onClick={() => moveField(f.key, 'down')}
                                  disabled={idx === sortedFields().length - 1}
                                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                >
                                  <ChevronDown size={12} />
                                </button>
                              </div>
                              <button
                                onClick={() => setEditMapping((prev) => ({ ...prev, [f.key]: { ...prev[f.key], visible: !prev[f.key].visible } }))}
                                className="shrink-0"
                              >
                                {cfg.visible
                                  ? <ToggleRight size={20} className="text-blue-500" />
                                  : <ToggleLeft size={20} className="text-gray-400" />}
                              </button>
                              <input
                                value={cfg.label}
                                onChange={(e) => setEditMapping((prev) => ({ ...prev, [f.key]: { ...prev[f.key], label: e.target.value } }))}
                                className={`flex-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 ${!cfg.visible ? 'opacity-40' : ''}`}
                              />
                              <span className="text-xs text-gray-400 shrink-0 w-14 text-right">{f.group}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===== 단가 설정 탭 ===== */}
          {activeTab === 'costs' && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">견적서 작성 시 사용되는 기본 단가를 설정합니다.</p>
                {costsSaved && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <Check size={14} /> 저장됨
                  </span>
                )}
              </div>

              {costsLoading ? (
                <div className="text-center py-10 text-gray-400"><Loader2 size={24} className="animate-spin mx-auto" /></div>
              ) : (
                <>
                  <div className="space-y-2">
                    {costs.map((c) => (
                      <div key={c.key} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                        <span className="flex-1 text-sm font-medium text-gray-700">{c.label}</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={c.value}
                            min={0}
                            step={10000}
                            onChange={(e) =>
                              setCosts((prev) =>
                                prev.map((item) => item.key === c.key ? { ...item, value: Number(e.target.value) } : item)
                              )
                            }
                            className="w-28 text-right border border-gray-300 text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <span className="text-xs text-gray-500">원</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={saveCosts}
                    disabled={costsSaving}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
                  >
                    {costsSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    단가 저장
                  </button>
                </>
              )}
            </div>
          )}

          {/* ===== 시스템 설정 탭 ===== */}
          {activeTab === 'system' && (
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-200">
                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">다크 모드</p>
                    <p className="text-xs text-gray-500 mt-0.5">화면 테마를 변경합니다.</p>
                  </div>
                  <button
                    onClick={toggleDark}
                    className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl px-4 py-4">
                <p className="text-xs font-semibold text-gray-600 mb-3">앱 정보</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between"><span>서비스명</span><span className="font-medium">부엉이누수탐지랩</span></div>
                  <div className="flex justify-between"><span>버전</span><span className="font-medium">v2.0</span></div>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 py-2"
              >
                <ArrowLeft size={14} />
                대시보드로 돌아가기
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
