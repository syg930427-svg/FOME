import { create } from 'zustand';
import { INITIAL_NOTICES, Notice } from '../api/mockData';

type NoticesState = {
  notices: Notice[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  getNotice: (id: string) => Notice | undefined;
};

/** 19-04/19-05 — read/unread state for 공지사항. Session-only, like `useMyPhotos`. */
export const useNotices = create<NoticesState>((set, get) => ({
  notices: INITIAL_NOTICES,

  markRead: (id) => set((s) => ({ notices: s.notices.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

  markAllRead: () => set((s) => ({ notices: s.notices.map((n) => ({ ...n, read: true })) })),

  getNotice: (id) => get().notices.find((n) => n.id === id),
}));
