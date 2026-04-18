import { create } from 'zustand';

// Temporary type until shared-types are linked
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'professor' | 'admin' | 'hod' | 'dean';
  department?: string;
  karmaScore?: number;
  preferredLanguage?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
}));
