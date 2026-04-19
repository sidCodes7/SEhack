import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../constants/colors';
import { spacing } from '../../../constants/spacing';
import * as SecureStore from 'expo-secure-store';

const MOCK_ISSUES = [
  { id: 1, title: 'Projector broken', location: 'Lab 302 Building C', status: 'open', time: '2 hrs ago', aiPriority: 'P1' },
  { id: 2, title: 'AC not working', location: 'Seminar Hall Building B', status: 'in_progress', time: '5 hrs ago', aiPriority: 'P2' },
  { id: 3, title: 'Water leakage', location: 'Corridor Building A', status: 'resolved', time: '1 day ago', aiPriority: 'P1' },
];

const BUILDINGS = [
  { name: 'Bldg A', x: '25%', y: '30%', severity: 'normal' },
  { name: 'Bldg B', x: '65%', y: '40%', severity: 'high' },
  { name: 'Bldg C', x: '40%', y: '68%', severity: 'critical' },
];

const PRIORITY_COLORS: Record<string, string> = { P1: '#E53836', P2: '#D4A843', P3: '#2CB67D' };

export default function HeatmapScreen() {
  const router = useRouter();
  const [issues] = useState(MOCK_ISSUES);
  const [aiAnalysis, setAiAnalysis] = useState('Building C has the most critical issues (5 reported). Prioritize the broken projector in Lab 302 and water leakage in Building A corridor for immediate action.');
  const [analyzing, setAnalyzing] = useState(false);
  const [role, setRole] = useState('student');

  useEffect(() => {
    SecureStore.getItemAsync('user').then(u => {
      if (u) setRole(JSON.parse(u).role);
    });
  }, []);

  const getStatusStyle = (status: string) => {
    if (status === 'open') return { bg: '#F8E4E4', color: '#E53836', text: 'Open' };
    if (status === 'in_progress') return { bg: '#FDF4DD', color: '#D4A843', text: 'In Progress' };
    return { bg: '#D8EAE1', color: '#2CB67D', text: 'Resolved' };
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.title}>Issues</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={{ fontSize: 18 }}>◎</Text>
          </TouchableOpacity>
        </View>

        {/* AI Insight */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiIcon}>✦</Text>
            <Text style={styles.aiLabel}>Grok Campus Health</Text>
          </View>
          <Text style={styles.aiText}>{aiAnalysis}</Text>
        </View>

        {/* Map */}
        <View style={styles.mapCard}>
          <View style={styles.mapCanvas}>
            {/* simple grid background */}
            <View style={{ flex: 1, borderWidth: 1, borderColor: colors.borderLight }}>
              <View style={[styles.gridLine, { top: '25%' }]} />
              <View style={[styles.gridLine, { top: '50%' }]} />
              <View style={[styles.gridLine, { top: '75%' }]} />
              <View style={[styles.gridLineVertical, { left: '33%' }]} />
              <View style={[styles.gridLineVertical, { left: '66%' }]} />
              
              {BUILDINGS.map(b => (
                <View key={b.name} style={[styles.marker, { left: b.x as any, top: b.y as any, backgroundColor: b.severity === 'critical' ? '#E53836' : b.severity === 'high' ? '#D4A843' : '#2CB67D' }]}>
                   <Text style={{fontSize:8, color:'#FFF', fontWeight:'700', paddingHorizontal: 4}}>{b.name}</Text>
                   {b.severity === 'critical' && <View style={styles.pulseRing} />}
                </View>
              ))}
            </View>
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.ldot, {backgroundColor:'#E53836'}]}/><Text style={styles.legendText}>Critical</Text></View>
            <View style={styles.legendItem}><View style={[styles.ldot, {backgroundColor:'#D4A843'}]}/><Text style={styles.legendText}>High</Text></View>
            <View style={styles.legendItem}><View style={[styles.ldot, {backgroundColor:'#2CB67D'}]}/><Text style={styles.legendText}>Normal</Text></View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.cardGreen }]}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Open{'\n'}Issues</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.cardPink }]}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
        </View>

        {/* Recent list */}
        <Text style={styles.recentTitle}>Recent Issues</Text>
        {issues.map((issue, i) => {
          const s = getStatusStyle(issue.status);
          const pCol = PRIORITY_COLORS[issue.aiPriority];
          return (
            <View key={i} style={styles.issueCard}>
              <View style={styles.issueTop}>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <View style={styles.badgeRow}>
                  {/* AI Badge */}
                  <View style={[styles.priorityBadge, { backgroundColor: `${pCol}15`, borderColor: `${pCol}30` }]}>
                    <Text style={{ fontSize: 10, color: pCol }}>✦ {issue.aiPriority}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: s.color }]}>{s.text}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.issueLoc}>📍 {issue.location}</Text>
              <Text style={styles.issueTime}>{issue.time}</Text>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {(role === 'student' || role === 'professor') && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/(student)/issues/report')}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.screenPadding, paddingTop: 60 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentRed },
  liveText: { fontSize: 11, fontWeight: '700', color: colors.accentRed, letterSpacing: 1 },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
  filterBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surfaceAlt, justifyContent: 'center', alignItems: 'center' },

  aiCard: { backgroundColor: colors.cardLavender, borderRadius: spacing.cardRadius, padding: 16, marginBottom: 16 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  aiIcon: { color: colors.accentGold, fontSize: 14 },
  aiLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.textSecondary },
  aiText: { fontSize: 14, lineHeight: 20, fontWeight: '500', color: colors.textPrimary },

  mapCard: { backgroundColor: colors.surface, borderRadius: spacing.cardRadius, padding: 16, marginBottom: 16 },
  mapCanvas: { height: 200, backgroundColor: '#FAF9F5', borderRadius: 12, overflow: 'hidden', position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  gridLineVertical: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,0,0,0.05)' },
  marker: { position: 'absolute', height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width:0, height:2 }, shadowOpacity: 0.2, shadowRadius: 4, zIndex: 10, transform: [{translateX: -20}, {translateY: -8}] },
  pulseRing: { position: 'absolute', width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#E53836', opacity: 0.3, zIndex: -1 },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ldot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: spacing.cardRadius, padding: 20 },
  statNum: { fontSize: 40, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 4 },

  recentTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  issueCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  issueTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  issueTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  issueLoc: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  issueTime: { fontSize: 12, color: colors.textMuted },

  fab: { position: 'absolute', bottom: spacing.tabBarHeight + 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width:0, height:4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabIcon: { color: colors.textWhite, fontSize: 32, fontWeight: '400', marginTop: -4 },
});
