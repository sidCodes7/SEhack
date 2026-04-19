import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';

import { useAuthStore } from '../store/auth.store';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = new Animated.Value(1);
  const { token, user, setAuth } = useAuthStore();

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        const storedUserStr = await SecureStore.getItemAsync('user');
        if (storedToken && storedUserStr) {
          setAuth(JSON.parse(storedUserStr), storedToken);
        }
      } catch (error) {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user');
      } finally {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => setIsLoading(false));
      }
    };
    bootstrapAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    const enforceAuth = async () => {
      const liveToken = token;
      const liveUser = user;

      if (!liveToken && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (liveToken && (inAuthGroup || (segments.length as unknown as number) === 0)) {
        if (liveUser?.role === 'professor' || liveUser?.role === 'hod') {
          router.replace('/(professor)/dashboard');
        } else if (liveUser?.role === 'admin') {
          router.replace('/(admin)/analytics');
        } else {
          router.replace('/(student)/dashboard');
        }
      }
    };
    enforceAuth();
  }, [token, segments, isLoading, user]);

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
    backgroundColor: '#D5E7DE',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: spacing.xl,
  },
  splashContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  splashHeadline: {
    fontSize: 52,
    fontWeight: '900',
    lineHeight: 56,
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  splashBrand: {
    marginTop: spacing.lg,
  },
  splashName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: spacing.sm,
  },
  splashBadge: {
    backgroundColor: '#1A1A1A',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
  },
  splashBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
