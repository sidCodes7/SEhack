import api from './api';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth.store';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'professor' | 'admin';
  department?: string;
}

export const authService = {
  login: async (payload: LoginPayload) => {
    const response = await api.post('/auth/login', payload);
    const { user, token } = response.data.data;
    await SecureStore.setItemAsync('auth_token', token);
    useAuthStore.getState().setAuth(user, token);
    return response.data;
  },

  register: async (payload: RegisterPayload) => {
    const response = await api.post('/auth/register', payload);
    const { user, token } = response.data.data;
    await SecureStore.setItemAsync('auth_token', token);
    useAuthStore.getState().setAuth(user, token);
    return response.data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    useAuthStore.getState().clearAuth();
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  updateLanguage: async (language: string) => {
    const response = await api.patch('/auth/language', { language });
    return response.data;
  },
};
