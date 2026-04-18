import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { Card } from '../common/Card';

interface KarmaScoreWidgetProps {
  score: number;
  percentile: number;
}

export const KarmaScoreWidget: React.FC<KarmaScoreWidgetProps> = ({ score, percentile }) => {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>KARMA SCORE</Text>
      <View style={styles.bottomRow}>
        <View style={styles.scoreRow}>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.pts}>pts</Text>
        </View>
        <View style={styles.progressCircle}>
          <View style={[styles.progressInner, { height: `${percentile}%` }]} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F0D0', // aether-cream from reference
    flex: 1,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#1A1A1A',
    letterSpacing: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#1A1A1A',
  },
  pts: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#6B6B6B',
    marginLeft: 4,
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  progressInner: {
    backgroundColor: COLORS.karmaGold,
    width: '100%',
  },
});
