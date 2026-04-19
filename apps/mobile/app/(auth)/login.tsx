import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import api from '../../services/api';

const DEMO_USERS = [
  { email: 'priyank@aether.edu', password: 'aether123', name: 'Priyank', role: 'student', department: 'Computer Science' },
  { email: 'harshav@aether.edu', password: 'aether123', name: 'Prof. Harshav', role: 'professor', department: 'Computer Science' },
  { email: 'admin@aether.edu', password: 'aether123', name: 'Admin', role: 'admin', department: 'Administration' },
];

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try real API first
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success && res.data?.data?.token) {
        const { token, user } = res.data.data;
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(user));
        routeByRole(user.role);
        return;
      }
    } catch {
      // API unavailable — try demo fallback
    }

    // Demo user fallback
    const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
    if (demoUser) {
      const token = 'demo-jwt-token';
      const user = { id: demoUser.email, name: demoUser.name, email: demoUser.email, role: demoUser.role, department: demoUser.department };
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      routeByRole(user.role);
      return;
    }

    setError('Invalid email or password');
    setLoading(false);
  };

  const routeByRole = (role: string) => {
    setLoading(false);
    if (role === 'professor' || role === 'hod') {
      router.replace('/(professor)/dashboard');
    } else if (role === 'admin') {
      router.replace('/(admin)/analytics');
    } else {
      router.replace('/(student)/dashboard');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: '#E8EDE8' }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.institution}>Aether Institution</Text>
          <Text style={styles.welcome}>Welcome{'\n'}back.</Text>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="hello@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setError(''); }}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.bottomArea}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.textWhite} />
              ) : (
                <Text style={styles.loginButtonArrow}>→</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoLink}
              onPress={() => router.push('/(auth)/role-select')}
            >
              <Text style={styles.demoText}>Quick demo login →</Text>
            </TouchableOpacity>
          </View>

          {/* Demo hint */}
          <View style={styles.demoHint}>
            <Text style={styles.demoHintText}>
              Demo: priyank@aether.edu / aether123
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 50,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    minHeight: 520,
  },
  institution: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  welcome: {
    ...typography.hero,
    fontSize: 42,
    lineHeight: 48,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.inputLabel,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.inputRadius,
    paddingHorizontal: spacing.inputPaddingH,
    paddingVertical: spacing.inputPaddingV,
    fontSize: 16,
    color: colors.textPrimary,
  },
  errorText: {
    color: colors.accentRed,
    fontSize: 14,
    fontWeight: '500',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  bottomArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  loginButton: {
    width: spacing.buttonSize,
    height: spacing.buttonSize,
    borderRadius: spacing.buttonSize / 2,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  loginButtonArrow: {
    color: colors.textWhite,
    fontSize: 24,
    fontWeight: '600',
  },
  demoLink: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  demoHint: {
    marginTop: spacing.md,
    padding: 12,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    alignItems: 'center',
  },
  demoHintText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
});
