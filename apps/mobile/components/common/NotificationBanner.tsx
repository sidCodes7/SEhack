import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { globalStyles } from '../../styles/global';

interface NotificationBannerProps {
  title: string;
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  title,
  message,
  visible,
  onHide,
  duration = 3000,
}) => {
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }, globalStyles.shadow]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 8,
    padding: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    zIndex: 1000,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    marginBottom: 4,
  },
  message: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
});
