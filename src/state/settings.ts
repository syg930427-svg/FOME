import { create } from 'zustand';

export type LanguageCode = 'ko' | 'en' | 'ja' | 'zh-CN';
export type RetentionPolicyId = 'immediate' | '30days' | '1year';

type NotificationPrefs = {
  photoComplete: boolean;
  paymentRefund: boolean;
  deletionWarning: boolean;
  promo: boolean;
  newFeature: boolean;
};

type SettingsState = {
  notifications: NotificationPrefs;
  doNotDisturb: boolean;
  language: LanguageCode;
  retentionPolicy: RetentionPolicyId;
  /** 16-02 "연결된 계정" — mock link/unlink, independent of the actual login provider. */
  linkedAccounts: { apple: boolean; google: boolean };

  toggleNotification: (key: keyof NotificationPrefs) => void;
  toggleDoNotDisturb: () => void;
  setLanguage: (language: LanguageCode) => void;
  setRetentionPolicy: (id: RetentionPolicyId) => void;
  toggleLinkedAccount: (provider: 'apple' | 'google') => void;
};

/**
 * 목차 16 — 설정 및 개인정보용 스토어. `useAuth`/`useMyPhotos`와 분리한 이유:
 * 이 값들은 로그인 여부와 무관하게(RULE: 로그인은 결제 직전에만) 항상 조회·
 * 변경 가능해야 한다 — 알림/언어/보관 정책은 비로그인 사용자에게도 의미가 있다.
 */
export const useSettings = create<SettingsState>((set) => ({
  notifications: {
    photoComplete: true,
    paymentRefund: true,
    deletionWarning: true,
    promo: false,
    newFeature: false,
  },
  doNotDisturb: true,
  language: 'ko',
  retentionPolicy: '30days',
  linkedAccounts: { apple: false, google: false },

  toggleNotification: (key) =>
    set((s) => ({ notifications: { ...s.notifications, [key]: !s.notifications[key] } })),
  toggleDoNotDisturb: () => set((s) => ({ doNotDisturb: !s.doNotDisturb })),
  setLanguage: (language) => set({ language }),
  setRetentionPolicy: (retentionPolicy) => set({ retentionPolicy }),
  toggleLinkedAccount: (provider) =>
    set((s) => ({ linkedAccounts: { ...s.linkedAccounts, [provider]: !s.linkedAccounts[provider] } })),
}));
