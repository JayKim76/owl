// ============================================================
// notificationStore.ts
// 고객 데이터 + 협력사 알림 상태 공유 스토어 (localStorage 기반)
// ============================================================

export type JobType = "누수" | "방수" | "배관" | "도배" | "미장" | "전기" | "타일" | "목수" | "하수도고압세척" | "마루부분시공";

export type NotificationPhase = "phase1" | "phase2" | "assigned" | "unassigned";

export interface PartnerNotification {
  partnerId: string;
  companyName: string;
  phone: string;
  region: string;
  type: string;
  response: "pending" | "accepted" | "rejected";
  isRegionMatch: boolean; // 지역 매칭 여부
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  tenantPhone?: string;
  victimPhone?: string;
  region: string;         // 고객 주소/지역
  jobType: JobType;       // 필요 업종
  isUrgent: boolean;
  detail: string;         // 상세 내용
  registeredAt: string;   // ISO 날짜 문자열
  phase: NotificationPhase;
  assignedPartner?: string; // 수락한 업체명
  notifications: PartnerNotification[];
  phase1StartedAt?: number; // timestamp
}

const STORAGE_KEY = "owl_customers";

export function getCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomers(customers: Customer[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export function addCustomer(customer: Customer): void {
  const list = getCustomers();
  saveCustomers([customer, ...list]);
}

export function updateCustomer(updated: Customer): void {
  const list = getCustomers();
  saveCustomers(list.map((c) => (c.id === updated.id ? updated : c)));
}
