import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';






export default function AdminAnalyticsScreen() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [attendance, approvals, issues] = await Promise.all([
          api.get("/analytics/attendance").then(r => r.data.data),
          api.get("/analytics/approvals").then(r => r.data.data),
          api.get("/analytics/issues").then(r => r.data.data),
        ]);
        setData({ attendance, approvals, issues });
      } catch {
        setData({
          attendance: { overallRate: 78, departments: [
            { name: 'CSE', rate: 82 }, { name: 'ECE', rate: 75 }, { name: 'ME', rate: 71 },
          ]},
          approvals: { avgDays: 2.1, bottleneck: 'Stucco', bottleneckAvg: 3.2, stages: [
            { name: 'HOD', avg: 0.5 }, { name: 'Stucco', avg: 3.2 }, { name: 'Dean', avg: 0.8 },
          ]},
          issues: { total: 47, open: 12, inProgress: 8, resolved: 27 },
        });
      }
    };
    fetch();
  }, []);

  if (!data) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Institution Overview</Text>

        {/* Attendance section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>ATTENDANCE TRENDS</Text>
          <Text style={styles.bigStat}>{data.attendance.overallRate}%</Text>
          <Text style={styles.bigStatLabel}>Overall Attendance</Text>
          <View style={styles.deptList}>
            {data.attendance.departments.map((dept: any) => (
              <View key={dept.name} style={styles.deptRow}>
                <Text style={styles.deptName}>{dept.name}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${dept.rate}%` }]} />
                </View>
                <Text style={styles.deptRate}>{dept.rate}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Approval bottlenecks */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>APPROVAL BOTTLENECKS</Text>
          <Text style={styles.bigStat}>{data.approvals.avgDays}</Text>
          <Text style={styles.bigStatLabel}>Avg. days to approve</Text>

          <View style={styles.stagesList}>
            {data.approvals.stages.map((stage: any) => (
              <View key={stage.name} style={styles.stageRow}>
                <Text style={styles.stageName}>{stage.name}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${(stage.avg / 4) * 100}%`, backgroundColor: stage.avg > 2 ? '#A83836' : '#45554F' }]} />
                </View>
                <Text style={styles.deptRate}>{stage.avg}d</Text>
              </View>
            ))}
          </View>

          {data.approvals.bottleneck && (
            <View style={styles.bottleneckAlert}>
              <Text style={styles.bottleneckText}>
                âš ï¸ {data.approvals.bottleneck} is averaging {data.approvals.bottleneckAvg} day delays
              </Text>
            </View>
          )}
        </View>

        {/* Issue resolution */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>ISSUE RESOLUTION</Text>
          <View style={styles.issueGrid}>
            <View style={[styles.issueBox, { backgroundColor: '#F8E4E4' }]}>
              <Text style={styles.issueValue}>{data.issues.open}</Text>
              <Text style={styles.issueLabel}>Open</Text>
            </View>
            <View style={[styles.issueBox, { backgroundColor: '#F5F0D0' }]}>
              <Text style={styles.issueValue}>{data.issues.inProgress}</Text>
              <Text style={styles.issueLabel}>In Progress</Text>
            </View>
            <View style={[styles.issueBox, { backgroundColor: '#D5E7DE' }]}>
              <Text style={styles.issueValue}>{data.issues.resolved}</Text>
              <Text style={styles.issueLabel}>Resolved</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  content: { padding: 24, gap: 24, paddingTop: 60, paddingBottom: 40 },
  title: { fontWeight: '800', fontSize: 36, color: '#1A1A1A' },
  subtitle: { fontWeight: '500', fontSize: 16, color: '#6B6B6B', marginTop: -16 },
  sectionCard: { backgroundColor: '#FFFFFF', padding: 32, gap: 16 },
  sectionLabel: { fontWeight: '700', fontSize: 11, color: '#5D605B', letterSpacing: 1 },
  bigStat: { fontWeight: '800', fontSize: 48, color: '#1A1A1A' },
  bigStatLabel: { fontWeight: '500', fontSize: 14, color: '#6B6B6B', marginTop: -8 },
  deptList: { gap: 12, marginTop: 8 },
  deptRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deptName: { fontWeight: '700', fontSize: 13, color: '#1A1A1A', width: 40 },
  barBg: { flex: 1, height: 8, backgroundColor: '#F4F4EF', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#45554F', borderRadius: 4 },
  deptRate: { fontWeight: '700', fontSize: 13, color: '#1A1A1A', width: 40, textAlign: 'right' },
  stagesList: { gap: 12 },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stageName: { fontWeight: '700', fontSize: 13, color: '#1A1A1A', width: 60 },
  bottleneckAlert: { backgroundColor: '#F5F0D0', padding: 16 },
  bottleneckText: { fontWeight: '500', fontSize: 14, color: '#8B7D3A' },
  issueGrid: { flexDirection: 'row', gap: 12 },
  issueBox: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 4 },
  issueValue: { fontWeight: '800', fontSize: 28, color: '#1A1A1A' },
  issueLabel: { fontWeight: '500', fontSize: 11, color: '#5D605B' },
});


