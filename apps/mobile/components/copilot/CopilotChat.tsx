import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCopilot } from '../../hooks/useCopilot';
import { LanguageToggle } from './LanguageToggle';
import { FONTS } from '../../constants/typography';
import { SPACING } from '../../constants/spacing';
import { Card } from '../common/Card';

interface CopilotChatProps {
  onClose?: () => void;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ onClose }) => {
  const router = useRouter();
  const { messages, isLoading, language, proactiveAlerts, sendMessage, fetchAlerts, setLanguage } = useCopilot();
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Aether Copilot</Text>
          <Text style={styles.subtitle}>Ask anything about campus</Text>
        </View>
        {onClose && (
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Language toggle */}
      <LanguageToggle selected={language} onSelect={setLanguage} />

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
      >
        {/* Proactive alerts */}
        {proactiveAlerts.map((alert) => (
          <TouchableOpacity
            key={alert.id}
            onPress={() => alert.route && router.push(alert.route as any)}
          >
            <Card style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <View style={styles.alertLeft}>
                  <Text style={styles.alertStar}>★</Text>
                  <Text style={styles.alertLabel}>HEADS UP</Text>
                </View>
                <View style={styles.alertArrowCircle}>
                  <Text style={styles.alertArrow}>→</Text>
                </View>
              </View>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertSubtitle}>{alert.subtitle}</Text>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Chat bubbles */}
        {messages.map((msg) => (
          <View key={msg.id} style={msg.role === 'user' ? styles.userBubbleRow : styles.botBubbleRow}>
            <View style={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
              <Text style={msg.role === 'user' ? styles.userText : styles.botText}>
                {msg.text}
              </Text>
            </View>
            {msg.source && (
              <Text style={styles.sourceText}>Source: {msg.source}</Text>
            )}
            {msg.actionLabel && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => msg.actionRoute && router.push(msg.actionRoute as any)}
              >
                <Text style={styles.actionText}>{msg.actionLabel}</Text>
                <Text style={styles.actionArrow}> →</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={styles.botBubbleRow}>
            <View style={styles.botBubble}>
              <ActivityIndicator size="small" color="#6B6B6B" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.micBtn}>
          <Text style={styles.micIcon}>🎙</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ask anything…"
          placeholderTextColor="#A7A9BE"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F5', paddingHorizontal: SPACING.lg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingTop: 60, paddingBottom: 16,
  },
  title: { fontFamily: FONTS.bold, fontSize: 28, color: '#1A1A1A' },
  subtitle: { fontFamily: FONTS.medium, fontSize: 14, color: '#6B6B6B', marginTop: 4 },
  closeBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F4F4EF',
    justifyContent: 'center', alignItems: 'center',
  },
  closeIcon: { fontSize: 18, color: '#1A1A1A' },
  messages: { flex: 1 },
  messagesContent: { gap: 16, paddingBottom: 16 },
  alertCard: { backgroundColor: '#D8EAE1', padding: SPACING.lg, gap: 8 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertStar: { fontSize: 16, color: '#1A1A1A' },
  alertLabel: { fontFamily: FONTS.bold, fontSize: 10, color: '#1A1A1A', letterSpacing: 1 },
  alertArrowCircle: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  alertArrow: { color: '#FFFFFF', fontSize: 18 },
  alertTitle: { fontFamily: FONTS.bold, fontSize: 18, color: '#1A1A1A' },
  alertSubtitle: { fontFamily: FONTS.medium, fontSize: 14, color: '#45554F' },
  userBubbleRow: { alignItems: 'flex-end' },
  botBubbleRow: { alignItems: 'flex-start' },
  userBubble: {
    backgroundColor: '#1A1A1A', borderRadius: 20,
    borderBottomRightRadius: 4, padding: 16, maxWidth: '80%',
  },
  botBubble: {
    backgroundColor: '#EAE7F8', borderRadius: 20,
    borderBottomLeftRadius: 4, padding: 16, maxWidth: '80%',
  },
  userText: { fontFamily: FONTS.medium, fontSize: 15, color: '#FFFFFF', lineHeight: 22 },
  botText: { fontFamily: FONTS.medium, fontSize: 15, color: '#1A1A1A', lineHeight: 22 },
  sourceText: {
    fontFamily: FONTS.regular, fontSize: 12, color: '#6B6B6B',
    fontStyle: 'italic', marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F4EF',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginTop: 8,
    alignSelf: 'flex-start',
  },
  actionText: { fontFamily: FONTS.bold, fontSize: 13, color: '#1A1A1A' },
  actionArrow: { fontFamily: FONTS.bold, fontSize: 13, color: '#1A1A1A' },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F4F4EF', borderRadius: 28, padding: 6,
    marginBottom: 32,
  },
  micBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  micIcon: { fontSize: 18 },
  input: {
    flex: 1, fontFamily: FONTS.regular, fontSize: 15, color: '#1A1A1A',
    paddingVertical: 8,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A1A',
    justifyContent: 'center', alignItems: 'center',
  },
  sendIcon: { color: '#FFFFFF', fontSize: 20, fontFamily: FONTS.bold },
});
