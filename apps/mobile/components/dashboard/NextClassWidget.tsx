import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { Card } from '../common/Card';

interface NextClassWidgetProps {
  courseName: string;
  time: string;
  room: string;
  professor: string;
  onPress: () => void;
}

export const NextClassWidget: React.FC<NextClassWidgetProps> = ({
  courseName,
  time,
  room,
  professor,
  onPress,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>NEXT CLASS</Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.arrow}>↗</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.courseName}>{courseName}</Text>
        <Text style={styles.details}>
          {time} · Room {room} · {professor}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#EAE7F8', // aether-lavender from reference
    minHeight: 180,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#1A1A1A',
    letterSpacing: 1.2,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  content: {
    marginTop: SPACING.md,
  },
  courseName: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: '#1A1A1A',
    lineHeight: 36,
  },
  details: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 8,
  },
});
