import type { User } from '../types';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user_info';

export const authService = {
  // 토큰 저장
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  // 토큰 가져오기
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // 토큰 삭제
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // 사용자 정보 저장
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // 사용자 정보 가져오기
  getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // 사용자 정보 삭제
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },

  // 로그인 여부 확인
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  // 로그아웃
  logout() {
    this.removeToken();
    this.removeUser();
  },

  // Authorization 헤더 가져오기
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};
