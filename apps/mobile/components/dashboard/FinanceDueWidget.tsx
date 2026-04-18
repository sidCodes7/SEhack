import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { Card } from '../common/Card';

interface FinanceDueWidgetProps {
  amount: number;
  type: string;
  onPress: () => void;
}

export const FinanceDueWidget: React.FC<FinanceDueWidgetProps> = ({ amount, type, onPress }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>FINANCE DUE</Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.arrow}>↗</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.amount}>₹{amount}</Text>
        <View style={styles.typeRow}>
          <Text style={styles.type}>{type}</Text>
          <View style={styles.dot} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8E4E4', // aether-pink from reference
    flex: 1,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#1A1A1A',
    letterSpacing: 1,
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  content: {
    marginTop: 8,
  },
  amount: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: '#1A1A1A',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  type: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#6B6B6B',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
    marginLeft: 6,
  },
});
