export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'professor' | 'admin';
  department?: string;
  semester?: number;
  program?: string;
  language?: string;
  avatar?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'professor' | 'admin';
  department?: string;
}
