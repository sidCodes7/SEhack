import { useEffect, useState } from 'react';
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
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import api from '../../services/api';

export default function ProfessorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const stored = await SecureStore.getItemAsync('user');
      if (stored) setUser(JSON.parse(stored));
      const res = await api.get('/dashboard/professor');
      setData(res.data.data);
    } catch {
      setData({
        attendance: { percentage: 78 },
        approvals: 4,
        followups: 2,
        notices: [
          { title: 'Mid-term syllabus updated', time: '2 hrs ago' },
          { title: 'Project submissions due Friday', time: '5 hrs ago' },
        ],
      });
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TouchableOpacity><Text style={{ fontSize: 28 }}>â‰¡</Text></TouchableOpacity>
          <Text style={styles.title}>Workspace</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity><Text style={{ fontSize: 22 }}>ðŸ””</Text></TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 16 }}>{user?.name?.charAt(0) ?? 'P'}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.greeting}>{greeting()},</Text>
        <Text style={styles.profName}>Prof. {user?.name?.split(' ').pop() ?? 'Harshav'}</Text>

        {/* Attendance Card */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: colors.cardGreen }]}
          onPress={() => router.push('/(professor)/attendance')}
        >
          <Text style={styles.sectionLabel}>ATTENDANCE TREND</Text>
          <View style={styles.attendanceRow}>
            <Text style={styles.bigNum}>{data?.attendance?.percentage ?? 78}%</Text>
            <View style={styles.trendBars}>
              {[40, 55, 80, 95, 60].map((h, i) => (
                <View key={i} style={[styles.bar, { height: h * 0.6 }]} />
              ))}
            </View>
          </View>
          <Text style={styles.cardSub}>CSE Sem 5 Â· Section A</Text>
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.halfCard, { backgroundColor: colors.cardYellow }]}
            onPress={() => router.push('/(professor)/leave-approvals')}
          >
            <Text style={styles.sectionLabel}>PENDING APPROVALS</Text>
            <Text style={styles.statNum}>{data?.approvals ?? 4}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.halfCard, { backgroundColor: colors.cardPink }]}
            onPress={() => router.push('/(professor)/follow-ups')}
          >
            <Text style={styles.sectionLabel}>FOLLOW-UPS</Text>
            <Text style={styles.statNum}>{data?.followups ?? 2}</Text>
            <Text style={[styles.cardSub, { color: colors.accentRed }]}>Students at risk</Text>
          </TouchableOpacity>
        </View>

        {/* Notices */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.noticeHeader}>
            <Text style={styles.sectionLabel}>RECENT NOTICES</Text>
            <TouchableOpacity onPress={() => router.push('/(professor)/notices')}>
              <Text style={styles.publishBtn}>+ Publish</Text>
            </TouchableOpacity>
          </View>
          {(data?.notices ?? []).map((n, i) => (
            <View key={i} style={styles.noticeItem}>
              <Text style={{ fontSize: 16 }}>ðŸ“</Text>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.noticeTitle}>{n.title}</Text>
                <Text style={styles.noticeSub}>{n.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.screenPadding, paddingTop: 60, paddingBottom: spacing.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, letterSpacing: -1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardGreen,
    justifyContent: 'center', alignItems: 'center',
  },
  content: { paddingHorizontal: spacing.screenPadding, paddingTop: spacing.md },
  greeting: { fontSize: 18, fontWeight: '500', color: colors.textSecondary },
  profName: { fontSize: 32, fontWeight: '800', color: colors.textPrimary, marginBottom: spacing.lg },
  card: { borderRadius: 20, padding: 20, marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1.5, textTransform: 'uppercase' },
  attendanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 },
  bigNum: { fontSize: 48, fontWeight: '800', color: colors.textPrimary },
  trendBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  bar: { width: 12, backgroundColor: colors.accent, borderRadius: 4, opacity: 0.7 },
  cardSub: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  halfCard: { flex: 1, borderRadius: 20, padding: 20, minHeight: 140, justifyContent: 'space-between' },
  statNum: { fontSize: 48, fontWeight: '800', color: colors.textPrimary },
  noticeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  publishBtn: { fontSize: 14, fontWeight: '700', color: colors.accent },
  noticeItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.borderLight },
  noticeTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  noticeSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});

