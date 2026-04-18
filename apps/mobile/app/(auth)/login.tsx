import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth.service';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const buttonScale = new Animated.Value(1);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login({ email, password });
      const user = result.data.user;
      // Navigation handled by root layout auth check
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const onPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Decorative blob */}
      <View style={styles.blob} />

      <View style={styles.card}>
        <View style={styles.formWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.institution}>Aether Institution</Text>
            <Text style={styles.headline}>Welcome{'\n'}back.</Text>
          </View>

          {/* Form fields */}
          <View style={styles.formFields}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="hello@example.com"
                placeholderTextColor="#A7A9BE"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A7A9BE"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleLogin}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={loading}
                activeOpacity={1}
              >
                <Text style={styles.submitArrow}>→</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.forgotLink}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  blob: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 256,
    height: 256,
    backgroundColor: '#D5E7DE',
    borderRadius: 128,
    opacity: 0.6,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: SPACING.xl,
    minHeight: 520,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 40,
    elevation: 10,
  },
  formWrapper: {
    flex: 1,
    justifyContent: 'center',
    gap: 48,
  },
  header: {
    gap: SPACING.sm,
  },
  institution: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#5D605B',
    letterSpacing: 0.5,
  },
  headline: {
    fontFamily: FONTS.bold,
    fontSize: 40,
    lineHeight: 44,
    color: '#1A1A1A',
  },
  formFields: {
    gap: SPACING.lg,
  },
  inputGroup: {
    gap: SPACING.sm,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#5D605B',
  },
  input: {
    backgroundColor: '#F4F4EF',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#1A1A1A',
  },
  actions: {
    alignItems: 'flex-end',
    gap: SPACING.xl,
  },
  submitButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 8,
  },
  submitArrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: FONTS.medium,
  },
  forgotLink: {
    alignSelf: 'center',
  },
  forgotText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#5D605B',
  },
});
