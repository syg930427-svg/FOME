import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export type PermissionStatus = 'not_determined' | 'granted' | 'limited' | 'denied';
export type PermissionKind = 'camera' | 'photos' | 'notifications';

const STORAGE_KEY = 'appEntry.v1';

type Persisted = {
  onboardingCompleted: boolean;
  notifPromptShown: boolean;
  lastPurposeId: string | null;
};

type AppEntryState = Persisted & {
  hydrated: boolean;
  permissions: Record<PermissionKind, PermissionStatus>;

  hydrate: () => Promise<void>;
  completeOnboarding: () => void;
  setPermission: (kind: PermissionKind, status: PermissionStatus) => void;
  markNotifPromptShown: () => void;
  setLastPurposeId: (id: string | null) => void;
};

async function persist(state: Persisted) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort — a failed write just means onboarding may show again next launch.
  }
}

/**
 * Device-persisted app-entry state (README: "영속(device): onboardingSeen,
 * permissions{...}, lastPurposeId"). Permission status itself is re-checked
 * from the OS on every foreground (see usePermissionStatus), so only the
 * bookkeeping that the OS doesn't track for us — onboarding seen, whether
 * we've already shown the notification prompt once — is persisted here.
 */
// TODO(temporary): 온보딩을 우선 앱 실행 시 보이지 않게 스킵 처리. 다시 보여주려면
// 아래 두 곳(초기값 + hydrate의 fallback)을 false로 되돌리면 됨.
const SKIP_ONBOARDING_FOR_NOW = true;

export const useAppEntry = create<AppEntryState>((set, get) => ({
  onboardingCompleted: SKIP_ONBOARDING_FOR_NOW,
  notifPromptShown: false,
  lastPurposeId: null,
  hydrated: false,
  permissions: { camera: 'not_determined', photos: 'not_determined', notifications: 'not_determined' },

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        set({
          onboardingCompleted: parsed.onboardingCompleted ?? SKIP_ONBOARDING_FOR_NOW,
          notifPromptShown: parsed.notifPromptShown ?? false,
          lastPurposeId: parsed.lastPurposeId ?? null,
        });
      }
    } finally {
      set({ hydrated: true });
    }
  },

  completeOnboarding: () => {
    set({ onboardingCompleted: true });
    void persist({
      onboardingCompleted: true,
      notifPromptShown: get().notifPromptShown,
      lastPurposeId: get().lastPurposeId,
    });
  },

  setPermission: (kind, status) => set((s) => ({ permissions: { ...s.permissions, [kind]: status } })),

  markNotifPromptShown: () => {
    set({ notifPromptShown: true });
    void persist({
      onboardingCompleted: get().onboardingCompleted,
      notifPromptShown: true,
      lastPurposeId: get().lastPurposeId,
    });
  },

  setLastPurposeId: (id) => {
    set({ lastPurposeId: id });
    void persist({ onboardingCompleted: get().onboardingCompleted, notifPromptShown: get().notifPromptShown, lastPurposeId: id });
  },
}));
