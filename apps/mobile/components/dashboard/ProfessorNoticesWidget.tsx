import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { FONTS } from '../../constants/typography';
import { Card } from '../common/Card';

interface Notice {
  id: string;
  title: string;
  time: string;
  icon: string;
}

interface ProfessorNoticesWidgetProps {
  notices: Notice[];
  onPublish: () => void;
}

export const ProfessorNoticesWidget: React.FC<ProfessorNoticesWidgetProps> = ({
  notices,
  onPublish,
}) => {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notices</Text>
        <TouchableOpacity style={styles.publishBtn} onPress={onPublish}>
          <Text style={styles.publishIcon}>+</Text>
          <Text style={styles.publishText}>Publish New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {notices.map((notice, index) => (
          <TouchableOpacity
            key={notice.id}
            style={[styles.item, index === notices.length - 1 && styles.lastItem]}
          >
            <View style={styles.itemIcon}>
              <Text style={styles.iconTxt}>{notice.icon}</Text>
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{notice.title}</Text>
              <Text style={styles.itemTime}>{notice.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#1A1A1A',
  },
  publishBtn: {
    backgroundColor: '#D5E7DE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  publishIcon: {
    fontSize: 18,
    color: '#45554F',
    fontWeight: '600',
  },
  publishText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: '#45554F',
  },
  list: {
    gap: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4EF',
    paddingBottom: 20,
  },
  lastItem: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F4EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconTxt: {
    fontSize: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  itemTime: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#5D605B',
    marginTop: 4,
  },
});
