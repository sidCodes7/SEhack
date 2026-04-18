import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';




type Role = 'student' | 'professor' | 'admin';

interface RoleOption {
  role: Role;
  title: string;
  subtitle: string;
  icon: string;
  bgColor: string;
}

const ROLES: RoleOption[] = [
  { role: 'student', title: 'Student', subtitle: 'Priyank', icon: 'ðŸŽ“', bgColor: '#E9E6F7' },
  { role: 'professor', title: 'Professor', subtitle: 'Harshav', icon: 'ðŸ“–', bgColor: '#F5F0D0' },
  { role: 'admin', title: 'Admin / Dean', subtitle: 'Staff Portal', icon: 'ðŸ›ï¸', bgColor: '#D5E7DE' },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const { user, setAuth, token } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const buttonScale = new Animated.Value(1);

  const handleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;

    // In a real app the role would already be set by the backend during login.
    // This screen is primarily for demo purposes.
    if (user && token) {
      const updatedUser = { ...user, role: selectedRole };
      setAuth(updatedUser, token);
    }

    if (selectedRole === 'professor') {
      router.replace('/(professor)/dashboard');
    } else if (selectedRole === 'admin') {
      router.replace('/(admin)/analytics');
    } else {
      router.replace('/(student)/dashboard');
    }
  };

  const onPressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.92, useNativeDriver: true }).start();
  };

  const onPressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.headline}>I am a...</Text>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          {ROLES.map((item) => {
            const isSelected = selectedRole === item.role;
            return (
              <TouchableOpacity
                key={item.role}
                style={[
                  styles.card,
                  { backgroundColor: item.bgColor },
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => handleSelect(item.role)}
                activeOpacity={0.9}
              >
                <View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.iconCircle}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={[styles.nextButton, !selectedRole && styles.nextButtonDisabled]}
            onPress={handleContinue}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={!selectedRole}
            activeOpacity={1}
          >
            <Text style={styles.nextArrow}>â†’</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F5',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  headline: {
    fontWeight: '700',
    fontSize: 52,
    lineHeight: 56,
    color: '#1A1A1A',
    marginBottom: 32,
    letterSpacing: -1,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 24,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#1A1A1A',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 6,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 22,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontWeight: '500',
    fontSize: 14,
    color: '#5D605B',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
  },
  bottomAction: {
    alignItems: 'flex-end',
    marginTop: 32,
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 8,
  },
  nextButtonDisabled: {
    opacity: 0.3,
  },
  nextArrow: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '500',
  },
});

