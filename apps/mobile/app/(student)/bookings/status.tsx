import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../services/api';
import { useWebSocket } from '../../../hooks/useWebSocket';





export default function BookingStatusScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const { socket } = useWebSocket();

  const fetchRequests = async () => {
    try {
      const data = (await api.get("/workflow/requests")).data.data;
      setRequests(data);
    } catch {
      // Fallback mock
      setRequests([{
        id: '1',
        type: 'Room Booking',
        status: 'in_progress',
        room: '302',
        department: 'CSE Dept',
        date: 'Apr 19, 10:00 AM â€“ 12:00 PM',
        purpose: 'Weekly AI Research Group Meeting & Presentation Rehearsal.',
        submittedDate: 'Apr 18',
        stages: [
          { name: 'HoD', status: 'approved', date: 'Apr 18' },
          { name: 'Stucco', status: 'pending', avgTime: '~2 hrs avg' },
          { name: 'Dean', status: 'waiting' },
        ],
        notes: [
          { author: 'Dr. Roberts', initials: 'DR', text: '"Approved. Please ensure the projector is turned off after use."', time: 'Apr 18, 2:15 PM' },
        ],
      }]);
    }
  };

  useEffect(() => {
    fetchRequests();
    if (socket) {
      socket.on('approval:updated', fetchRequests);
      return () => { socket.off('approval:updated', fetchRequests); };
    }
  }, [socket]);

  if (requests.length === 0) return null;
  const req = requests[0]; // Show first request detail for demo

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backArrow}>â†</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Room Booking</Text>
            <Text style={styles.subtitle}>Submitted {req.submittedDate} Â· Room {req.room}</Text>
          </View>
        </View>

        {/* Progress Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Request Status</Text>
            <Badge label="In Progress" variant="pending" />
          </View>
          <View />
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Room {req.room} Â· {req.department}</Text>
            <Text style={styles.detailsIcon}>ðŸ“‹</Text>
          </View>
          <Text style={styles.detailsTime}>{req.date}</Text>
          <Text style={styles.purposeLabel}>PURPOSE</Text>
          <Text style={styles.purposeText}>{req.purpose}</Text>
        </View>

        {/* Notes */}
        {req.notes?.map((note: any, i: number) => (
          <View key={i} style={styles.noteCard}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteIcon}>ðŸ“</Text>
              <Text style={styles.noteLabel}>HOD NOTE</Text>
            </View>
            <Text style={styles.noteText}>{note.text}</Text>
            <View style={styles.noteAuthor}>
              <View style={styles.noteInitials}>
                <Text style={styles.noteInitialsText}>{note.initials}</Text>
              </View>
              <Text style={styles.noteAuthorText}>{note.author} Â· {note.time}</Text>
            </View>
          </View>
        ))}

        {/* Cancel */}
        <TouchableOpacity style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel this request</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  scroll: { flex: 1 },
  content: { padding: 24, gap: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 40 },
  backBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4F4EF',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 20, color: '#1A1A1A' },
  title: { fontWeight: '700', fontSize: 28, color: '#1A1A1A' },
  subtitle: { fontWeight: '500', fontSize: 14, color: '#6B6B6B', marginTop: 2 },
  statusCard: { backgroundColor: '#FFFFFF', padding: 32 },
  statusHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  statusTitle: { fontWeight: '700', fontSize: 20, color: '#1A1A1A' },
  detailsCard: { backgroundColor: '#EAE7F8', padding: 32, gap: 12 },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailsTitle: { fontWeight: '700', fontSize: 20, color: '#1A1A1A', flex: 1 },
  detailsIcon: { fontSize: 20 },
  detailsTime: { fontWeight: '500', fontSize: 14, color: '#555461' },
  purposeLabel: {
    fontWeight: '700', fontSize: 10, color: '#555461',
    letterSpacing: 1, marginTop: 8,
  },
  purposeText: { fontWeight: '400', fontSize: 16, color: '#1A1A1A', lineHeight: 22 },
  noteCard: { backgroundColor: '#F5F0D0', padding: 32, gap: 12 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteIcon: { fontSize: 16 },
  noteLabel: { fontWeight: '700', fontSize: 12, color: '#1A1A1A', letterSpacing: 1 },
  noteText: {
    fontWeight: '400', fontSize: 16, color: '#1A1A1A',
    fontStyle: 'italic', lineHeight: 22,
  },
  noteAuthor: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  noteInitials: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  noteInitialsText: { fontWeight: '700', fontSize: 10, color: '#FFFFFF' },
  noteAuthorText: { fontWeight: '500', fontSize: 12, color: '#5D605B' },
  cancelBtn: { alignSelf: 'center', paddingVertical: 12 },
  cancelText: { fontWeight: '500', fontSize: 14, color: '#6B6B6B' },
});





