import type { LoginResponse, User } from '../types/index';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const EXPIRY_KEY = 'tokenExpiry';

// 로그인 정보 저장
export function saveAuth(loginResponse: LoginResponse): void {
  const { accessToken, userId, loginId, name } = loginResponse;

  // 토큰 저장
  localStorage.setItem(TOKEN_KEY, accessToken);

  // 사용자 정보 저장
  const user: User = { userId, loginId, name };
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  // 만료 시간 저장 (현재 시간 + 60분)
  const expiry = Date.now() + 60 * 60 * 1000; // 60분 = 3600000ms
  localStorage.setItem(EXPIRY_KEY, expiry.toString());
}

// 토큰 가져오기
export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);

  if (!token || !expiry) return null;

  // 만료 확인
  if (Date.now() > parseInt(expiry)) {
    clearAuth(); // 만료된 경우 모두 삭제
    return null;
  }

  return token;
}

// 사용자 정보 가져오기
export function getUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// 로그인 여부 확인
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// 인증 정보 삭제 (로그아웃)
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}
