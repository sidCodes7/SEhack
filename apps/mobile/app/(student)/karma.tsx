import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import api from '../../services/api';

export default function KarmaScreen() {
  const router = useRouter();
  const [karmaData, setKarmaData] = useState<any>(null);

  useEffect(() => {
    loadKarma();
  }, []);

  const loadKarma = async () => {
    try {
      const res = await api.get('/karma/score');
      setKarmaData(res.data.data);
    } catch (e) {
      console.warn('Karma load error:', e);
    }
  };

  const score = karmaData?.score ?? 240;
  const events = karmaData?.recentEvents ?? [
    { eventType: 'issue_reported', points: 10 },
    { eventType: 'class_attended', points: 5 },
    { eventType: 'class_attended', points: 5 },
    { eventType: 'room_returned_early', points: 15 },
  ];
  const leaderboard = karmaData?.leaderboard ?? [];
  const percentile = karmaData?.percentile ?? 72;

  const formatEvent = (type: string) => {
    const map: Record<string, string> = {
      issue_reported: 'Issue Reported',
      class_attended: 'Class Attended',
      room_returned_early: 'Room Returned Early',
      due_paid_on_time: 'Due Paid On Time',
      peer_endorsed: 'Peer Endorsed',
    };
    return map[type] || type;
  };

  // SVG-like ring using View borders
  const ringProgress = Math.min(score / 400, 1);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 18, fontWeight: '800', letterSpacing: 1, color: '#1A1A1A' }}>A</Text>
        <Text style={styles.headerTitle}>AETHER</Text>
        <View style={styles.headerAvatar}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1A1A' }}>P</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Your Karma</Text>

        {/* Score Card */}
        <View style={[styles.card, styles.cardYellow]}>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreRing}>
              <View style={styles.scoreRingInner}>
                <Text style={styles.scoreNumber}>{score}</Text>
                <Text style={styles.scoreLabel}>points</Text>
              </View>
            </View>
          </View>
          <Text style={styles.percentileText}>
            You're more civic than {percentile}% of students
          </Text>
        </View>

        {/* How you earned it */}
        <View style={[styles.card, styles.cardWhite]}>
          <Text style={styles.cardTitleMed}>How you earned it</Text>
          {events.map((event: any, i: number) => (
            <View key={i} style={styles.eventRow}>
              <View style={[styles.eventDot, { backgroundColor: event.points >= 15 ? colors.accentGold : colors.cardGreen }]} />
              <Text style={styles.eventName}>{formatEvent(event.eventType)}</Text>
              <Text style={[styles.eventPoints, event.points >= 15 && { color: colors.accentGold }]}>
                +{event.points} pts
              </Text>
            </View>
          ))}
        </View>

        {/* Top Students */}
        <View style={[styles.card, styles.cardLavender]}>
          <Text style={styles.cardTitleMed}>Top Students</Text>
          {leaderboard.length > 0 ? (
            leaderboard.slice(0, 5).map((student: any, i: number) => (
              <View key={i} style={[styles.leaderRow, i === 2 && styles.leaderRowHighlight]}>
                <Text style={styles.leaderRank}>{i + 1}</Text>
                <View style={styles.leaderAvatar}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1A1A' }}>{student.name?.charAt(0) ?? 'S'}</Text>
                </View>
                <Text style={styles.leaderName}>{student.name}</Text>
                <Text style={styles.leaderScore}>{student.karmaScore} pts</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#D4A843' }}>{i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}</Text>
              </View>
            ))
          ) : (
            [
              { name: 'Sneha Patel', score: 312 },
              { name: 'Priyank Sharma', score: 287 },
              { name: 'Vikram Singh', score: 240 },
            ].map((s, i) => (
              <View key={i} style={[styles.leaderRow, i === 2 && styles.leaderRowHighlight]}>
                <Text style={styles.leaderRank}>{i + 1}</Text>
                <View style={styles.leaderAvatar}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1A1A1A' }}>{s.name.charAt(0)}</Text>
                </View>
                <Text style={styles.leaderName}>{s.name}</Text>
                <Text style={styles.leaderScore}>{s.score} pts</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#D4A843' }}>{i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: spacing.tabBarHeight + spacing.lg }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
  },
  pageTitle: {
    ...typography.title,
    marginBottom: spacing.lg,
  },

  // Cards
  card: {
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    marginBottom: spacing.cardGap,
  },
  cardYellow: { backgroundColor: colors.cardYellow },
  cardWhite: { backgroundColor: colors.surface },
  cardLavender: { backgroundColor: colors.cardLavender },

  // Score
  scoreContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  scoreRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: colors.accentGold,
    borderTopColor: '#E8E5DF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreRingInner: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scoreLabel: {
    ...typography.caption,
  },
  percentileText: {
    ...typography.caption,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Events
  cardTitleMed: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  eventName: {
    flex: 1,
    ...typography.body,
  },
  eventPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  // Leaderboard
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 4,
    gap: 12,
  },
  leaderRowHighlight: {
    backgroundColor: 'rgba(26,26,26,0.08)',
    borderRadius: 16,
  },
  leaderRank: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 20,
  },
  leaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  leaderScore: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
