import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { Card } from '../common/Card';

interface ActionItem {
  id: string;
  name: string;
  icon: string;
  bgColor: string;
  onPress: () => void;
}

interface QuickActionsWidgetProps {
  actions: ActionItem[];
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ actions }) => {
  return (
    <Card style={styles.container}>
      <Text style={styles.label}>MINI APPS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {actions.map((item) => (
          <TouchableOpacity key={item.id} style={styles.actionItem} onPress={item.onPress}>
            <View style={[styles.iconBox, { backgroundColor: item.bgColor }]}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <Text style={styles.itemName}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingBottom: SPACING.md,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#1A1A1A',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  scroll: {
    flexDirection: 'row',
  },
  actionItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 64,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 24,
  },
  itemName: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#1A1A1A',
    textAlign: 'center',
  },
});
