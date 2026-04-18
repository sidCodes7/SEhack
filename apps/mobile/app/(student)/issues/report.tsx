import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import api from '../../../services/api';




const CATEGORIES = ['Electrical', 'Plumbing', 'Infrastructure', 'Cleanliness', 'Safety', 'Other'];
const BUILDINGS = ['Main Block', 'Lab Complex', 'Library', 'Hostel A', 'Hostel B', 'Canteen'];

export default function ReportIssueScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [building, setBuilding] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title || !category || !building) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('building', building);
      if (image) {
        formData.append('image', { uri: image, type: 'image/jpeg', name: 'issue.jpg' } as any);
      }
      (await api.post("/issues", data)).data;
      Alert.alert('Success', 'Issue reported!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to report issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.back}>â†</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Report Issue</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput style={styles.input} placeholder="What's the issue?" placeholderTextColor="#A7A9BE" value={title} onChangeText={setTitle} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Building</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {BUILDINGS.map((b) => (
                <TouchableOpacity key={b} style={[styles.chip, building === b && styles.chipActive]} onPress={() => setBuilding(b)}>
                  <Text style={[styles.chipText, building === b && styles.chipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.textArea} placeholder="Provide more detailsâ€¦" placeholderTextColor="#A7A9BE" multiline numberOfLines={4} value={description} onChangeText={setDescription} textAlignVertical="top" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Photo</Text>
            <View style={styles.photoRow}>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Text style={styles.photoBtnIcon}>ðŸ“·</Text>
                <Text style={styles.photoBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                <Text style={styles.photoBtnIcon}>ðŸ–¼ï¸</Text>
                <Text style={styles.photoBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
            {image && <Text style={styles.imageAttached}>âœ“ Image attached</Text>}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={[styles.submitFab, loading && { opacity: 0.5 }]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitArrow}>â†’</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  back: { fontSize: 24, color: '#1A1A1A' },
  title: { fontWeight: '700', fontSize: 28, color: '#1A1A1A' },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  formCard: { backgroundColor: '#FFFFFF', padding: 32, gap: 24 },
  field: { gap: 8 },
  label: { fontWeight: '500', fontSize: 12, color: '#5D605B' },
  input: { backgroundColor: '#F4F4EF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontWeight: '400', fontSize: 16, color: '#1A1A1A' },
  textArea: { backgroundColor: '#F4F4EF', borderRadius: 12, padding: 16, fontWeight: '400', fontSize: 14, color: '#1A1A1A', minHeight: 100 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F4F4EF', marginRight: 8 },
  chipActive: { backgroundColor: '#1A1A1A' },
  chipText: { fontWeight: '500', fontSize: 13, color: '#6B6B6B' },
  chipTextActive: { color: '#FFFFFF' },
  photoRow: { flexDirection: 'row', gap: 12 },
  photoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F4F4EF', borderRadius: 12, paddingVertical: 14 },
  photoBtnIcon: { fontSize: 20 },
  photoBtnText: { fontWeight: '500', fontSize: 13, color: '#1A1A1A' },
  imageAttached: { fontWeight: '500', fontSize: 13, color: '#45554F', marginTop: 4 },
  submitFab: { position: 'absolute', bottom: 40, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  submitArrow: { color: '#FFFFFF', fontSize: 28 },
});



