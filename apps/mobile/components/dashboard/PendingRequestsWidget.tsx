import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { Card } from '../common/Card';

interface PendingRequestsWidgetProps {
  count: number;
  stages: string[];
  activeStageIndex: number;
}

export const PendingRequestsWidget: React.FC<PendingRequestsWidgetProps> = ({
  count,
  stages,
  activeStageIndex,
}) => {
  return (
    <Card style={styles.container}>
      <Text style={styles.label}>PENDING REQUESTS</Text>
      <View style={styles.content}>
        <Text style={styles.count}>{count}</Text>
        <View style={styles.rightSide}>
          <View style={styles.badgeContainer}>
            {stages.map((stage, index) => (
              <View key={stage} style={styles.badge}>
                <Text style={styles.badgeText}>{stage}</Text>
              </View>
            ))}
          </View>
          <View style={styles.progressBar}>
            {stages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressSegment,
                  index <= activeStageIndex ? styles.segmentActive : styles.segmentInactive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#1A1A1A',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  count: {
    fontFamily: FONTS.bold,
    fontSize: 48,
    color: '#1A1A1A',
    lineHeight: 48,
  },
  rightSide: {
    flex: 1,
    gap: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#F7F6F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#1A1A1A',
  },
  progressBar: {
    flexDirection: 'row',
    height: 6,
    gap: 4,
  },
  progressSegment: {
    flex: 1,
    borderRadius: 3,
  },
  segmentActive: {
    backgroundColor: '#1A1A1A',
  },
  segmentInactive: {
    backgroundColor: '#F7F6F2',
  },
});
