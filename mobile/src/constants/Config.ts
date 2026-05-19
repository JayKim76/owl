import { Platform } from 'react-native';

// 🔌 연결 방법 선택 가이드:
// 1. 에뮬레이터 테스트: EMULATOR_URL (안드로이드 에뮬레이터 전용 루프백 주소)
// 2. 실기 테스트 (같은 WiFi): WIFI_URL (PC의 로컬 IP 주소로 연결)
// 3. 외부 인터넷 테스트 (터널): TUNNEL_URL (Localtunnel / Ngrok 주소)

const EMULATOR_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const WIFI_URL = 'http://192.168.0.2:3000'; // PC의 Wi-Fi IP 주소 (터미널의 Network 주소)
//const TUNNEL_URL = 'https://shaky-pumas-relate.loca.lt'; // 활성화된 터널 주소
const TUNNEL_URL = 'https://sad-crabs-rule.loca.lt'; // 활성화된 터널 주소

// 💡 아래 변수를 변경하여 접속 모드를 전환하세요!
const ACTIVE_URL = WIFI_URL; // 실기로 테스트할 때는 WIFI_URL 또는 TUNNEL_URL로 변경하세요.

export const CONFIG = {
  API_BASE_URL: ACTIVE_URL,
  TIMEOUT: 10000,
};
