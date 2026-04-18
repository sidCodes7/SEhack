import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity,
} from 'react-native';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';

export default function FollowUpsScreen() {
  const [note, setNote] = useState('');
  const [flaggedStudents, setFlaggedStudents] = useState([
    { id: '1', name: 'Arjun Patel', rollNo: 'CSE042', reason: 'Low attendance (< 60%)', date: 'Apr 15', severity: 'high' },
    { id: '2', name: 'Meera Joshi', rollNo: 'CSE018', reason: 'Missed 3 consecutive labs', date: 'Apr 17', severity: 'medium' },
  ]);

  const handleAddFlag = () => {
    if (!note.trim()) return;
    setFlaggedStudents((prev) => [
      {
        id: Date.now().toString(),
        name: 'New Student',
        rollNo: 'CSE---',
        reason: note,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        severity: 'low',
      },
      ...prev,
    ]);
    setNote('');
  };

  const severityColor: Record<string, string> = {
    high: '#F8E4E4',
    medium: '#F5F0D0',
    low: '#D5E7DE',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Follow-ups</Text>
        <Text style={styles.subtitle}>{flaggedStudents.length} students flagged</Text>

        {/* Add new flag */}
        <Card style={styles.addCard}>
          <TextInput
            style={styles.input}
            placeholder="Add a follow-up note…"
            placeholderTextColor="#A7A9BE"
            value={note}
            onChangeText={setNote}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddFlag}>
            <Text style={styles.addBtnText}>+ Flag Student</Text>
          </TouchableOpacity>
        </Card>

        {/* Flagged students list */}
        {flaggedStudents.map((student) => (
          <Card key={student.id} style={styles.studentCard}>
            <View style={styles.studentTop}>
              <Avatar name={student.name} size={44} />
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentRoll}>{student.rollNo}</Text>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: severityColor[student.severity] }]}>
                <Text style={styles.severityText}>{student.severity}</Text>
              </View>
            </View>
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonText}>{student.reason}</Text>
              <Text style={styles.dateText}>Flagged {student.date}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  content: { padding: SPACING.lg, gap: 20, paddingTop: 60, paddingBottom: 100 },
  title: { fontFamily: FONTS.extraBold, fontSize: 32, color: '#1A1A1A' },
  subtitle: { fontFamily: FONTS.medium, fontSize: 14, color: '#6B6B6B', marginTop: -12 },
  addCard: { backgroundColor: '#FFFFFF', padding: SPACING.lg, gap: 12 },
  input: {
    backgroundColor: '#F4F4EF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontFamily: FONTS.regular, fontSize: 15, color: '#1A1A1A',
  },
  addBtn: {
    backgroundColor: '#1A1A1A', borderRadius: 24, paddingVertical: 14, alignItems: 'center',
  },
  addBtnText: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
  studentCard: { backgroundColor: '#FFFFFF', padding: SPACING.lg, gap: 14 },
  studentTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  studentInfo: { flex: 1 },
  studentName: { fontFamily: FONTS.bold, fontSize: 16, color: '#1A1A1A' },
  studentRoll: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  severityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  severityText: { fontFamily: FONTS.bold, fontSize: 10, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: 0.5 },
  reasonContainer: { backgroundColor: '#F4F4EF', borderRadius: 12, padding: 14 },
  reasonText: { fontFamily: FONTS.medium, fontSize: 14, color: '#1A1A1A' },
  dateText: { fontFamily: FONTS.regular, fontSize: 11, color: '#6B6B6B', marginTop: 6 },
});
