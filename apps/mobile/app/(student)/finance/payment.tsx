import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { financeService } from '../../services/finance.service';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { Card } from '../../components/common/Card';

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ dueId: string; amount: string; type: string }>();
  const [stage, setStage] = useState<'confirm' | 'processing' | 'success' | 'failed'>('confirm');

  const handlePay = async () => {
    setStage('processing');
    try {
      const order = await financeService.initiatePayment(params.dueId || 'demo');
      // In production, open Razorpay checkout here with order.orderId
      // Simulating success for demo:
      setTimeout(async () => {
        try {
          await financeService.verifyPayment({
            razorpay_order_id: order?.orderId || 'demo_order',
            razorpay_payment_id: 'demo_payment_' + Date.now(),
            razorpay_signature: 'demo_sig',
          });
          setStage('success');
        } catch {
          setStage('failed');
        }
      }, 2000);
    } catch {
      setStage('failed');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {stage === 'confirm' && (
          <>
            <Text style={styles.title}>Confirm Payment</Text>
            <Card style={styles.card}>
              <Text style={styles.type}>{params.type || 'Library Fine'}</Text>
              <Text style={styles.amount}>₹{params.amount || '120'}</Text>
              <Text style={styles.info}>Payment via Razorpay</Text>
            </Card>
            <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
              <Text style={styles.payBtnText}>Pay Now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}

        {stage === 'processing' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1A1A1A" />
            <Text style={styles.statusText}>Processing payment…</Text>
          </View>
        )}

        {stage === 'success' && (
          <View style={styles.center}>
            <View style={styles.successCircle}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successSub}>₹{params.amount || '120'} paid for {params.type || 'Library Fine'}</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        {stage === 'failed' && (
          <View style={styles.center}>
            <View style={styles.failCircle}>
              <Text style={styles.failIcon}>✕</Text>
            </View>
            <Text style={styles.failTitle}>Payment Failed</Text>
            <Text style={styles.failSub}>Something went wrong. Please try again.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handlePay}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.cancelText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAF9F5' },
  container: { flex: 1, padding: SPACING.xl, justifyContent: 'center', gap: 24 },
  title: { fontFamily: FONTS.extraBold, fontSize: 32, color: '#1A1A1A', textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', padding: SPACING.xl, alignItems: 'center', gap: 8 },
  type: { fontFamily: FONTS.medium, fontSize: 14, color: '#6B6B6B' },
  amount: { fontFamily: FONTS.extraBold, fontSize: 48, color: '#1A1A1A' },
  info: { fontFamily: FONTS.regular, fontSize: 13, color: '#A7A9BE', marginTop: 4 },
  payBtn: { backgroundColor: '#1A1A1A', borderRadius: 28, paddingVertical: 18, alignItems: 'center' },
  payBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFFFFF' },
  cancelText: { fontFamily: FONTS.medium, fontSize: 14, color: '#6B6B6B', textAlign: 'center', paddingVertical: 12 },
  center: { alignItems: 'center', gap: 16 },
  statusText: { fontFamily: FONTS.medium, fontSize: 16, color: '#6B6B6B', marginTop: 12 },
  successCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#D5E7DE',
    justifyContent: 'center', alignItems: 'center',
  },
  successIcon: { fontSize: 36, color: '#45554F', fontFamily: FONTS.bold },
  successTitle: { fontFamily: FONTS.bold, fontSize: 24, color: '#1A1A1A' },
  successSub: { fontFamily: FONTS.medium, fontSize: 14, color: '#6B6B6B', textAlign: 'center' },
  doneBtn: { backgroundColor: '#1A1A1A', borderRadius: 28, paddingVertical: 16, paddingHorizontal: 60 },
  doneBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFFFFF' },
  failCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8E4E4',
    justifyContent: 'center', alignItems: 'center',
  },
  failIcon: { fontSize: 36, color: '#A83836', fontFamily: FONTS.bold },
  failTitle: { fontFamily: FONTS.bold, fontSize: 24, color: '#1A1A1A' },
  failSub: { fontFamily: FONTS.medium, fontSize: 14, color: '#6B6B6B', textAlign: 'center' },
  retryBtn: { backgroundColor: '#1A1A1A', borderRadius: 28, paddingVertical: 16, paddingHorizontal: 60 },
  retryBtnText: { fontFamily: FONTS.bold, fontSize: 16, color: '#FFFFFF' },
});
