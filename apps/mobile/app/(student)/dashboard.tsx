import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import api from '../../services/api';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const stored = await SecureStore.getItemAsync('user');
      if (stored) setUser(JSON.parse(stored));

      const res = await api.get('/dashboard/student');
      setDashboard(res.data.data);
    } catch (e) {
      console.warn('Dashboard load error:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const nextClass = dashboard?.nextClass;
  const karmaScore = dashboard?.karmaScore ?? user?.karmaScore ?? 0;
  const financeDue = dashboard?.financeSummary;
  const pendingRequests = dashboard?.pendingRequests;
  const upcomingEvent = dashboard?.upcomingEvent;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) ?? 'P'}
              </Text>
            </View>
            <Text style={styles.greeting}>
              {greeting()}, {user?.name?.split(' ')[0] ?? 'Student'}
            </Text>
          </View>
          <TouchableOpacity style={styles.bellButton}>
            <Text style={{ fontSize: 22 }}>ðŸ””</Text>
          </TouchableOpacity>
        </View>

        {/* Next Class Card */}
        <TouchableOpacity
          style={[styles.card, styles.cardLavender]}
          onPress={() => router.push('/(student)/calendar')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>NEXT CLASS</Text>
            <View style={styles.arrowButton}>
              <Text style={styles.arrowText}>â†—</Text>
            </View>
          </View>
          <Text style={styles.cardTitleBig}>
            {nextClass?.subject ?? 'Data Structures'}
          </Text>
          <Text style={styles.cardCaption}>
            {nextClass?.time ?? '10:30 AM'} Â· {nextClass?.room ?? 'Room 302'} Â· {nextClass?.professor ?? 'Dr. Harshav'}
          </Text>
        </TouchableOpacity>

        {/* Karma + Finance Row */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.halfCard, styles.cardYellow]}
            onPress={() => router.push('/(student)/karma')}
            activeOpacity={0.85}
          >
            <Text style={styles.sectionLabel}>KARMA SCORE</Text>
            <View style={styles.karmaRow}>
              <Text style={styles.bigNumber}>{karmaScore}</Text>
              <Text style={styles.karmaUnit}> pts</Text>
              <View style={styles.karmaRing} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.halfCard, styles.cardPink]}
            onPress={() => router.push('/(student)/finance')}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.sectionLabel}>FINANCE DUE</Text>
              <View style={styles.arrowButton}>
                <Text style={styles.arrowText}>â†—</Text>
              </View>
            </View>
            <Text style={styles.bigNumber}>
              â‚¹{financeDue?.totalDue ?? '120'}
            </Text>
            <Text style={styles.cardCaptionSmall}>
              {financeDue?.topDueType ?? 'Library fine'} <Text style={{ color: colors.accentRed }}>â—</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pending Requests */}
        <TouchableOpacity
          style={[styles.card, styles.cardWhite]}
          onPress={() => router.push('/(student)/bookings/status')}
          activeOpacity={0.85}
        >
          <Text style={styles.sectionLabel}>PENDING REQUESTS</Text>
          <View style={styles.requestsRow}>
            <Text style={styles.bigNumber}>{pendingRequests?.count ?? 2}</Text>
            <View style={styles.requestTags}>
              {(pendingRequests?.types ?? ['Room booking', 'Leave']).map((t, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '40%' }]} />
          </View>
        </TouchableOpacity>

        {/* Club Alert */}
        <TouchableOpacity
          style={[styles.card, styles.cardGreen]}
          onPress={() => router.push('/(student)/calendar')}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.sectionLabel}>CLUB ALERT</Text>
            <View style={styles.arrowButton}>
              <Text style={styles.arrowText}>â†—</Text>
            </View>
          </View>
          <Text style={styles.cardTitleBig}>
            {upcomingEvent?.title ?? 'Hackathon meeting'}
          </Text>
          <Text style={styles.cardCaption}>
            {upcomingEvent?.time ?? 'Today, 4:00 PM'} Â· {upcomingEvent?.room ?? 'Room 101'}
          </Text>
        </TouchableOpacity>

        {/* Mini Apps */}
        <View style={[styles.card, styles.cardWhite]}>
          <Text style={styles.sectionLabel}>MINI APPS</Text>
          <View style={styles.miniAppsGrid}>
            {[
              { emoji: 'ðŸ½', label: 'Canteen', route: null },
              { emoji: 'ðŸ“š', label: 'Library', route: null },
              { emoji: 'ðŸ“„', label: 'PYQ', route: '/(student)/pyq' },
              { emoji: 'ðŸŽ¯', label: 'More', route: null },
            ].map((app, i) => (
              <TouchableOpacity
                key={i}
                style={styles.miniApp}
                onPress={() => app.route && router.push(app.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.miniAppIcon, { backgroundColor: [colors.cardYellow, colors.cardGreen, colors.cardLavender, colors.surfaceAlt][i] }]}>
                  <Text style={{ fontSize: 24 }}>{app.emoji}</Text>
                </View>
                <Text style={styles.miniAppLabel}>{app.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spacer for tab bar */}
        <View style={{ height: spacing.tabBarHeight + spacing.md }} />
      </ScrollView>

      {/* Copilot FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(student)/copilot')}
        activeOpacity={0.85}
      >
        <Text style={{ fontSize: 20 }}>âœ¦</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cardGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bellButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cards
  card: {
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    marginBottom: spacing.cardGap,
  },
  cardLavender: { backgroundColor: colors.cardLavender },
  cardYellow: { backgroundColor: colors.cardYellow },
  cardPink: { backgroundColor: colors.cardPink },
  cardGreen: { backgroundColor: colors.cardGreen },
  cardWhite: { backgroundColor: colors.surface },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.sectionLabel,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  cardTitleBig: {
    ...typography.cardTitle,
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  cardCaption: {
    ...typography.caption,
  },
  cardCaptionSmall: {
    ...typography.small,
    marginTop: spacing.xs,
  },

  // Row layout
  row: {
    flexDirection: 'row',
    gap: spacing.cardGap,
    marginBottom: spacing.cardGap,
  },
  halfCard: {
    flex: 1,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
  },

  // Karma
  karmaRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
  },
  bigNumber: {
    ...typography.bigNumber,
    fontSize: 36,
  },
  karmaUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  karmaRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: colors.accentGold,
    borderTopColor: 'transparent',
    marginLeft: 8,
  },

  // Requests
  requestsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: spacing.md,
  },
  requestTags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: {
    ...typography.small,
    color: colors.textPrimary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: spacing.md,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.accent,
    borderRadius: 2,
  },

  // Mini Apps
  miniAppsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: spacing.md,
  },
  miniApp: {
    alignItems: 'center',
    gap: 8,
  },
  miniAppIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAppLabel: {
    ...typography.small,
    color: colors.textPrimary,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: spacing.tabBarHeight + 16,
    right: spacing.screenPadding,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

