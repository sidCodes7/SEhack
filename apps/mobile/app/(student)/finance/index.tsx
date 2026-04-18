import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { financeService } from '../../services/finance.service';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { COLORS } from '../../constants/colors';
import { Card } from '../../components/common/Card';

export default function FinanceScreen() {
  const [dues, setDues] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await financeService.getDues();
        setDues(data);
      } catch {
        setDues([
          { id: '1', type: 'Library Fine', amount: 120, dueDate: 'Apr 25', status: 'unpaid', icon: '📚' },
          { id: '2', type: 'Lab Fee', amount: 500, dueDate: 'May 1', status: 'unpaid', icon: '🔬' },
          { id: '3', type: 'Canteen', amount: 85, dueDate: 'Apr 20', status: 'unpaid', icon: '🍽️' },
        ]);
      }
    };
    fetch();
  }, []);

  const total = dues.reduce((sum, d) => sum + d.amount, 0);

  const handlePay = async (dueId: string) => {
    try {
      const order = await financeService.initiatePayment(dueId);
      Alert.alert('Payment', `Razorpay order created: ${order.orderId || 'Demo mode'}`);
    } catch {
      Alert.alert('Error', 'Payment initiation failed.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Finance</Text>

        {/* Total card */}
        <Card style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL DUE</Text>
          <Text style={styles.totalAmount}>₹{total}</Text>
          <View style={styles.totalDot} />
        </Card>

        {/* Dues list */}
        {dues.map((due) => (
          <Card key={due.id} style={styles.dueCard}>
            <View style={styles.dueTop}>
              <View style={styles.dueIcon}>
                <Text style={styles.dueEmoji}>{due.icon}</Text>
              </View>
              <View style={styles.dueInfo}>
                <Text style={styles.dueType}>{due.type}</Text>
                <Text style={styles.dueDate}>Due: {due.dueDate}</Text>
              </View>
              <Text style={styles.dueAmount}>₹{due.amount}</Text>
            </View>
            <TouchableOpacity style={styles.payBtn} onPress={() => handlePay(due.id)}>
              <Text style={styles.payText}>Pay Now</Text>
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  content: { padding: SPACING.lg, gap: 20, paddingTop: 60, paddingBottom: 100 },
  title: { fontFamily: FONTS.extraBold, fontSize: 36, color: '#1A1A1A' },
  totalCard: { backgroundColor: '#F8E4E4', padding: SPACING.xl, alignItems: 'center', gap: 8 },
  totalLabel: { fontFamily: FONTS.bold, fontSize: 11, color: '#A36666', letterSpacing: 1 },
  totalAmount: { fontFamily: FONTS.extraBold, fontSize: 48, color: '#1A1A1A' },
  totalDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  dueCard: { backgroundColor: '#FFFFFF', padding: SPACING.lg, gap: 16 },
  dueTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dueIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4F4EF', justifyContent: 'center', alignItems: 'center' },
  dueEmoji: { fontSize: 20 },
  dueInfo: { flex: 1 },
  dueType: { fontFamily: FONTS.bold, fontSize: 16, color: '#1A1A1A' },
  dueDate: { fontFamily: FONTS.medium, fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  dueAmount: { fontFamily: FONTS.bold, fontSize: 20, color: '#1A1A1A' },
  payBtn: { backgroundColor: '#1A1A1A', borderRadius: 24, paddingVertical: 14, alignItems: 'center' },
  payText: { fontFamily: FONTS.bold, fontSize: 14, color: '#FFFFFF' },
});
