import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing } from '../../../constants/spacing';
import api from '../../../services/api';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://10.10.125.45:3000';

export default function FinanceScreen() {
  const router = useRouter();
  const [dues, setDues] = useState([]);

  useEffect(() => {
    loadDues();
  }, []);

  const loadDues = async () => {
    try {
      const res = await api.get('/finance/dues');
      setDues(res.data.data ?? []);
    } catch (e) {
      // Mock data for demo
      setDues([
        { id: '1', type: 'library', amount: '250', status: 'pending' },
        { id: '2', type: 'canteen', amount: '1500', status: 'pending' },
        { id: '3', type: 'lab', amount: '500', status: 'pending' },
      ]);
    }
  };

  const pendingDues = dues.filter((d) => d.status === 'pending');
  const totalDue = pendingDues.reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

  const typeIcons = {
    library: 'ðŸ“š',
    canteen: 'ðŸ½',
    lab: 'ðŸ”¬',
  };

  const typeLabels = {
    library: 'Library Fine',
    canteen: 'Canteen Bill',
    lab: 'Lab Materials',
  };

  const typeColors = {
    library: colors.cardLavender,
    canteen: colors.cardYellow,
    lab: colors.cardGreen,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 20 }}>ðŸ”</Text>
        <Text style={styles.headerTitle}>AETHER</Text>
        <View style={styles.headerAvatar}>
          <Text style={{ fontSize: 16 }}>ðŸ‘¤</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>Finance</Text>

        {/* Total Dues Card */}
        <View style={[styles.card, styles.cardLavender]}>
          <Text style={styles.sectionLabel}>TOTAL DUES</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalAmount}>â‚¹{totalDue.toFixed(0)}</Text>
            <Text style={{ fontSize: 32 }}>âš ï¸</Text>
          </View>
          <Text style={styles.totalSub}>{pendingDues.length} items pending</Text>
        </View>

        {/* Due Items */}
        {pendingDues.map((due, i) => (
          <View key={due.id || i} style={[styles.dueCard, { backgroundColor: typeColors[due.type] || colors.surface }]}>
            <View style={styles.dueIconContainer}>
              <Text style={{ fontSize: 24 }}>{typeIcons[due.type] || 'ðŸ’°'}</Text>
            </View>
            <View style={styles.dueInfo}>
              <Text style={styles.dueTitle}>{typeLabels[due.type] || due.type}</Text>
              <Text style={styles.dueSub}>
                {due.type === 'library' ? 'Overdue by 3 days' : `Apr ${10 + i}`}
              </Text>
            </View>
            <View style={styles.dueRight}>
              <Text style={styles.dueAmount}>â‚¹{parseFloat(due.amount).toFixed(0)}</Text>
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => {
                  const amt = parseFloat(due.amount);
                  const label = encodeURIComponent(typeLabels[due.type] || due.type);
                  const url = `${API_BASE}/pay/checkout/${amt}/${label}`;
                  Linking.openURL(url).catch(() =>
                    Alert.alert('Payment', `Razorpay checkout for ${due.amount}`)
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.payButtonText}>PAY{'\n'}NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {pendingDues.length === 0 && (
          <View style={[styles.card, styles.cardWhite]}>
            <Text style={styles.emptyText}>âœ… No pending dues!</Text>
          </View>
        )}

        {/* Razorpay badge */}
        <View style={[styles.card, styles.cardMint]}>
          <View style={styles.razorpayRow}>
            <Text style={{ fontSize: 14 }}>ðŸ”’</Text>
            <Text style={styles.razorpayText}>Payments secured via Razorpay</Text>
          </View>
          <View style={styles.testBadge}>
            <Text style={styles.testBadgeText}>TEST MODE</Text>
          </View>
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
  scrollContent: { paddingHorizontal: spacing.screenPadding },
  pageTitle: { ...typography.title, marginBottom: spacing.lg },

  card: {
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    marginBottom: spacing.cardGap,
  },
  cardLavender: { backgroundColor: colors.cardLavender },
  cardWhite: { backgroundColor: colors.surface },
  cardMint: { backgroundColor: colors.cardMint },

  sectionLabel: { ...typography.sectionLabel },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  totalAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalSub: {
    ...typography.caption,
    marginTop: spacing.xs,
  },

  // Due cards
  dueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    marginBottom: spacing.cardGap,
    gap: 14,
  },
  dueIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dueInfo: { flex: 1 },
  dueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dueSub: {
    ...typography.caption,
    color: colors.accentRed,
    marginTop: 2,
  },
  dueRight: { alignItems: 'flex-end', gap: 6 },
  dueAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  payButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  payButtonText: {
    color: colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },

  razorpayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  razorpayText: { ...typography.caption },
  testBadge: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  testBadgeText: {
    color: colors.textWhite,
    fontSize: 10,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  },
});

