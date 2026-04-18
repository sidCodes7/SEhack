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
import { NextClassWidget } from '../../components/dashboard/NextClassWidget';
import { KarmaScoreWidget } from '../../components/dashboard/KarmaScoreWidget';
import { FinanceDueWidget } from '../../components/dashboard/FinanceDueWidget';
import { PendingRequestsWidget } from '../../components/dashboard/PendingRequestsWidget';
import { ClubAlertWidget } from '../../components/dashboard/ClubAlertWidget';
import { QuickActionsWidget } from '../../components/dashboard/QuickActionsWidget';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const dashboardData = await dashboardService.getStudentDashboard();
      setData(dashboardData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Fallback/Mock data if server is not fully wired yet
      setData({
        nextClass: { course: 'Data Structures', time: '10:30 AM', room: '302', professor: 'Dr. Harshav' },
        karma: { score: 240, percentile: 72 },
        finance: { amount: 120, type: 'Library fine' },
        pendingRequests: { count: 2, stages: ['Room booking', 'Leave'], activeIndex: 0 },
        clubAlert: { title: 'Hackathon meeting', time: 'Today, 4:00 PM', room: '101' },
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

  const miniApps = [
    { id: '1', name: 'Canteen', icon: '🍴', bgColor: '#F5F0D0', onPress: () => {} },
    { id: '2', name: 'Library', icon: '📖', bgColor: '#EAE7F8', onPress: () => {} },
    { id: '3', name: 'PYQ', icon: '📜', bgColor: '#F8E4E4', onPress: () => router.push('/(student)/pyq') },
    { id: '4', name: 'More', icon: '➕', bgColor: '#F7F6F2', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar name={user?.name || 'User'} size={40} />
            <Text style={styles.greeting}>Good morning, {user?.name?.split(' ')[0] || 'Student'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Text style={styles.bell}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Widgets grid */}
        <NextClassWidget
          {...data.nextClass}
          courseName={data.nextClass.course}
          onPress={() => router.push('/(student)/calendar')}
        />

        <View style={styles.row}>
          <KarmaScoreWidget {...data.karma} />
          <FinanceDueWidget
            {...data.finance}
            onPress={() => router.push('/(student)/finance')}
          />
        </View>

        <PendingRequestsWidget
          count={data.pendingRequests.count}
          stages={data.pendingRequests.stages}
          activeStageIndex={data.pendingRequests.activeIndex}
        />

        <ClubAlertWidget {...data.clubAlert} onPress={() => {}} />

        <QuickActionsWidget actions={miniApps} />
      </ScrollView>

      {/* Copilot FAB Placeholder */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>✨</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    gap: SPACING.lg,
    paddingBottom: 120, // Space for bottom nav/FAB
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#1A1A1A',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bell: {
    fontSize: 22,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1.5,
    borderColor: '#F7F6F2',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
  },
});
