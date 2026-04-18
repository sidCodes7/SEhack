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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      let user = { id: 'prof-priyank', name: 'Dr. Priyank', email: 'priyank@aether.edu', role: 'professor' };
      let token = 'dev-offline-mode-token';
      
      // Artificial delay for feel
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Just bypass all network checks to unblock demo
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      router.replace('/(professor)/dashboard');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password. Try priyank / aether123');
    } finally {
      setLoading(false);
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
              onChangeText={setEmail}
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
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

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
                <Text style={styles.loginButtonArrow}>Login</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.forgotLink} onPress={() => Alert.alert('Test Bypass', 'Username: priyank\nPassword: aether123')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
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
    minHeight: 500,
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
  bottomArea: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingTop: spacing.xl,
  },
  loginButton: {
    width: spacing.buttonSize,
    height: spacing.buttonSize,
    borderRadius: spacing.buttonSize / 2,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loginButtonArrow: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  forgotLink: {
    alignSelf: 'center',
  },
  forgotText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

