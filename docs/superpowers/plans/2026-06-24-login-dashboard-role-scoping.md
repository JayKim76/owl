# 로그인 통합 + 대시보드 권한별 분기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/login`을 단일 라디오버튼 모드 선택(일반 사용자/관리자) 폼으로 통합하고, `/dashboard`가 로그인한 역할에 따라 전체 데이터(관리자) 또는 본인 등록 자료만(일반 사용자) 보여주도록 분기한다.

**Architecture:** 기존 두 인증 API(`/api/auth/unified-login`, `/api/auth/login`)는 변경하지 않고 클라이언트 컴포넌트(`LoginForm`)가 라디오 선택에 따라 같은 카드 안에서 폼 action/필드만 바꾼다. `/api/customers`, `/api/partners`에 중복된 세션 판별 로직을 `src/lib/session.ts`로 추출하고, `/dashboard`도 같은 헬퍼로 역할을 읽어 Prisma 쿼리에 소유권 필터를 머지한다.

**Tech Stack:** Next.js 16 (App Router, Server/Client Components), React 19, Prisma 6 + PostgreSQL, Tailwind CSS 4, lucide-react, TypeScript 5.

## Global Constraints

- 참조 스펙: `docs/superpowers/specs/2026-06-24-login-dashboard-role-design.md`
- `/api/auth/unified-login`, `/api/auth/login` 백엔드 로직은 수정하지 않는다 (스펙 A절).
- `/admin` 산하 페이지와 `/api/customers`, `/api/partners`의 기존 필터링 동작은 변경하지 않는다 — 내부 구현(세션 판별)만 공유 헬퍼로 교체한다 (스펙 B절).
- 업체(`company_session`) 계정은 소유권 모델이 없으므로 빈 데이터로 처리한다 (스펙 "알려진 한계").
- 이 저장소에는 자동화된 테스트 러너(jest/vitest 등)가 설치되어 있지 않다. 각 작업의 검증은 `npx tsc --noEmit` 통과 + 아래 명시된 수동 확인 절차(`npm run dev` 구동 후 브라우저/curl)로 대체한다. 새 테스트 프레임워크를 추가하지 않는다.
- 경로 별칭 `@/*` → `./src/*` (tsconfig.json 기준).

---

## Task 1: 공유 세션 헬퍼 `src/lib/session.ts` 작성

**Files:**
- Create: `src/lib/session.ts`

**Interfaces:**
- Produces: `export type SessionInfo = { role: 'admin'; isAdmin: true; userId: null } | { role: 'general'; isAdmin: false; userId: number } | { role: 'company'; isAdmin: false; userId: null; companyId: number } | { role: 'anonymous'; isAdmin: false; userId: null }`
- Produces: `export async function getSessionInfo(): Promise<SessionInfo>`

- [ ] **Step 1: 파일 작성**

```ts
import { cookies } from 'next/headers';

export type SessionInfo =
  | { role: 'admin'; isAdmin: true; userId: null }
  | { role: 'general'; isAdmin: false; userId: number }
  | { role: 'company'; isAdmin: false; userId: null; companyId: number }
  | { role: 'anonymous'; isAdmin: false; userId: null };

export async function getSessionInfo(): Promise<SessionInfo> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  const userSession = cookieStore.get('user_session')?.value;
  const companySession = cookieStore.get('company_session')?.value;

  if (adminSession) {
    return { role: 'admin', isAdmin: true, userId: null };
  }

  if (userSession && userSession.startsWith('general:')) {
    const userId = parseInt(userSession.split(':')[1], 10);
    return { role: 'general', isAdmin: false, userId };
  }

  if (companySession && companySession.startsWith('company:')) {
    const companyId = parseInt(companySession.split(':')[1], 10);
    return { role: 'company', isAdmin: false, userId: null, companyId };
  }

  return { role: 'anonymous', isAdmin: false, userId: null };
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (새 파일은 아직 어디서도 import되지 않으므로 기존 동작에 영향 없음).

- [ ] **Step 3: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat: add shared session info helper"
```

---

## Task 2: `/api/customers`, `/api/partners`를 공유 헬퍼로 교체

**Files:**
- Modify: `src/app/api/customers/route.ts:1-19`
- Modify: `src/app/api/partners/route.ts:1-62`

**Interfaces:**
- Consumes: `getSessionInfo` from `src/lib/session.ts` (Task 1) — 반환값에 항상 `isAdmin: boolean`, `userId: number | null` 필드가 있으므로 기존 호출부 `const { isAdmin, userId } = await getSessionInfo();`는 그대로 둔다.

