import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert,
} from 'react-native';
import { attendanceService } from '../../services/attendance.service';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { Card } from '../../components/common/Card';

export default function AttendanceScreen() {
  const [students, setStudents] = useState<any[]>([]);
  const [classId] = useState('cse-5-a');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await attendanceService.getClassAttendance(classId);
        setStudents(data.students || []);
      } catch {
        setStudents(
          Array.from({ length: 15 }, (_, i) => ({
            id: String(i + 1),
            name: `Student ${i + 1}`,
            rollNo: `CSE${String(i + 1).padStart(3, '0')}`,
            status: 'present' as 'present' | 'absent',
          }))
        );
      }
    };
    fetch();
  }, []);

  const toggleStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: s.status === 'present' ? 'absent' : 'present' } : s
      )
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await attendanceService.markAttendance({
        classId,
        date: new Date().toISOString().split('T')[0],
        records: students.map((s) => ({ studentId: s.id, status: s.status })),
      });
      Alert.alert('Success', 'Attendance marked!');
    } catch {
      Alert.alert('Error', 'Failed to submit.');
    } finally {
      setLoading(false);
    }
  };

  const presentCount = students.filter((s) => s.status === 'present').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mark Attendance</Text>
        <Text style={styles.subtitle}>CSE Sem 5 · Section A</Text>

        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: '#D5E7DE' }]}>
            <Text style={styles.statValue}>{presentCount}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: '#F8E4E4' }]}>
            <Text style={styles.statValue}>{students.length - presentCount}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </Card>
        </View>

        {students.map((student) => (
          <TouchableOpacity
            key={student.id}
            style={styles.studentRow}
            onPress={() => toggleStatus(student.id)}
            activeOpacity={0.7}
          >
            <View style={styles.studentInfo}>
              <Text style={styles.rollNo}>{student.rollNo}</Text>
              <Text style={styles.studentName}>{student.name}</Text>
            </View>
            <View
              style={[
                styles.toggle,
                student.status === 'present' ? styles.togglePresent : styles.toggleAbsent,
              ]}
            >
              <Text style={styles.toggleText}>
                {student.status === 'present' ? 'P' : 'A'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>Submit Attendance</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  content: { padding: SPACING.lg, gap: 16, paddingTop: 60, paddingBottom: 120 },
  title: { fontFamily: FONTS.extraBold, fontSize: 32, color: '#1A1A1A' },
  subtitle: { fontFamily: FONTS.medium, fontSize: 14, color: '#6B6B6B' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, padding: SPACING.lg, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: FONTS.extraBold, fontSize: 32, color: '#1A1A1A' },
  statLabel: { fontFamily: FONTS.medium, fontSize: 12, color: '#5D605B' },
  studentRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rollNo: { fontFamily: FONTS.bold, fontSize: 12, color: '#6B6B6B', width: 60 },
  studentName: { fontFamily: FONTS.medium, fontSize: 15, color: '#1A1A1A' },
  toggle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  togglePresent: { backgroundColor: '#D5E7DE' },
  toggleAbsent: { backgroundColor: '#F8E4E4' },
  toggleText: { fontFamily: FONTS.bold, fontSize: 16, color: '#1A1A1A' },
  submitBtn: {
    position: 'absolute', bottom: 30, left: SPACING.lg, right: SPACING.lg,
    backgroundColor: '#1A1A1A', borderRadius: 28, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  submitText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFFFFF' },
});
