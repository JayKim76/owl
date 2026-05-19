# 📱 Owl App 안드로이드 실행 및 빌드 가이드

이 가이드는 모바일 개발 프레임워크인 **React Native (Expo)**를 기반으로 구축된 `mobile` 프로젝트를 안드로이드 기기나 에뮬레이터에서 실행하고, 설치 가능한 APK 파일로 빌드하는 방법을 아주 쉽고 자세하게 안내합니다.

---

## 🔌 1단계: 서버 연결 설정하기

모바일 앱이 로컬 컴퓨터에서 가동 중인 Next.js 백엔드 서버와 통신하려면 올바른 API 주소를 지정해야 합니다.

1. [mobile/src/constants/Config.ts](file:///e:/AI/owl/mobile/src/constants/Config.ts) 파일을 엽니다.
2. 테스트 환경에 맞게 `ACTIVE_URL` 변수를 설정합니다.
   * **안드로이드 에뮬레이터**: `EMULATOR_URL` (10.0.2.2:3000 으로 자동 라우팅)
   * **실제 스마트폰 (같은 Wi-Fi 접속 시)**: `WIFI_URL` (PC의 IP 주소 `192.168.0.2:3000` 사용)
   * **원격 인터넷 환경 (터널링)**: `TUNNEL_URL` (Localtunnel 또는 Ngrok 도메인)

---

## 🏃 2단계: 로컬에서 앱 테스트하기 (개발 모드)

가장 빠르고 보편적인 테스트 방법은 **Expo Go** 공식 앱을 스마트폰에 설치하여 무선으로 로컬 코드를 실시간 렌더링하는 방법입니다.

### 방법 A: 실제 안드로이드 스마트폰에서 테스트 (강력 추천)
1. 구글 플레이스토어에서 **Expo Go** 앱을 검색하여 설치합니다.
2. 스마트폰과 PC가 **동일한 Wi-Fi 네트워크**에 연결되어 있는지 확인합니다.
3. VS Code나 터미널에서 `mobile` 디렉토리로 이동한 뒤 개발 서버를 시작합니다:
   ```bash
   cd mobile
   npm run start
   ```
4. 터미널 창에 나타나는 커다란 **QR 코드**를 안드로이드 기본 카메라 앱 또는 Expo Go 앱 내부의 QR 스캐너로 스캔하면 즉시 로컬 앱이 스마트폰에서 가동됩니다!

### 방법 B: 안드로이드 에뮬레이터에서 테스트
1. **Android Studio**를 켜고 **Virtual Device Manager**에서 에뮬레이터를 가동합니다.
2. 터미널에서 모바일 개발 서버를 실행합니다:
   ```bash
   cd mobile
   npm run android
   ```
3. 에뮬레이터 화면에 Expo Go가 자동 설치되며 개발 중인 화면이 실행됩니다.

---

## 📦 3단계: 안드로이드 설치 파일(APK)로 빌드하기 (EAS Cloud Build)

스마트폰에 직접 터미널 연결 없이 독립적인 앱 파일(`.apk`)을 만들어 설치하고 싶다면 **Expo Application Services (EAS)** 클라우드 빌드를 사용하면 됩니다.

우리가 이미 `eas.json` 파일에 APK 자동 생성을 위한 설정을 완료해 두었으므로 아래 단계를 따르면 클라우드에서 바로 APK 빌드가 진행됩니다.

1. **Expo CLI 로그인** (계정이 없다면 [expo.dev](https://expo.dev)에서 무료 가입):
   ```bash
   npx expo login
   ```
2. **EAS 빌드 실행 (미리보기/테스트 프로필)**:
   ```bash
   npx eas-cli build --profile preview --platform android
   ```
3. 빌드가 시작되면 터미널에 클라우드 대시보드 링크가 공유되며, 빌드(약 5~10분 소요)가 완료되면 **APK 파일을 직접 다운로드할 수 있는 QR 코드와 다운로드 링크**가 터미널에 생성됩니다!
4. 스마트폰으로 해당 QR 코드를 촬영하면 브라우저를 통해 `.apk` 파일을 즉시 다운로드하여 폰에 설치할 수 있습니다.

---

## 🛠️ 4단계: 안드로이드 네이티브 코드로 변환하기 (Local Prebuild)

만약 React Native 코드가 아닌 실제 안드로이드 네이티브 폴더(`android/`)를 생성하여 Android Studio에서 직접 자바/코틀린 빌드나 Gradle 패키징을 원하신다면 다음 명령어를 사용해 안드로이드 프로젝트 구조를 생성하실 수 있습니다.

```bash
cd mobile
npx expo prebuild --platform android
```

* 위 명령어를 수행하면 `mobile/android` 디렉토리가 새롭게 생성되며, 해당 폴더를 **Android Studio**로 열어 네이티브 소스코드를 보거나 로컬 Gradle 빌드를 진행할 수 있습니다.

---

> [!NOTE]  
> 모바일 코드 수정 시 실시간으로 개발 화면이 리로드(Fast Refresh)됩니다. 
> UI 디자인이나 로직을 추가하고 싶으신 부분이 있으시면 언제든 알려주세요!
