import { create } from 'zustand';
import { INITIAL_MY_PHOTO_ORDERS, PhotoOrder } from '../api/mockData';

export type DeleteScope = 'both' | 'originalOnly';

type MyPhotosState = {
  orders: PhotoOrder[];
  /** 13-06 — delete an order. 'both' drops it from the list entirely; 'originalOnly' just clears its original-photo deletion notice (results/receipt stay). */
  deleteOrder: (id: string, scope: DeleteScope) => void;
  getOrder: (id: string) => PhotoOrder | undefined;
  /** 14-07 — account deletion wipes every order, not just one. */
  clearAll: () => void;
};

export const useMyPhotos = create<MyPhotosState>((set, get) => ({
  orders: INITIAL_MY_PHOTO_ORDERS,

  deleteOrder: (id, scope) =>
    set((state) => ({
      orders:
        scope === 'both'
          ? state.orders.filter((o) => o.id !== id)
          : state.orders.map((o) => (o.id === id ? { ...o, originalDeleteLabel: null } : o)),
    })),

  getOrder: (id) => get().orders.find((o) => o.id === id),

  clearAll: () => set({ orders: [] }),
}));
