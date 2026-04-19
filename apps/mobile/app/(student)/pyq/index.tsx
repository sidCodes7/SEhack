import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import { colors } from '../../../constants/colors';
import { spacing } from '../../../constants/spacing';
import { typography } from '../../../constants/typography';

const MOCK_PAPERS = [
  { id: 1, subject: 'Data Structures', exam: 'End Sem 2023', dept: 'CSE Dept', pages: 48, format: 'PDF', color: colors.cardLavender, difficulty: 'Hard' },
  { id: 2, subject: 'Database Management', exam: 'Mid Sem 2023', dept: 'CSE Dept', pages: 32, format: 'PDF', color: '#F0EDE7', difficulty: 'Medium' },
  { id: 3, subject: 'Operating Systems', exam: 'End Sem 2022', dept: 'CSE Dept', pages: 56, format: 'PDF', color: colors.surface, difficulty: 'Hard' },
];

const YEARS = ['All', '2024', '2023', '2022', '2021'];

export default function PYQScreen() {
  const [papers] = useState(MOCK_PAPERS);
  const [search, setSearch] = useState('');
  const [activeYear, setActiveYear] = useState('All');
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const filtered = papers.filter(p => {
    const matchSearch = !search || p.subject.toLowerCase().includes(search.toLowerCase());
    const matchYear = activeYear === 'All' || p.exam.includes(activeYear);
    return matchSearch && matchYear;
  });

  const getAiStudyTips = (paper: any) => {
    setAiLoading(true);
    setAiTip(null);
    setTimeout(() => {
      setAiTip('Focus on core concepts, practice previous papers, and review lecture notes. Start with the most weighted topics like Trees and Graphs for Database indexing.');
      setAiLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.title}>Past{'\n'}Papers</Text>

        {/* DSpace integration */}
        <View style={styles.dspaceCard}>
          <View style={styles.dspaceHeader}>
            <View style={styles.dspaceDot} />
            <Text style={styles.dspaceLabel}>DSpace Integration</Text>
          </View>
          <Text style={styles.dspaceUrl}>📡 dspace.spit.ac.in/xmlui</Text>
          <View style={styles.dspaceStats}>
            <View>
              <Text style={styles.dstatNum}>847</Text>
              <Text style={styles.dstatLabel}>Papers Indexed</Text>
            </View>
            <View>
              <Text style={styles.dstatNum}>12</Text>
              <Text style={styles.dstatLabel}>Departments</Text>
            </View>
            <View>
              <Text style={styles.dstatNum}>2h ago</Text>
              <Text style={styles.dstatLabel}>Last Sync</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>○</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search subject, year..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {YEARS.map(y => (
            <TouchableOpacity 
              key={y} 
              style={[styles.filterChip, activeYear === y && styles.filterChipActive]}
              onPress={() => setActiveYear(y)}
            >
              <Text style={[styles.filterText, activeYear === y && styles.filterTextActive]}>{y}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* AI Tip */}
        {(aiTip || aiLoading) && (
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiIcon}>✦</Text>
              <Text style={styles.aiLabel}>Grok AI Study Tips</Text>
            </View>
            {aiLoading ? (
               <View style={{height: 40, justifyContent:'center'}}><Text style={{color:colors.textMuted, fontSize:12}}>Generating tips...</Text></View>
            ) : (
              <Text style={styles.aiText}>{aiTip}</Text>
            )}
          </View>
        )}

        {/* Papers */}
        {filtered.map(paper => (
          <View key={paper.id} style={[styles.paperCard, { backgroundColor: paper.color }]}>
            <View style={styles.paperContent}>
              <Text style={styles.paperSubject}>{paper.subject}</Text>
              <Text style={styles.paperMeta}>{paper.exam} · {paper.dept}</Text>
              <View style={styles.badgesRow}>
                <View style={styles.badge}><Text style={styles.badgeText}>{paper.pages} PAGES</Text></View>
                <View style={styles.badge}><Text style={styles.badgeText}>{paper.format}</Text></View>
                <View style={[styles.badge, {backgroundColor: 'rgba(255,255,255,0.6)'}]}>
                   <Text style={[styles.badgeText, {color: colors.textPrimary}]}>⚡ {paper.difficulty}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.paperActions}>
              <TouchableOpacity style={styles.downloadBtn}>
                <Text style={{fontSize: 20}}>↓</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.aiTipBtn} onPress={() => getAiStudyTips(paper)}>
                <Text style={{fontSize: 12, color: colors.accentGold}}>✦</Text>
                <Text style={styles.aiTipBtnText}>Tips</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{fontSize: 32, marginBottom: 8}}>📄</Text>
            <Text style={{color: colors.textSecondary}}>No papers found</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.screenPadding, paddingTop: 60 },
  title: { fontSize: 40, fontWeight: '800', color: colors.textPrimary, lineHeight: 44, marginBottom: spacing.lg },

  dspaceCard: { backgroundColor: '#1A1A1A', borderRadius: spacing.cardRadius, padding: spacing.cardPadding, marginBottom: spacing.md },
  dspaceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  dspaceDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  dspaceLabel: { color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  dspaceUrl: { color: colors.textMuted, fontSize: 13, marginBottom: 20 },
  dspaceStats: { flexDirection: 'row', justifyContent: 'space-between' },
  dstatNum: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  dstatLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '500', marginTop: 2 },

  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 16 },
  searchIcon: { fontSize: 20, color: colors.textMuted, marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16, color: colors.textPrimary },

  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.textWhite },

  aiCard: { backgroundColor: colors.cardLavender, borderRadius: spacing.cardRadius, padding: 16, marginBottom: 16 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiIcon: { color: colors.accentGold, fontSize: 14 },
  aiLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.textSecondary },
  aiText: { fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textPrimary },

  paperCard: { flexDirection: 'row', borderRadius: spacing.cardRadius, padding: 16, marginBottom: 12 },
  paperContent: { flex: 1 },
  paperSubject: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  paperMeta: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  badgesRow: { flexDirection: 'row', gap: 6 },
  badge: { backgroundColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', color: colors.textSecondary },

  paperActions: { alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16 },
  downloadBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  aiTipBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 8 },
  aiTipBtnText: { fontSize: 10, fontWeight: '700', color: colors.accentGold },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
});