- [ ] **Step 1: `src/app/api/customers/route.ts`에서 로컬 `getSessionInfo` 제거하고 공유 헬퍼 import**

기존 1~19번 줄:

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

async function getSessionInfo() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  const userSession = cookieStore.get('user_session')?.value;

  if (adminSession) {
    return { isAdmin: true, userId: null };
  }

  if (userSession && userSession.startsWith('general:')) {
    return { isAdmin: false, userId: parseInt(userSession.split(':')[1], 10) };
  }

  return { isAdmin: false, userId: null };
}
```

다음으로 교체:

```ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionInfo } from "@/lib/session";
```

이후 `GET`, `POST` 함수 본문의 `const { isAdmin, userId } = await getSessionInfo();` 호출은 수정하지 않는다.

- [ ] **Step 2: `src/app/api/partners/route.ts`에서 동일하게 교체**

기존 1~62번 줄 중 import 블록과 로컬 `getSessionInfo` 함수(48~62번 줄)를 제거:

```ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
```

다음으로 교체:

```ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/password';
import { getSessionInfo } from '@/lib/session';
```

그리고 아래 로컬 함수 블록을 삭제:

```ts
async function getSessionInfo() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  const userSession = cookieStore.get('user_session')?.value;

  if (adminSession) {
    return { isAdmin: true, userId: null };
  }

  if (userSession && userSession.startsWith('general:')) {
    return { isAdmin: false, userId: parseInt(userSession.split(':')[1], 10) };
  }

  return { isAdmin: false, userId: null };
}
```

`GET`, `POST`, `PUT` 함수 본문의 `getSessionInfo()` 호출부는 수정하지 않는다.

- [ ] **Step 3: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 4: 수동 회귀 확인 (동작 불변 확인)**

```bash
npm run dev
```

다른 터미널에서, 관리자 쿠키 없이 비로그인 상태로 호출:

```bash
curl -i http://localhost:3000/api/partners
```

Expected: `HTTP/1.1 401` 또는 미들웨어가 `/api/`에 대해 401을 반환 (변경 전과 동일한 동작 — 미들웨어가 비로그인 요청을 막으므로 라우트 핸들러 내부 로직 변경과 무관하게 동일해야 함).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/customers/route.ts src/app/api/partners/route.ts
git commit -m "refactor: reuse shared session helper in customers/partners routes"
```

---

## Task 3: `LoginForm` 클라이언트 컴포넌트 작성 (라디오 모드 선택)

**Files:**
- Create: `src/components/LoginForm.tsx`

**Interfaces:**
- Consumes: 없음 (props만 받음)
- Produces: `export default function LoginForm({ errorMessage }: { errorMessage: string }): JSX.Element` — Task 4에서 `src/app/login/page.tsx`가 이 컴포넌트를 `<LoginForm errorMessage={errorMessage} />`로 사용.

- [ ] **Step 1: 파일 작성**

