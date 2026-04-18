import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';

type BadgeStatus = 'pending' | 'approved' | 'rejected' | 'default';

interface BadgeProps {
  label: string;
  status?: BadgeStatus;
}

export const Badge: React.FC<BadgeProps> = ({ label, status = 'default' }) => {
  const getBackgroundColor = () => {
    switch (status) {
      case 'approved': return COLORS.success;
      case 'rejected': return COLORS.error;
      case 'pending': return COLORS.warning;
      default: return COLORS.surfaceElevated;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor() }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
});
