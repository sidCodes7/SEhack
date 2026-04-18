import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

interface ApprovalCardProps {
  requesterName: string;
  requestType: 'Room Booking' | 'Leave Request' | 'Certificate';
  program: string;
  department: string;
  semester: number;
  details: string;
  onApprove: () => void;
  onReject: () => void;
  noteValue?: string;
  onNoteChange?: (text: string) => void;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  requesterName,
  requestType,
  program,
  department,
  semester,
  details,
  onApprove,
  onReject,
}) => {
  const badgeColor = requestType === 'Room Booking' ? '#F5F0D0' :
                     requestType === 'Leave Request' ? '#F8E4E4' : '#EAE7F8';
  const badgeTextColor = requestType === 'Room Booking' ? '#8B7D3A' :
                         requestType === 'Leave Request' ? '#A36666' : '#555461';

  return (
    <Card style={styles.card}>
      {/* Top section */}
      <View style={styles.topSection}>
        <Avatar name={requesterName} size={56} />
        <View style={styles.nameSection}>
          <Text style={styles.name}>{requesterName}</Text>
          <Text style={styles.info}>{program}</Text>
          <Text style={styles.info}>{department} · Sem {semester}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: badgeColor }]}>
          <Text style={[styles.typeText, { color: badgeTextColor }]}>{requestType}</Text>
        </View>
      </View>

      {/* Details pill */}
      <View style={styles.detailsPill}>
        <Text style={styles.detailsText}>{details}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.approveBtn} onPress={onApprove}>
          <Text style={styles.approveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  nameSection: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: '#1A1A1A',
  },
  info: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 18,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  detailsPill: {
    backgroundColor: '#F4F4EF',
    borderRadius: 12,
    padding: SPACING.md,
  },
  detailsText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#1A1A1A',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E1E3DD',
    alignItems: 'center',
  },
  rejectText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#1A1A1A',
  },
  approveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  approveText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