```tsx
'use client';

import { useState } from 'react';
import { ArrowRight, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm({ errorMessage }: { errorMessage: string }) {
  const [mode, setMode] = useState<'user' | 'admin'>('user');
  const isUser = mode === 'user';

  return (
    <section
      className={`bg-white/10 backdrop-blur-xl border p-7 rounded-3xl shadow-2xl transition-colors ${
        isUser ? 'border-emerald-400/30' : 'border-blue-400/30'
      }`}
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
            isUser
              ? 'bg-emerald-500/20 border-emerald-400/30'
              : 'bg-blue-600/20 border-blue-500/30'
          }`}
        >
          {isUser ? (
            <UserRound size={28} className="text-emerald-300" />
          ) : (
            <ShieldCheck size={28} className="text-blue-300" />
          )}
        </div>
        <div>
          <p
            className={`text-xs font-bold tracking-widest uppercase mb-1 ${
              isUser ? 'text-emerald-300' : 'text-blue-300'
            }`}
          >
            {isUser ? 'USER / COMPANY' : 'ADMIN'}
          </p>
          <h2 className="text-2xl font-bold text-white">
            {isUser ? '사용자 로그인' : '관리자 로그인'}
          </h2>
          <p className="text-slate-400 text-sm mt-2 leading-6">
            {isUser
              ? '현장 사용자는 비밀번호만, 가입 업체는 연락처와 비밀번호를 함께 입력하세요.'
              : '관리자 대시보드에서 견적·고객·사용자 계정을 관리합니다.'}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5" role="radiogroup" aria-label="로그인 모드">
        <label
          className={`flex-1 text-center text-sm font-semibold py-2.5 rounded-xl border cursor-pointer transition-all ${
            isUser
              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
              : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <input
            type="radio"
            name="login-mode"
            value="user"
            checked={isUser}
            onChange={() => setMode('user')}
            className="sr-only"
          />
          일반 사용자
        </label>
        <label
          className={`flex-1 text-center text-sm font-semibold py-2.5 rounded-xl border cursor-pointer transition-all ${
            !isUser
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
        >
          <input
            type="radio"
            name="login-mode"
            value="admin"
            checked={!isUser}
            onChange={() => setMode('admin')}
            className="sr-only"
          />
          관리자
        </label>
      </div>

      <form
        action={isUser ? '/api/auth/unified-login' : '/api/auth/login'}
        method="post"
        className="space-y-3"
      >
        {isUser && (
          <input
            name="phone"
            type="tel"
            placeholder="연락처 (업체 로그인 시 입력)"
            className="w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-500"
            autoComplete="tel"
          />
        )}
        <input
          name="password"
          type="password"
          placeholder={isUser ? '비밀번호 입력' : '관리자 비밀번호 입력'}
          className={`w-full bg-slate-800/50 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all placeholder:text-slate-500 ${
            isUser ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'
          }`}
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${
            isUser
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/25'
              : 'bg-blue-600 hover:bg-blue-500 text-white hover:shadow-blue-600/25'
          }`}
        >
          {isUser ? '로그인' : '관리자 로그인'} <ArrowRight size={20} />
        </button>
      </form>

      {isUser && (
        <p className="mt-4 text-center text-slate-600 text-xs">
          아직 계정이 없으신가요?{' '}
          <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
            무료 체험 신청
          </Link>
        </p>
      )}

      {errorMessage && (
        <p className="mt-5 bg-rose-500/10 border border-rose-400/30 text-rose-300 text-sm px-4 py-3 rounded-2xl flex items-center justify-center gap-2 animate-in slide-in-from-top-1">
          <ShieldAlert size={16} /> {errorMessage}
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (아직 어디서도 사용되지 않으므로 unused-export 외 에러 없어야 함).

- [ ] **Step 3: Commit**

```bash
git add src/components/LoginForm.tsx
git commit -m "feat: add radio-mode LoginForm component"
```

---

## Task 4: `/login` 페이지에 `LoginForm` 적용

**Files:**
- Modify: `src/app/login/page.tsx:1-3` (imports), `:69-155` (두 패널 + 에러 블록을 단일 카드로 교체)

**Interfaces:**
- Consumes: `LoginForm` from `src/components/LoginForm.tsx` (Task 3) — `<LoginForm errorMessage={errorMessage} />`

- [ ] **Step 1: import 블록 교체**

기존 1~2번 줄:

```tsx
import { ArrowRight, Lock, ShieldAlert, ShieldCheck, UserRound, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
```

다음으로 교체 (더 이상 직접 쓰지 않는 `ArrowRight`, `ShieldCheck`, `UserRound`, `ShieldAlert`는 LoginForm으로 이동했으므로 제거하고 `Lock`, `Sparkles`, `CheckCircle2`만 남김. `Link`는 가입 CTA에 계속 필요):

```tsx
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
```

- [ ] **Step 2: 두 패널 그리드와 에러 블록을 단일 카드로 교체**

기존 69번 줄부터 155번 줄까지(`<div className="grid grid-cols-1 md:grid-cols-2 gap-5">`로 시작해 사용자 로그인 섹션, 관리자 로그인 섹션, 그 뒤의 독립 에러 메시지 블록 `{errorMessage && (...)}` 까지 포함)를 아래로 교체:

```tsx
        <div className="max-w-md mx-auto">
          <LoginForm errorMessage={errorMessage} />
        </div>
```

(이전에는 에러 메시지가 두 패널 바깥 별도 블록이었지만, 이제 `LoginForm` 내부에서 모드와 무관하게 표시되므로 바깥 블록은 제거한다.)

- [ ] **Step 3: 파일 전체를 다시 읽어 구조 확인**

Read: `src/app/login/page.tsx`
Expected: `errorMessage` 계산 로직(41~52번 줄)은 그대로 남아있고, 그 아래 헤더 섹션 → `<LoginForm errorMessage={errorMessage} />` → 구독 플랜 섹션 → 가입 CTA 순서로 이어져야 한다. `Lock`, `Sparkles`, `CheckCircle2`만 lucide-react에서 import되어야 한다.

- [ ] **Step 4: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 5: 수동 브라우저 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000/login` 접속.

Expected:
- 카드 하나만 보이고, 상단에 "일반 사용자" / "관리자" 라디오 버튼 2개가 있다.
- 기본값은 "일반 사용자"이며 연락처+비밀번호 필드가 보인다.
- "관리자"를 클릭하면 연락처 필드가 사라지고 비밀번호 필드만 남고, 카드 테두리/버튼 색이 emerald→blue로 바뀐다.
- "일반 사용자" 모드에서 비밀번호만 입력 후 제출하면 `/api/auth/unified-login`으로 POST되어 `/dashboard`로 리다이렉트되거나(현장 사용자 비밀번호가 있다면) 에러 쿼리스트링과 함께 `/login`으로 돌아온다.
- "관리자" 모드에서 잘못된 비밀번호 입력 후 제출하면 `/login?error=admin`으로 리다이렉트되고 카드 아래 에러 메시지가 보인다.

- [ ] **Step 6: Commit**

```bash
git add src/app/login/page.tsx
git commit -m "feat: unify login page into single radio-mode form"
```

---

## Task 5: `/dashboard` 권한별 데이터 분기

**Files:**
- Modify: `src/app/dashboard/page.tsx:1-100` (imports, 쿼리, 헤더)

**Interfaces:**
- Consumes: `getSessionInfo` from `src/lib/session.ts` (Task 1) — `SessionInfo` 타입의 `role` 필드(`'admin' | 'general' | 'company' | 'anonymous'`)와 `general`일 때의 `userId: number`.

- [ ] **Step 1: import에 `getSessionInfo`와 `ShieldCheck` 추가**

기존 1~5번 줄:

```tsx
import { Wrench, PhoneCall, CalendarClock, Briefcase, FileText, ChevronRight, Users, ArrowRight, UserPlus, Sparkles, ListChecks } from "lucide-react";
import SettingsDropdown from "@/components/SettingsDropdown";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
```

다음으로 교체:

```tsx
import { Wrench, PhoneCall, CalendarClock, Briefcase, FileText, ChevronRight, Users, ArrowRight, UserPlus, Sparkles, ListChecks, ShieldCheck } from "lucide-react";
import SettingsDropdown from "@/components/SettingsDropdown";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { getSessionInfo } from "@/lib/session";
```

- [ ] **Step 2: 함수 시작부에 역할/소유권 필터 계산 추가**

기존 7~11번 줄:

```tsx
export default async function UserDashboard() {
  // Fetch real data
  const inProgressTasksCount = await prisma.task.count({
    where: { status: "진행중" },
  });
```

다음으로 교체:

```tsx
export default async function UserDashboard() {
  const session = await getSessionInfo();
  const isAdmin = session.role === "admin";

  // 관리자는 전체 데이터, 일반 사용자는 본인이 등록한 자료만, 업체/비로그인은
  // 아직 소유권 모델이 없으므로 절대 존재하지 않는 id로 필터링해 빈 결과를 반환한다.
  const ownerFilter =
    session.role === "admin"
      ? {}
      : session.role === "general"
        ? { createdById: session.userId }
        : { id: -1 };

  // Fetch real data
  const inProgressTasksCount = await prisma.task.count({
    where: { status: "진행중", ...ownerFilter },
  });
```

- [ ] **Step 3: `urgentEstimatesCount` 쿼리를 Task 연결 기준으로 필터링**

기존 13~15번 줄:

```tsx
  const urgentEstimatesCount = await prisma.estimate.count({
    where: { urgency: { contains: "당일" } },
  });
```

다음으로 교체:

```tsx
  const urgentEstimatesCount = await prisma.estimate.count({
    where: {
      urgency: { contains: "당일" },
      ...(session.role === "general"
        ? { task: { createdById: session.userId } }
        : session.role === "admin"
          ? {}
          : { id: -1 }),
    },
  });
```

- [ ] **Step 4: `weeklyTasks` 쿼리에 `ownerFilter` 추가**

기존 43~50번 줄:

```tsx
  const weeklyTasks = await prisma.task.findMany({
    where: {
      scheduledDate: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
  });
```

다음으로 교체:

```tsx
  const weeklyTasks = await prisma.task.findMany({
    where: {
      scheduledDate: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
      ...ownerFilter,
    },
  });
```

- [ ] **Step 5: `upcomingTasks` 쿼리에 `ownerFilter` 추가**

기존 71~78번 줄:

```tsx
  const upcomingTasks = await prisma.task.findMany({
    where: { 
      scheduledDate: { gte: new Date() } 
    },
    orderBy: { scheduledDate: 'asc' },
    take: 3,
    include: { customer: true }
  });
```

다음으로 교체:

```tsx
  const upcomingTasks = await prisma.task.findMany({
    where: {
      scheduledDate: { gte: new Date() },
      ...ownerFilter,
    },
    orderBy: { scheduledDate: 'asc' },
    take: 3,
    include: { customer: true }
  });
```

- [ ] **Step 6: 헤더에 역할별 문구 + 관리자 패널 버튼 추가**

기존 83~100번 줄:

```tsx
        <header className="flex items-center justify-between px-6 py-5 bg-blue-900 text-white shadow-md">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white overflow-hidden shadow-inner">
              <Image
                src="/owl-logo.png"
                alt="부엉이누수탐지랩 로고"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">일반 사용자 대시보드</h1>
              <p className="text-xs text-blue-100">부엉이누수탐지랩 현장 업무 계정</p>
            </div>
          </div>
          <SettingsDropdown />
        </header>
```

다음으로 교체:

```tsx
        <header className="flex items-center justify-between px-6 py-5 bg-blue-900 text-white shadow-md">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white overflow-hidden shadow-inner">
              <Image
                src="/owl-logo.png"
                alt="부엉이누수탐지랩 로고"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {isAdmin ? "관리자 대시보드" : "일반 사용자 대시보드"}
              </h1>
              <p className="text-xs text-blue-100">
                {isAdmin ? "전체 데이터 보기" : "부엉이누수탐지랩 현장 업무 계정"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl transition-colors border border-white/20"
              >
                <ShieldCheck size={14} />
                관리자 패널
              </Link>
            )}
            <SettingsDropdown />
          </div>
        </header>
```

- [ ] **Step 7: 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 8: 수동 확인 — 관리자로 로그인**

```bash
npm run dev
```

브라우저에서 `/login` → "관리자" 모드로 로그인 → `/admin`으로 리다이렉트되는지 확인(미들웨어 동작 그대로). 그 다음 주소창에 직접 `/dashboard`를 입력해 이동.

Expected:
- 헤더가 "관리자 대시보드" / "전체 데이터 보기"로 보인다.
- 헤더 우측에 "관리자 패널" 버튼이 보이고 클릭 시 `/admin`으로 이동한다.
- 통계 수치(진행 중 공사, 긴급 출동 대기)가 시드 데이터의 전체 합계와 일치한다(필터링 전과 동일).

- [ ] **Step 9: 수동 확인 — 일반 사용자로 로그인**

`prisma/seed.js` 또는 운영 DB의 활성 `GeneralUser` 비밀번호로 "일반 사용자" 모드 로그인 (연락처 비우고 비밀번호만 입력) 후 `/dashboard` 진입.

Expected:
- 헤더가 "일반 사용자 대시보드"로 그대로 보이고 관리자 패널 버튼은 보이지 않는다.
- "진행 중 공사", "긴급 출동 대기" 수치가 해당 계정으로 등록한 Task 건수만 반영한다(다른 계정이 만든 Task는 집계되지 않음). 이를 확인하려면 Prisma Studio(`npx prisma studio`)로 `Task.createdById` 값을 비교한다.
- "이번 주 일정" 캘린더 점과 하단 목록도 본인 Task만 반영한다.

- [ ] **Step 10: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공(타입/린트 에러 없음).

- [ ] **Step 11: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: scope dashboard stats by role (admin sees all, general user sees own data)"
```

---

## Self-Review 결과

- **스펙 커버리지:** A절(로그인 통합) → Task 3, 4. B절(대시보드 분기) → Task 5. 공유 세션 헬퍼 추출 → Task 1, 2. "알려진 한계"(업체/단독 견적)는 코드 주석과 수동 확인 절차에 반영됨.
- **플레이스홀더 스캔:** 없음 — 모든 단계에 실제 코드/명령/예상 출력 포함.
- **타입 일관성:** `SessionInfo`의 `role`/`userId`/`isAdmin` 필드명이 Task 1(정의) → Task 2(소비, 구조 분해 호환) → Task 5(소비, `role` 분기)에서 동일하게 사용됨.
