import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { Card } from '../common/Card';

interface ClubAlertWidgetProps {
  title: string;
  time: string;
  room: string;
  onPress: () => void;
}

export const ClubAlertWidget: React.FC<ClubAlertWidgetProps> = ({ title, time, room, onPress }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>CLUB ALERT</Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.arrow}>↗</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.details}>
          {time} · Room {room}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#D8EAE1', // aether-sage from reference
    minHeight: 160,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  content: {
    marginTop: SPACING.md,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 24,
    color: '#1A1A1A',
  },
  details: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 4,
  },
});
