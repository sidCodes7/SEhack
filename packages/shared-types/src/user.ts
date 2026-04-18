// ──────────────────────────────────────────────
// User & Role Types — @aether/shared-types
// ──────────────────────────────────────────────

export type UserRole = 'student' | 'professor' | 'admin' | 'hod' | 'principal' | 'dean';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'mr' | 'te';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  karmaScore: number;
  preferredLanguage: SupportedLanguage;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
