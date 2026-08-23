import { create } from 'zustand';

type ToastState = {
  message: string | null;
  show: (message: string, durationMs?: number) => void;
};

let hideTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Global toast queue (02-03: "정책 적용" confirmation). A single toast can
 * outlive the screen that triggered it — it's shown right as the app
 * navigates away — so it lives above the navigator, not inside one screen.
 */
export const useToast = create<ToastState>((set) => ({
  message: null,
  show: (message, durationMs = 1600) => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ message });
    hideTimer = setTimeout(() => set({ message: null }), durationMs);
  },
}));
