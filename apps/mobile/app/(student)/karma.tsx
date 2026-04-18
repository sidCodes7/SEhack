import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { COLORS } from '../../constants/colors';
import { Avatar } from '../../components/common/Avatar';
import { Card } from '../../components/common/Card';

export default function KarmaScreen() {
  const { user } = useAuthStore();

  const history = [
    { id: '1', label: 'Issue Reported', points: '+10 pts', color: '#D8EAE1' },
    { id: '2', label: 'Class Attended', points: '+5 pts', color: '#D8EAE1' },
    { id: '3', label: 'Class Attended', points: '+5 pts', color: '#D8EAE1' },
    { id: '4', label: 'Room Returned Early', points: '+15 pts', color: '#D4A843' },
  ];

  const leaderboard = [
    { id: '1', name: 'Ananya Shah', score: 312, rank: 1, medal: '🥇' },
    { id: '2', name: 'Rohan Verma', score: 287, rank: 2, medal: '🥈' },
    { id: '3', name: 'Priyank Mehta', score: 240, rank: 3, medal: '🥉', isMe: true },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.headerIcon}>🔍</Text>
        </TouchableOpacity>
        <Text style={styles.headerLogo}>AETHER</Text>
        <Avatar name={user?.name || 'P'} size={40} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.screenTitle}>Your Karma</Text>

        {/* Hero Score Card */}
        <Card style={styles.heroCard}>
          <View style={styles.circleContainer}>
            <View style={styles.circle}>
              <Text style={styles.bigScore}>240</Text>
              <Text style={styles.ptsLabel}>points</Text>
            </View>
          </View>
          <Text style={styles.heroSubtext}>
            You're more civic than 72% of{'\n'}students
          </Text>
        </Card>

        {/* How you earned it */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How you earned it</Text>
          <Card style={styles.whiteCard}>
            {history.map((item, idx) => (
              <View key={item.id} style={[styles.historyItem, idx === history.length - 1 && styles.noBorder]}>
                <View style={styles.historyLabelRow}>
                  <View style={[styles.dot, { backgroundColor: item.color }]} />
                  <Text style={styles.historyLabel}>{item.label}</Text>
                </View>
                <Text style={[styles.historyPoints, { color: item.color === '#D4A843' ? '#D4A843' : '#1A1A1A' }]}>
                  {item.points}
                </Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Students</Text>
          <Card style={styles.leaderboardCard}>
            {leaderboard.map((student) => (
              <View key={student.id} style={[styles.rankItem, student.isMe && styles.meItem]}>
                <Text style={styles.rank}>{student.rank}</Text>
                <Avatar name={student.name} size={36} />
                <View style={styles.rankInfo}>
                  <Text style={styles.rankName}>{student.name}</Text>
                </View>
                <View style={styles.rankScoreBox}>
                  <Text style={[styles.rankScore, student.isMe && styles.meScore]}>{student.score}</Text>
                  <Text style={[styles.rankPts, student.isMe && styles.meScore]}>pts</Text>
                </View>
                <Text style={styles.medal}>{student.medal}</Text>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F6F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerLogo: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    letterSpacing: 2,
    color: '#1A1A1A',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    gap: 32,
    paddingBottom: 40,
  },
  screenTitle: {
    fontFamily: FONTS.extraBold,
    fontSize: 32,
    color: '#1A1A1A',
  },
  heroCard: {
    backgroundColor: '#F5F0D0',
    alignItems: 'center',
    paddingVertical: 40,
    gap: 24,
  },
  circleContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    alignItems: 'center',
  },
  bigScore: {
    fontFamily: FONTS.bold,
    fontSize: 64,
    color: '#D4A843',
    lineHeight: 64,
  },
  ptsLabel: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: '#D4A843',
  },
  heroSubtext: {
    fontFamily: FONTS.medium,
    fontSize: 18,
    color: '#5D605B',
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#1A1A1A',
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    gap: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4EF',
    paddingBottom: 16,
  },
  noBorder: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  historyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyLabel: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: '#1A1A1A',
  },
  historyPoints: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  leaderboardCard: {
    backgroundColor: '#EAE7F8',
    padding: 12,
    gap: 8,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  meItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4A843',
  },
  rank: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#6B6B6B',
    width: 20,
    textAlign: 'center',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: '#1A1A1A',
  },
  rankScoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  rankScore: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#1A1A1A',
  },
  rankPts: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: '#6B6B6B',
  },
  meScore: {
    color: '#D4A843',
  },
  medal: {
    fontSize: 20,
  },
});
