# 로그인 통합 + 대시보드 권한별 분기 설계

날짜: 2026-06-24

## 배경

`/login` 페이지는 "사용자 로그인"(연락처+비밀번호, 업체/현장사용자 겸용)과 "관리자 로그인"(비밀번호만)을 두 개의 별도 패널로 나눠 보여준다. 운영자가 이를 하나의 입력 폼 + 모드 선택으로 통합하고 싶어한다.

로그인 후 진입점인 `/`는 모든 역할을 `/dashboard`로 리다이렉트하며, 코드에는 이미 "대시보드 내부에서 권한별 UI 분기 처리됨"이라는 주석이 있지만 실제로는 구현되어 있지 않다. `/dashboard`는 항상 전체 데이터 기준 통계(진행중 공사 수, 긴급 출동 대기, 주간 일정, 예정 작업 목록)를 보여준다. `/admin`(관리자 전용, 미들웨어로 차단)과 `/api/customers`, `/api/partners`는 이미 일부 소유권 필터링(`createdById`)이 구현되어 있다.

## 범위

1. `/login` 폼 통합: 라디오 버튼으로 "일반 사용자" / "관리자" 모드를 선택하고, 모드에 맞는 입력 필드만 노출. 기존 두 백엔드 엔드포인트(`/api/auth/unified-login`, `/api/auth/login`)는 변경 없이 재사용.
2. `/dashboard` 권한별 분기: 관리자는 전체 데이터, 일반 사용자(`user_session=general:*`)는 본인이 등록한 자료만 조회. 업체(`company_session`)는 소유권 모델이 없으므로 안전한 기본값(빈 데이터)으로 처리.
3. 위 두 라우트(`/api/customers`, `/api/partners`)에서 중복 작성된 세션 판별 로직을 `src/lib/session.ts`로 추출해 `/dashboard`에서도 재사용.

`/admin` 산하 페이지(관리자 전용 통계/관리 화면)는 이미 전체 데이터를 보여주므로 변경하지 않는다. Company(업체 SaaS 구독) 데이터 소유권 모델 신설(스키마 마이그레이션)은 이번 범위에 포함하지 않는다.

## A. 로그인 폼 통합

### UI

`src/app/login/page.tsx`는 서버 컴포넌트로 유지하되, 카드 내부를 새 클라이언트 컴포넌트 `src/components/LoginForm.tsx`로 교체한다.

- 폼 상단에 라디오 버튼 2개: `일반 사용자`(기본 선택) / `관리자`.
- "일반 사용자" 선택 시: 연락처(선택, placeholder "연락처 (업체 로그인 시 입력)") + 비밀번호 필드. `action="/api/auth/unified-login"`.
- "관리자" 선택 시: 비밀번호 필드만 노출(연락처 필드 숨김). `action="/api/auth/login"`.
- 제출 버튼 레이블/색상은 선택된 모드에 따라 바뀐다("로그인" / "관리자 로그인").
- 에러 메시지 처리(`searchParams.error`)는 현재 로직 그대로 페이지에서 계산해 `LoginForm`에 prop으로 전달.
- 구독 플랜 섹션, 가입 CTA, 배경 디자인은 그대로 유지.

### 백엔드

변경 없음. `unified-login`과 `login` 라우트는 그대로 동작.

## B. 대시보드 권한별 분기

### 공유 세션 헬퍼 (`src/lib/session.ts`)

`api/customers/route.ts`, `api/partners/route.ts`에 중복된 `getSessionInfo()`를 다음 형태로 추출:

```ts
export type SessionInfo =
  | { role: 'admin' }
  | { role: 'general'; userId: number }
  | { role: 'company'; companyId: number }
  | { role: 'anonymous' };

export async function getSessionInfo(): Promise<SessionInfo>
```

`cookies()`를 읽어 `admin_session` → `role: 'admin'`, `user_session=general:<id>` → `role: 'general'`, `company_session=company:<id>` → `role: 'company'`, 없으면 `role: 'anonymous'`. 기존 두 라우트는 이 헬퍼로 교체하고, 호출부에서 `isAdmin = role === 'admin'`, `userId = role === 'general' ? userId : null` 형태로 매핑해 동작은 동일하게 유지한다(동작 변경 없음, 순수 리팩터).

### `/dashboard` 변경

`src/app/dashboard/page.tsx`에서 `getSessionInfo()`로 역할을 판별한다.

- **admin**: 기존과 동일하게 전체 데이터 기준 통계. 헤더에 "관리자 패널로 이동" 버튼(`/admin`으로 링크) 추가.
- **general (userId)**:
  - `inProgressTasksCount`: `prisma.task.count({ where: { status: '진행중', createdById: userId } })`
  - `urgentEstimatesCount`: `prisma.estimate.count({ where: { urgency: { contains: '당일' }, task: { createdById: userId } } })` — Estimate에는 소유자 필드가 없으므로 연결된 Task의 소유자로 필터링(아직 Task로 연결되지 않은 단독 견적은 집계되지 않음, 알려진 한계로 명시).
  - `weeklyTasks`(캘린더 점 표시), `upcomingTasks`(하단 목록): 모두 `createdById: userId` 조건 추가.
  - 헤더 문구는 기존 "일반 사용자 대시보드" 유지.
- **company / anonymous**: 위 4개 쿼리 모두 빈 결과로 처리(쿼리 자체를 건너뛰고 0/[] 반환). 헤더에 변화 없음. (업체 전용 소유권 모델은 범위 밖)

### 영향받지 않는 부분

`/customers`, `/partners`, `/tasks`, `/estimate` 페이지와 그 API는 이미 같은 방식으로 필터링되어 있어 변경하지 않는다(단, `/api/partners`, `/api/customers`는 새 `getSessionInfo` 헬퍼로 내부 구현만 교체).

## 알려진 한계 (범위 밖, 참고용)

- `company_session`(업체 SaaS 계정)은 Task/Partner/Customer와 연결되는 소유자 필드가 스키마에 없어 "본인 등록 자료"를 추적할 수 없다. 현재는 안전하게 빈 데이터로 처리한다. 향후 업체별 데이터 분리가 필요하면 스키마에 `companyId`를 추가하는 별도 작업이 필요하다.
- 독립적으로 생성된 견적(`/api/estimate` POST, Task로 연결되지 않은 단독 견적)은 작성자 정보가 없어 일반 사용자의 "긴급 출동 대기" 집계에서 빠질 수 있다.
