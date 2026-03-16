'use client';

import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  credits: 0,
  isLoading: false,

  setUser: (user) => set({ user }),
  setCredits: (credits) => set({ credits }),

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const { data } = await res.json();
        set({ user: data.user, credits: data.user?.credits ?? 0 });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deductCredits: (amount) =>
    set((state) => ({ credits: Math.max(0, state.credits - amount) })),

  reset: () => set({ user: null, credits: 0 }),
}));

export default useAuthStore;
