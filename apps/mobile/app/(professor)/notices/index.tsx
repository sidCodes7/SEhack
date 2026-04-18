import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { Card } from '../../components/common/Card';

export default function NoticesScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [department, setDepartment] = useState('CSE');
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!title || !content) {
      Alert.alert('Validation', 'Title and content are required.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/notices', { title, content, targetRole, department });
      Alert.alert('Published', 'Notice sent successfully!', [
        { text: 'OK', onPress: () => { setTitle(''); setContent(''); } },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to publish.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Publish Notice</Text>

        <Card style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} placeholder="Notice title…" placeholderTextColor="#A7A9BE" value={title} onChangeText={setTitle} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={styles.textArea} placeholder="Write your notice…"
              placeholderTextColor="#A7A9BE" multiline numberOfLines={6}
              value={content} onChangeText={setContent} textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Target</Text>
            <View style={styles.pills}>
              {['all', 'student', 'professor'].map((r) => (
                <TouchableOpacity key={r} style={[styles.pill, targetRole === r && styles.pillActive]} onPress={() => setTargetRole(r)}>
                  <Text style={[styles.pillText, targetRole === r && styles.pillTextActive]}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Department</Text>
            <View style={styles.pills}>
              {['CSE', 'ECE', 'ME', 'All'].map((d) => (
                <TouchableOpacity key={d} style={[styles.pill, department === d && styles.pillActive]} onPress={() => setDepartment(d)}>
                  <Text style={[styles.pillText, department === d && styles.pillTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>
      </ScrollView>

      <TouchableOpacity
        style={[styles.publishBtn, loading && { opacity: 0.5 }]}
        onPress={handlePublish} disabled={loading}
      >
        <Text style={styles.publishText}>Publish Notice</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  content: { padding: SPACING.lg, gap: 24, paddingTop: 60, paddingBottom: 120 },
  title: { fontFamily: FONTS.extraBold, fontSize: 32, color: '#1A1A1A' },
  formCard: { backgroundColor: '#FFFFFF', padding: SPACING.xl, gap: 24 },
  field: { gap: 8 },
  label: { fontFamily: FONTS.medium, fontSize: 12, color: '#5D605B' },
  input: { backgroundColor: '#F4F4EF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontFamily: FONTS.regular, fontSize: 16, color: '#1A1A1A' },
  textArea: { backgroundColor: '#F4F4EF', borderRadius: 12, padding: 16, fontFamily: FONTS.regular, fontSize: 14, color: '#1A1A1A', minHeight: 140 },
  pills: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F4F4EF' },
  pillActive: { backgroundColor: '#1A1A1A' },
  pillText: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B6B6B' },
  pillTextActive: { color: '#FFFFFF' },
  publishBtn: {
    position: 'absolute', bottom: 30, left: SPACING.lg, right: SPACING.lg,
    backgroundColor: '#1A1A1A', borderRadius: 28, paddingVertical: 18, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  publishText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFFFFF' },
});
