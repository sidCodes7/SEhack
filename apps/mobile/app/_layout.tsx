import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';
import { SPACING } from '../constants/spacing';

export default function RootLayout() {
  const { user, token, setAuth, clearAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        if (storedToken) {
          // Attempt to validate the token by fetching user profile
          const userData = await authService.getMe();
          setAuth(userData, storedToken);
        }
      } catch (error) {
        // Token invalid or expired — clear everything
        await SecureStore.deleteItemAsync('auth_token');
        clearAuth();
      } finally {
        // Fade out splash screen
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setIsLoading(false));
      }
    };
    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      if (user?.role === 'professor') {
        router.replace('/(professor)/dashboard');
      } else if (user?.role === 'admin' || user?.role === 'dean' || user?.role === 'hod') {
        router.replace('/(admin)/analytics');
      } else {
        router.replace('/(student)/dashboard');
      }
    }
  }, [token, segments, isLoading]);

  if (isLoading) {
    return (
      <Animated.View style={[styles.splash, { opacity: fadeAnim }]}>
        <View style={styles.splashContent}>
          <Text style={styles.splashHeadline}>Above the{'\n'}chaos.</Text>
          <View style={styles.splashBrand}>
            <Text style={styles.splashName}>Aether</Text>
            <View style={styles.splashBadge}>
              <Text style={styles.splashBadgeText}>CAMPUS OS</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#D5E7DE', // sage green from wireframe
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: SPACING.xl,
  },
  splashContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  splashHeadline: {
    fontFamily: FONTS.bold,
    fontSize: 52,
    lineHeight: 56,
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  splashBrand: {
    marginTop: SPACING.lg,
  },
  splashName: {
    fontFamily: FONTS.semiBold,
    fontSize: 20,
    color: '#1A1A1A',
    marginBottom: SPACING.sm,
  },
  splashBadge: {
    backgroundColor: '#1A1A1A',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: 20,
  },
  splashBadgeText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
