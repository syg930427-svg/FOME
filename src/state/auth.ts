import { create } from 'zustand';
import { MOCK_CREDIT_BALANCE } from '../api/mockData';

export type AuthProvider = 'kakao' | 'apple' | 'google' | 'email';

const MAX_LOGIN_ATTEMPTS = 5;

function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const visible = name.slice(0, Math.min(3, name.length));
  const dots = '•'.repeat(Math.max(1, name.length - visible.length || 3));
  return `${visible}${dots}@${domain}`;
}

const PROVIDER_DISPLAY_NAME: Record<AuthProvider, string> = {
  kakao: '카카오 사용자',
  apple: 'Apple 사용자',
  google: 'Google 사용자',
  email: '',
};

function emailDisplayName(email: string): string {
  const local = email.split('@')[0] || email;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

type AuthState = {
  isLoggedIn: boolean;
  provider: AuthProvider | null;
  maskedEmail: string;
  /** 16-02 계정 설정의 "이름" 행 — 실제 프로필 입력 UI는 없어 로그인 방식에서 파생시킨다. */
  displayName: string;
  creditBalance: number;
  failedAttempts: number;
  lockedOut: boolean;

  loginWithProvider: (provider: AuthProvider, maskedEmailValue: string) => void;
  /**
   * Mock rule — there's no real backend to check a password against, so
   * 14-04 (login failure) is reachable via a discoverable heuristic instead
   * of a magic credential: passwords under 6 characters "fail". Five fails
   * locks the form, matching the design's remaining-attempts copy.
   */
  loginWithEmail: (email: string, password: string) => boolean;
  signUp: (email: string) => void;
  logout: () => void;
  deleteAccount: () => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  provider: null,
  maskedEmail: '',
  displayName: '',
  creditBalance: MOCK_CREDIT_BALANCE,
  failedAttempts: 0,
  lockedOut: false,

  loginWithProvider: (provider, maskedEmailValue) =>
    set({
      isLoggedIn: true,
      provider,
      maskedEmail: maskedEmailValue,
      displayName: PROVIDER_DISPLAY_NAME[provider],
      failedAttempts: 0,
      lockedOut: false,
    }),

  loginWithEmail: (email, password) => {
    if (get().lockedOut) return false;
    if (password.length < 6) {
      const failedAttempts = get().failedAttempts + 1;
      set({ failedAttempts, lockedOut: failedAttempts >= MAX_LOGIN_ATTEMPTS });
      return false;
    }
    set({
      isLoggedIn: true,
      provider: 'email',
      maskedEmail: maskEmail(email),
      displayName: emailDisplayName(email),
      failedAttempts: 0,
      lockedOut: false,
    });
    return true;
  },

  signUp: (email) =>
    set({
      isLoggedIn: true,
      provider: 'email',
      maskedEmail: maskEmail(email),
      displayName: emailDisplayName(email),
      failedAttempts: 0,
      lockedOut: false,
    }),

  logout: () => set({ isLoggedIn: false, provider: null, maskedEmail: '', displayName: '' }),

  // 14-07: face data + generated photos + credit + free retry all go away immediately.
  deleteAccount: () =>
    set({ isLoggedIn: false, provider: null, maskedEmail: '', displayName: '', creditBalance: 0, failedAttempts: 0, lockedOut: false }),
}));
