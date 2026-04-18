import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, RefreshControl,
} from 'react-native';
import { approvalsService } from '../../services/approvals.service';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { COLORS } from '../../constants/colors';
import { ApprovalCard } from '../../components/approvals/ApprovalCard';

export default function LeaveApprovalsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPending = async () => {
    try {
      const data = await approvalsService.getPending();
      setRequests(data);
    } catch {
      setRequests([
        {
          id: '1', type: 'Room Booking', requesterName: 'Priyank Mehta',
          program: 'B.Tech', department: 'CSE', semester: 5,
          details: 'Room 302 · Apr 19, 10 AM',
        },
        {
          id: '2', type: 'Leave Request', requesterName: 'Ananya Shah',
          program: 'B.Tech', department: 'CSE', semester: 3,
          details: 'Apr 20–21 · Medical',
        },
      ]);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPending();
    setRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    try {
      await approvalsService.approve(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      Alert.alert('Error', 'Failed to approve.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await approvalsService.reject(id, 'Rejected by professor');
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      Alert.alert('Error', 'Failed to reject.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Approvals</Text>
          <View style={styles.pendingBadge}>
            <View style={styles.pendingDot} />
            <Text style={styles.pendingCount}>{requests.length}</Text>
            <Text style={styles.pendingLabel}>pending</Text>
          </View>
        </View>

        {/* Cards */}
        {requests.map((req) => (
          <ApprovalCard
            key={req.id}
            requesterName={req.requesterName}
            requestType={req.type}
            program={req.program}
            department={req.department}
            semester={req.semester}
            details={req.details}
            onApprove={() => handleApprove(req.id)}
            onReject={() => handleReject(req.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  content: { padding: SPACING.lg, gap: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontFamily: FONTS.extraBold, fontSize: 36, color: '#1A1A1A' },
  pendingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F4F4EF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  pendingDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error,
  },
  pendingCount: { fontFamily: FONTS.bold, fontSize: 16, color: '#1A1A1A' },
  pendingLabel: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B6B6B' },
});
