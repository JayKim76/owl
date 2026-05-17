import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/Config';

const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: CONFIG.TIMEOUT,
});

// Request Interceptor: 모든 요청에 토큰 추가
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: 401 에러(인증 만료) 시 로그아웃 등 처리 가능
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // 토큰이 유효하지 않으면 삭제
      await SecureStore.deleteItemAsync('user_token');
      // 여기서 필요 시 리로드 등 처리
    }
    return Promise.reject(error);
  }
);

export default api;
