import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, RefreshControl,
} from 'react-native';
import api from '../../../services/api';




export default function LeaveApprovalsScreen() {
  const [requests, setRequests] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPending = async () => {
    try {
      const data = (await api.get("/workflow/requests")).data.data;
      setRequests(data);
    } catch {
      setRequests([
        {
          id: '1', type: 'Room Booking', requesterName: 'Priyank Mehta',
          program: 'B.Tech', department: 'CSE', semester: 5,
          details: 'Room 302 Â· Apr 19, 10 AM',
        },
        {
          id: '2', type: 'Leave Request', requesterName: 'Ananya Shah',
          program: 'B.Tech', department: 'CSE', semester: 3,
          details: 'Apr 20-21 - Medical',
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
      await api.post(`/workflow/requests/${id}/approve`, { note: 'Approved' });
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      Alert.alert('Error', 'Failed to approve.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/workflow/requests/${id}/reject`, { note: 'Rejected' });
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
          <View key={req.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ fontWeight: '700', fontSize: 16, color: '#1A1A1A' }}>{req.requesterName}</Text>
                <Text style={{ fontWeight: '500', fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{req.type}</Text>
              </View>
              <Text style={{ fontSize: 12, color: '#6B6B6B' }}>{req.details}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={() => handleApprove(req.id)} style={{ flex: 1, backgroundColor: '#1A1A1A', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleReject(req.id)} style={{ flex: 1, backgroundColor: '#F4F4EF', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
                <Text style={{ color: '#1A1A1A', fontWeight: '700', fontSize: 14 }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  content: { padding: 24, gap: 24, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontWeight: '800', fontSize: 36, color: '#1A1A1A' },
  pendingBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F4F4EF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  pendingDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E74C3C',
  },
  pendingCount: { fontWeight: '700', fontSize: 16, color: '#1A1A1A' },
  pendingLabel: { fontWeight: '500', fontSize: 12, color: '#6B6B6B' },
});




