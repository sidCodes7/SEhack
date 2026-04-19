import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import * as SecureStore from 'expo-secure-store';

const MOCK = {
  bottleneck: { title: 'Bottleneck: Stucco stage', detail: 'Avg 3.2 day delay — 6 requests pending' },
  openIssues: 12,
  pendingApprovals: 9,
  recentActivity: [
    { id: 1, text: 'Material delivery confirmed for Sector B', time: '10 mins ago', color: colors.success },
    { id: 2, text: 'Safety inspection flagged minor issue on scaffolding', time: '2 hours ago', color: colors.warning },
    { id: 3, text: 'Design revision approved by Lead Architect', time: 'Yesterday', color: '#8B6FC0' },
  ],
  quickActions: [
    { label: 'Analytics', icon: '↗' },
    { label: 'Issue Map', icon: '◫' },
    { label: 'Attendance', icon: '👤' },
  ],
};

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user');
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.avatar}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>A</Text>
          </TouchableOpacity>
        </View>

        {/* Bottleneck alert */}
        <View style={styles.alertCard}>
          <View style={styles.alertIconBg}>
            <Text style={styles.alertIcon}>⚠️</Text>
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>{MOCK.bottleneck.title}</Text>
            <Text style={styles.alertDetail}>{MOCK.bottleneck.detail}</Text>
          </View>
          <TouchableOpacity style={styles.nudgeBtn}>
            <Text style={styles.nudgeText}>Nudge</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.cardGreen }]} 
            onPress={() => router.push('/(student)/issues/heatmap')}
            activeOpacity={0.8}
          >
            <Text style={styles.labelUpper}>OPEN ISSUES</Text>
            <View style={styles.statRow}>
              <Text style={styles.statNum}>{MOCK.openIssues}</Text>
              <View style={styles.statArrow}>
                <Text style={styles.statArrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: '#F0EDE7' }]}
            activeOpacity={0.8}
          >
            <Text style={styles.labelUpper}>PENDING APPROVALS</Text>
            <View style={styles.statRow}>
              <Text style={styles.statNum}>{MOCK.pendingApprovals}</Text>
              <View style={styles.statArrow}>
                <Text style={styles.statArrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {MOCK.recentActivity.map(a => (
            <View key={a.id} style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: a.color }]} />
              <View style={styles.activityTextWrap}>
                <Text style={styles.activityDesc}>{a.text}</Text>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, { backgroundColor: colors.cardGreen }]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {MOCK.quickActions.map((a, i) => (
            <TouchableOpacity 
              key={a.label} 
              style={[styles.quickActionRow, i < MOCK.quickActions.length - 1 && styles.quickActionBorder]}
              onPress={() => {
                if (a.label === 'Issue Map') router.push('/(student)/issues/heatmap');
              }}
            >
              <Text style={styles.quickActionLabel}>{a.label}</Text>
              <Text style={styles.quickActionIcon}>{a.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.screenPadding, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  title: { ...typography.title },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardGreen, justifyContent: 'center', alignItems: 'center' },
  
  alertCard: { backgroundColor: colors.cardPink, borderRadius: spacing.cardRadius, padding: spacing.cardPadding, flexDirection: 'row', alignItems: 'center', marginBottom: spacing.cardGap },
  alertIconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.4)', marginRight: 12 },
  alertIcon: { fontSize: 20 },
  alertContent: { flex: 1 },
  alertTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  alertDetail: { fontSize: 13, color: colors.textSecondary },
  nudgeBtn: { backgroundColor: colors.textPrimary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  nudgeText: { color: colors.textWhite, fontSize: 12, fontWeight: '700' },

  row: { flexDirection: 'row', gap: spacing.cardGap, marginBottom: spacing.cardGap },
  statCard: { flex: 1, borderRadius: spacing.cardRadius, padding: spacing.cardPadding, minHeight: 140, justifyContent: 'space-between' },
  labelUpper: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 },
  statNum: { fontSize: 42, fontWeight: '800', color: colors.textPrimary },
  statArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  statArrowText: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },

  card: { backgroundColor: colors.surface, borderRadius: spacing.cardRadius, padding: spacing.cardPadding, marginBottom: spacing.cardGap },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  activityDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: 12 },
  activityTextWrap: { flex: 1 },
  activityDesc: { fontSize: 14, fontWeight: '500', color: colors.textPrimary, lineHeight: 20 },
  activityTime: { fontSize: 12, color: colors.textMuted, marginTop: 4 },

  quickActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  quickActionBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  quickActionLabel: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  quickActionIcon: { fontSize: 18, color: colors.textSecondary },
});
