import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { Card } from '../common/Card';

interface AttendanceTrendWidgetProps {
  percentage: number;
  courseDetails: string;
  dataPoints: number[]; // relative heights for bars
  onPress: () => void;
}

export const AttendanceTrendWidget: React.FC<AttendanceTrendWidgetProps> = ({
  percentage,
  courseDetails,
  dataPoints,
  onPress,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>ATTENDANCE TREND</Text>
          <Text style={styles.percentage}>{percentage}%</Text>
          <Text style={styles.details}>{courseDetails}</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartContainer}>
        {dataPoints.map((point, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              { height: point * 0.8 },
              index === 3 && styles.barHighlight, // simulate highlight for current day
            ]}
          >
            <Text style={[styles.day, index === 3 && styles.dayActive]}>
              {['M', 'T', 'W', 'T', 'F'][index]}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EAE7F8',
    minHeight: 220,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#555461',
    letterSpacing: 1,
    marginBottom: 8,
  },
  percentage: {
    fontFamily: FONTS.bold,
    fontSize: 56,
    color: '#1A1A1A',
    lineHeight: 60,
  },
  details: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#555461',
    marginTop: 4,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  arrow: {
    color: '#1A1A1A',
    fontSize: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  bar: {
    width: '16%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  barHighlight: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  day: {
    position: 'absolute',
    bottom: -20,
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#555461',
  },
  dayActive: {
    color: '#1A1A1A',
  },
});
