import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { approvalsService } from '../../services/approvals.service';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { Card } from '../../components/common/Card';

const REQUEST_TYPES = ['Room Booking', 'Leave', 'Certificate'] as const;

export default function SubmitRequestScreen() {
  const router = useRouter();
  const [type, setType] = useState<string>('Room Booking');
  const [room, setRoom] = useState('Conference Room A');
  const [date, setDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!date || !purpose) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      await approvalsService.submitRequest({
        type: type.toLowerCase().replace(' ', '_') as 'room_booking' | 'certificate' | 'leave',
        details: { room, date, fromTime, toTime, purpose },
      });
      Alert.alert('Success', 'Request submitted!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Request</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Request type pills */}
        <Text style={styles.sectionLabel}>REQUEST TYPE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
          {REQUEST_TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.pill,
                type === t && styles.pillActive,
                t === 'Leave' && styles.pillLeave,
                t === 'Certificate' && styles.pillCert,
              ]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.pillText, type === t && styles.pillTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Form card */}
        <Card style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>Room</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>{room}</Text>
              <Text style={styles.chevron}>⌄</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.dateInput}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{date || 'Select date'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeField}>
              <Text style={styles.label}>From</Text>
              <TouchableOpacity style={styles.timeInput}>
                <Text style={styles.timeText}>{fromTime || '09:00 AM'}</Text>
                <Text style={styles.timeIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeField}>
              <Text style={styles.label}>To</Text>
              <TouchableOpacity style={styles.timeInput}>
                <Text style={styles.timeText}>{toTime || '11:00 AM'}</Text>
                <Text style={styles.timeIcon}>🕐</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Purpose</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Briefly describe the reason for booking…"
              placeholderTextColor="#A7A9BE"
              multiline
              numberOfLines={4}
              value={purpose}
              onChangeText={setPurpose}
              textAlignVertical="top"
            />
          </View>
        </Card>

        {/* Approval chain */}
        <Text style={styles.sectionLabel}>APPROVAL CHAIN</Text>
        <View style={styles.chainRow}>
          {['HOD', 'STUCCO', 'DEAN'].map((stage, i) => (
            <React.Fragment key={stage}>
              <View style={styles.chainNode}>
                <View style={styles.chainCircle}>
                  <Text style={styles.chainIcon}>👤</Text>
                </View>
                <Text style={styles.chainLabel}>{stage}</Text>
              </View>
              {i < 2 && <Text style={styles.chainArrow}>→</Text>}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      {/* Submit FAB */}
      <TouchableOpacity
        style={[styles.submitFab, loading && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitArrow}>→</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 24, color: '#1A1A1A' },
  title: { fontFamily: FONTS.bold, fontSize: 28, color: '#1A1A1A' },
  scroll: { flex: 1 },
  content: { padding: SPACING.lg, gap: 24, paddingBottom: 120 },
  sectionLabel: {
    fontFamily: FONTS.bold, fontSize: 11, color: '#5D605B',
    letterSpacing: 1.2, marginBottom: 8,
  },
  pills: { flexDirection: 'row', marginBottom: 8 },
  pill: {
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24,
    backgroundColor: '#1A1A1A', marginRight: 10,
  },
  pillActive: { backgroundColor: '#1A1A1A' },
  pillLeave: { backgroundColor: '#F4F4EF' },
  pillCert: { backgroundColor: '#F8E4E4' },
  pillText: { fontFamily: FONTS.bold, fontSize: 13, color: '#FFFFFF' },
  pillTextActive: { color: '#FFFFFF' },
  formCard: { backgroundColor: '#FFFFFF', padding: SPACING.xl, gap: 24 },
  field: { gap: 8 },
  label: { fontFamily: FONTS.medium, fontSize: 12, color: '#5D605B' },
  dropdown: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F4F4EF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  dropdownText: { fontFamily: FONTS.medium, fontSize: 16, color: '#1A1A1A' },
  chevron: { fontSize: 20, color: '#6B6B6B' },
  dateInput: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F4F4EF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  dateIcon: { fontSize: 18 },
  dateText: { fontFamily: FONTS.medium, fontSize: 16, color: '#1A1A1A' },
  timeRow: { flexDirection: 'row', gap: 16 },
  timeField: { flex: 1, gap: 8 },
  timeInput: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F4F4EF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  timeText: { fontFamily: FONTS.medium, fontSize: 16, color: '#1A1A1A' },
  timeIcon: { fontSize: 16 },
  textArea: {
    backgroundColor: '#F4F4EF', borderRadius: 12, padding: 16,
    fontFamily: FONTS.regular, fontSize: 14, color: '#1A1A1A',
    minHeight: 100,
  },
  chainRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  chainNode: { alignItems: 'center', gap: 6 },
  chainCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4F4EF',
    justifyContent: 'center', alignItems: 'center',
  },
  chainIcon: { fontSize: 20 },
  chainLabel: { fontFamily: FONTS.bold, fontSize: 10, color: '#6B6B6B', letterSpacing: 0.5 },
  chainArrow: {
    fontSize: 16, color: '#B0B3AD', marginHorizontal: 12, marginBottom: 20,
  },
  submitFab: {
    position: 'absolute', bottom: 40, right: SPACING.lg,
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  submitArrow: { color: '#FFFFFF', fontSize: 28 },
});
