# 🦉 부엉이누수탐지랩 (Owl Leak) 현장 사진 저장 경로 안내 문서

이 문서는 **작업 관리 및 사진** 메뉴(`/tasks`) 및 시스템 내부 API에서 현장 사진을 바로 촬영하거나 갤러리에서 선택하여 업로드했을 때 저장되는 데이터 및 파일 경로를 설명합니다.

---

## 1. 📱 브라우저 저장소 (웹/모바일 프론트엔드 - 현재 동작 방식)

**[작업 관리 및 사진]** 페이지(`/tasks`)의 현장 사진 탭에서는 현장에서 빠르게 사진을 촬영하거나 업로드할 수 있도록, **Canvas 기반 이미지 최적화(JPEG 75% 압축 및 800px 리사이징)** 후 사용자 기기의 **웹 브라우저 저장소(`LocalStorage`)**에 즉시 저장합니다.

* **저장 매체**: 브라우저 로컬 스토리지 (`LocalStorage`)
* **저장 키 (Key)**: `owl_site_photos`
* **데이터 포맷**: JSON Array (`Base64 Data URL` 포함)
* **저장 구조 예시**:
  ```json
  [
    {
      "id": "photo_1722312345678",
      "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
      "title": "현장 사진 2026-07-30 20:45",
      "date": "2026-07-30"
    }
  ]
  ```
* **확인 방법 (개발자 도구)**:
  - PC / 모바일 브라우저 `F12 (개발자 도구)` -> `Application (애플리케이션)` -> `Local Storage` -> `owl_site_photos` 항목에서 확인 가능.

---

## 2. 💻 서버 파일 저장소 (REST API - `/api/photos/upload`)

서버 파일 업로드 API(`POST /api/photos/upload`)를 통해 사진을 전송할 경우, 프로젝트의 `public/uploads` 경로 하위에 **사용자 역할(계정) 및 날짜별**로 자동 분류되어 영구 보관됩니다.

### 📁 물리적 파일 저장 절대 경로
```
/Users/jay/owl/public/uploads/{소유자_폴더}/{YYYY-MM-DD}/{타임스탬프_난수}.{확장자}
```

### 📂 소유자별 폴더 구분
1. **일반 현장 기사 계정 (`general`)**:
   - `/Users/jay/owl/public/uploads/user_{userId}/{YYYY-MM-DD}/`
   - 예시: `/Users/jay/owl/public/uploads/user_1/2026-07-30/1722312345_a1b2c3.jpg`
2. **가입 업체 계정 (`company`)**:
   - `/Users/jay/owl/public/uploads/company_{companyId}/{YYYY-MM-DD}/`
   - 예시: `/Users/jay/owl/public/uploads/company_5/2026-07-30/1722312345_d4e5f6.jpg`
3. **최고 관리자 계정 (`admin`)**:
   - `/Users/jay/owl/public/uploads/admin/{YYYY-MM-DD}/`
   - 예시: `/Users/jay/owl/public/uploads/admin/2026-07-30/1722312345_g7h8i9.jpg`

---

## 🌐 3. 웹 접근 URL 및 DB 메타데이터

* **웹 접근 상대 URL**:
  - `/uploads/user_1/2026-07-30/1722312345_a1b2c3.jpg`
* **Prisma DB 테이블 (`SitePhoto`)**:
  - `id`: Int (PK)
  - `title`: String (사진 제목)
  - `storagePath`: String (`/uploads/...` 경로)
  - `date`: String (`YYYY-MM-DD`)
  - `userId`: Int (일반 사용자 외래키)
  - `companyId`: Int (업체 사용자 외래키)
