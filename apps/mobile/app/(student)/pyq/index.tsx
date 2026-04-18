import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import api from '../../../services/api';




export default function PYQScreen() {
  const [papers, setPapers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const years = [2025, 2024, 2023, 2022];

  const fetchPapers = async () => {
    try {
      const data = (await api.get(`/pyq/papers?q=${q}`)).data;
      setPapers(data);
    } catch {
      setPapers([
        { id: '1', subject: 'Data Structures', year: 2024, semester: 3, code: 'CS301', type: 'End Sem' },
        { id: '2', subject: 'Operating Systems', year: 2024, semester: 5, code: 'CS501', type: 'Mid Sem' },
        { id: '3', subject: 'Database Systems', year: 2023, semester: 4, code: 'CS401', type: 'End Sem' },
        { id: '4', subject: 'Computer Networks', year: 2023, semester: 5, code: 'CS502', type: 'End Sem' },
      ]);
    }
  };

  useEffect(() => { fetchPapers(); }, [selectedYear]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>PYQ Papers</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>ðŸ”</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by subjectâ€¦"
            placeholderTextColor="#A7A9BE"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={fetchPapers}
          />
        </View>

        {/* Year filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterPill, !selectedYear && styles.filterPillActive]}
            onPress={() => setSelectedYear(null)}
          >
            <Text style={[styles.filterText, !selectedYear && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {years.map((y) => (
            <TouchableOpacity
              key={y}
              style={[styles.filterPill, selectedYear === y && styles.filterPillActive]}
              onPress={() => setSelectedYear(y)}
            >
              <Text style={[styles.filterText, selectedYear === y && styles.filterTextActive]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        {papers.map((paper) => (
          <View key={paper.id} style={styles.paperCard}>
            <View style={styles.paperTop}>
              <View>
                <Text style={styles.paperSubject}>{paper.subject}</Text>
                <Text style={styles.paperMeta}>{paper.code} Â· Sem {paper.semester}</Text>
              </View>
              <View style={styles.yearBadge}>
                <Text style={styles.yearText}>{paper.year}</Text>
              </View>
            </View>
            <View style={styles.paperBottom}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{paper.type}</Text>
              </View>
              <TouchableOpacity style={styles.downloadBtn}>
                <Text style={styles.downloadIcon}>â¬‡</Text>
                <Text style={styles.downloadText}>Download</Text>
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
  content: { padding: 24, gap: 20, paddingTop: 60, paddingBottom: 100 },
  title: { fontWeight: '800', fontSize: 36, color: '#1A1A1A' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4 },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontWeight: '400', fontSize: 15, color: '#1A1A1A', paddingVertical: 12 },
  filters: { flexDirection: 'row' },
  filterPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F4F4EF', marginRight: 8 },
  filterPillActive: { backgroundColor: '#1A1A1A' },
  filterText: { fontWeight: '700', fontSize: 13, color: '#6B6B6B' },
  filterTextActive: { color: '#FFFFFF' },
  paperCard: { backgroundColor: '#FFFFFF', padding: 24, gap: 16 },
  paperTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  paperSubject: { fontWeight: '700', fontSize: 16, color: '#1A1A1A' },
  paperMeta: { fontWeight: '500', fontSize: 12, color: '#6B6B6B', marginTop: 4 },
  yearBadge: { backgroundColor: '#EAE7F8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  yearText: { fontWeight: '700', fontSize: 12, color: '#555461' },
  paperBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { backgroundColor: '#F5F0D0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  typeText: { fontWeight: '700', fontSize: 11, color: '#8B7D3A' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1A1A1A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  downloadIcon: { fontSize: 14, color: '#FFFFFF' },
  downloadText: { fontWeight: '700', fontSize: 12, color: '#FFFFFF' },
});



