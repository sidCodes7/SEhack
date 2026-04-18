import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/auth.store';
import * as SecureStore from 'expo-secure-store';

export function useAuth() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        if (storedToken && !token) {
          // You might want to actually validate the token or fetch user info here
          // For now, if we have a token but no user in store, we might stay logged in
          // Or we let the splash screen handle the initial load
        }
      } catch (error) {
        console.error('Failed to get token:', error);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!token && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      // Redirect away from login if authenticated
      if (user?.role === 'professor') {
        router.replace('/(professor)/dashboard');
      } else if (user?.role === 'admin') {
        router.replace('/(admin)/analytics');
      } else {
        router.replace('/(student)/dashboard');
      }
    }
  }, [token, segments, user]);

  return { user, token, setAuth, clearAuth };
}
