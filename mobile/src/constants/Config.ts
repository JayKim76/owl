import { Platform } from 'react-native';

// 로컬 테스트 시 에뮬레이터 주소 대응
// 안드로이드 에뮬레이터는 10.0.2.2를 사용하여 호스트 PC에 접속합니다.
//const LOCAL_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
const LOCAL_API_URL = 'http://192.168.10.107:3000';
export const CONFIG = {
  API_BASE_URL: LOCAL_API_URL,
  TIMEOUT: 10000,
};
