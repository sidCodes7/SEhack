import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/auth.store';
import { dashboardService } from '../../services/dashboard.service';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { COLORS } from '../../constants/colors';
import { Avatar } from '../../components/common/Avatar';
import { AttendanceTrendWidget } from '../../components/dashboard/AttendanceTrendWidget';
import { ProfessorNoticesWidget } from '../../components/dashboard/ProfessorNoticesWidget';
import { Card } from '../../components/common/Card';

export default function ProfessorDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const dashboardData = await dashboardService.getProfessorDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Fallback
      setData({
        attendance: { percentage: 78, details: 'CSE Sem 5 · Section A', points: [40, 55, 80, 95, 60] },
        approvals: 4,
        followups: 2,
        notices: [
          { id: '1', title: 'Mid-term syllabus updated for CSE-5', time: '2 hrs ago', icon: '📝' },
          { id: '2', title: 'Reminder: Project submissions due Friday', time: '5 hrs ago', icon: '⚠️' },
        ],
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (!data) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.titleRow}>
          <TouchableOpacity style={styles.menuBtn}>
            <Text style={styles.menuIcon}>≡</Text>
          </TouchableOpacity>
          <Text style={styles.workspaceTitle}>Workspace</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <Avatar name={user?.name || 'Prof'} size={44} />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeLabel}>Good morning,</Text>
          <Text style={styles.profName}>Prof. {user?.name?.split(' ')[user.name.split(' ').length - 1] || 'Harshav'}</Text>
        </View>

        <AttendanceTrendWidget
          percentage={data.attendance.percentage}
          courseDetails={data.attendance.details}
          dataPoints={data.attendance.points}
          onPress={() => router.push('/(professor)/attendance')}
        />

        <View style={styles.gridRow}>
          <Card style={[styles.statCard, { backgroundColor: '#F5F0D0' }]}>
            <View style={styles.statHeader}>
              <Text style={[styles.statLabel, { color: '#8B7D3A' }]}>PENDING APPROVALS</Text>
              <Text style={styles.statIconSmall}>↗</Text>
            </View>
            <Text style={styles.statValue}>{data.approvals}</Text>
          </Card>

          <Card style={[styles.statCard, { backgroundColor: '#F8E4E4' }]}>
            <View style={styles.statHeader}>
              <Text style={[styles.statLabel, { color: '#A36666' }]}>FOLLOW-UPS</Text>
              <Text style={[styles.statIconSmall, { color: '#A36666' }]}>!</Text>
            </View>
            <View>
              <Text style={styles.statValue}>{data.followups}</Text>
              <Text style={[styles.statSubText, { color: '#A36666' }]}>Students at risk</Text>
            </View>
          </Card>
        </View>

        <ProfessorNoticesWidget
          notices={data.notices}
          onPublish={() => router.push('/(professor)/notices/new')}
        />
      </ScrollView>

      {/* FAB Bottom Placeholder for Professors */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: 'rgba(247, 246, 242, 0.8)',
    zIndex: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 32,
    color: '#1A1A1A',
  },
  workspaceTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 36,
    color: '#1A1A1A',
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notifBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bell: {
    fontSize: 24,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: '#F7F6F2',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    gap: 32,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: 8,
  },
  welcomeLabel: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: '#6B6B6B',
  },
  profName: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: '#1A1A1A',
    marginTop: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    minHeight: 180,
    justifyContent: 'space-between',
    padding: 24,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    letterSpacing: 1,
    width: '80%',
  },
  statIconSmall: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#1A1A1A',
  },
  statValue: {
    fontFamily: FONTS.extraBold,
    fontSize: 56,
    color: '#1A1A1A',
  },
  statSubText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginTop: 2,
  },
});
