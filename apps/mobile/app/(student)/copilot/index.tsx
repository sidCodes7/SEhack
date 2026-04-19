import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { colors } from '../../../constants/colors';
import { spacing } from '../../../constants/spacing';
import api from '../../../services/api';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'mr', label: 'MR' },
  { code: 'ta', label: 'TA' },
];

// SPIT Knowledge Base for offline RAG simulation
const SPIT_KB = [
  { keywords: ['semester', 'start', 'when', 'begin', 'even'], answer: 'The Even Semester (2024-25) starts on 20th January 2025.', source: 'Academic Calendar 2024-25' },
  { keywords: ['oculus', 'fest', 'cultural'], answer: 'OCULUS 2025 (Annual Cultural Fest) is scheduled for 21st-23rd March 2025.', source: 'Academic Calendar' },
  { keywords: ['convocation'], answer: 'Convocation Day is scheduled for 5th April 2025.', source: 'Academic Calendar' },
  { keywords: ['annual day'], answer: 'SPIT Annual Day is on 25th April 2025.', source: 'Academic Calendar' },
  { keywords: ['presentation', 'project', 'paper', 'submit', 'deadline', 'mini'], answer: 'Technical Paper/Project presentations (BE) are on 28th-30th April and 2nd May 2025. Mini project deadline is typically 22nd April.', source: 'Academic Calendar' },
  { keywords: ['attempt', 'exam', 'special'], answer: 'SPIT allows only 2 attempts per academic year (Regular + Re-exam in July). No special exams are offered.', source: 'Exam Cell Guidelines' },
  { keywords: ['re-exam', 'reexam', 'july', 'miss'], answer: 'Re-exams are in the 3rd week of July. If you miss it, you must wait until the next academic year (May/July).', source: 'Exam Regulations' },
  { keywords: ['backlog'], answer: 'Backlogs can be given along with regular exams, but ERP registration is compulsory. Only 2 attempts per academic year.', source: 'Exam Cell' },
  { keywords: ['attendance', 'rule', 'percent', 'absent'], answer: '75% attendance is mandatory for ESE eligibility. Below 50% = blocked from exam. 65-74% = 15-day improvement program. 50-64% = Rs 2000 fine + improvement program.', source: 'Attendance Policy' },
  { keywords: ['fee', 'fine', 'erp', 'late', 'cost'], answer: 'Late ERP registration: Rs 2000/sem. Re-exam fee: Rs 1000 (normal), Rs 5000 (low attendance), Rs 10000 (malpractice).', source: 'Fee Structure' },
  { keywords: ['grade', 'grading', 'cgpa', 'aa', 'sa'], answer: 'SPIT uses hybrid grading (absolute + relative). "SA" is a department cutoff for AA grade. Final grades are based on class distribution.', source: 'Grading Policy' },
  { keywords: ['promotion', 'fy', 'sy', 'ty', 'credit', 'year'], answer: 'FY to SY: need 50% credits. SY to TY: need 70% total credits. No odd-to-even semester restriction.', source: 'Promotion Rules' },
  { keywords: ['degree', 'btech', 'duration', 'graduate'], answer: 'B.Tech requires minimum 160 credits, 4.0 CGPA, and must be completed within max 6 years.', source: 'Degree Requirements' },
  { keywords: ['malpractice', 'cheat', 'copy'], answer: 'First offense: grade reduced + Rs 10000 fine + summer term. Second offense: year down + re-admission required.', source: 'Academic Integrity' },
  { keywords: ['mse', 'mid sem', 'midsem', 'midterm'], answer: 'MSE is 30 marks, 1 hour duration. No re-exam for MSE. Absent students get pro-rata marks with valid reason.', source: 'Evaluation System' },
  { keywords: ['ese', 'end sem', 'endsem', 'final'], answer: 'ESE is worth 100 marks, 3 hours duration. 75% attendance is mandatory for ESE eligibility.', source: 'Evaluation System' },
  { keywords: ['room', 'available', 'book', 'free'], answer: 'Room 302 and Lab 201 are available at 2 PM tomorrow. Shall I book one for you?', source: 'Room Booking System', action: { label: 'Book Room 302', target: 'bookings/request' } },
  { keywords: ['karma', 'score', 'points', 'rank'], answer: 'Your current karma score is 240 points. You are in the top 28% of students! Attend more classes and submit assignments on time to boost it.', source: 'Karma System' },
  { keywords: ['canteen', 'food', 'menu', 'lunch'], answer: 'Today\'s canteen specials: Paneer Butter Masala (Rs 80), Chicken Biryani (Rs 120), Vada Pav (Rs 20). Canteen hours: 8 AM - 6 PM.', source: 'Canteen System' },
  { keywords: ['library', 'book', 'borrow', 'return'], answer: 'Library hours: 9 AM - 8 PM. You can borrow up to 4 books for 14 days. Overdue fine: Rs 5/day. Digital resources available 24/7 via OPAC portal.', source: 'Library System' },
  { keywords: ['club', 'csi', 'workshop', 'hackathon', 'event'], answer: 'SPIT CSI Chapter has an AI Agents Workshop today at 4:00 PM in Room 101. Upcoming: Internal Hackathon on Apr 25th.', source: 'CSI Club' },
  { keywords: ['hello', 'hi', 'hey', 'help'], answer: 'Hello! I\'m Aether Copilot, powered by Grok AI. I can help you with:\n- Academic calendar & deadlines\n- Exam rules & grading policies\n- Attendance requirements\n- Room bookings\n- Finance & fees\n- Club events\n\nJust ask me anything!', source: 'Copilot' },
];

function findKBAnswer(query: string) {
  const q = query.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const entry of SPIT_KB) {
    const score = entry.keywords.filter(kw => q.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  return bestMatch && bestScore > 0 ? bestMatch : null;
}

export default function CopilotChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setMessages([
      { id: 'alert-1', type: 'alert', title: 'Scholarship deadline in 2 days', message: '3 steps still pending' },
      { id: 'user-1', type: 'user', text: 'Mini project kab submit karna hai?' },
      { id: 'bot-1', type: 'bot', text: 'Technical Paper/Project presentations (BE) are on 28th-30th April and 2nd May 2025. Mini project deadline is typically 22nd April.', source: 'Source: Academic Calendar', canSpeak: true },
      { id: 'user-2', type: 'user', text: 'What rooms are available tomorrow at 2pm?' },
      { id: 'bot-2', type: 'bot', text: 'Room 302 and Lab 201 are free at 2 PM tomorrow.', canSpeak: true, action: { label: 'Book Room 302', target: 'bookings/request' } },
    ]);
  }, []);

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    Speech.speak(text, {
      language: lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : lang === 'ta' ? 'ta-IN' : 'en-US',
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleAction = (action: any) => {
    if (action?.target === 'bookings/request') {
      router.push('/(student)/bookings/request');
    } else if (action?.target) {
      router.push(`/(student)/${action.target}`);
    } else {
      Alert.alert('Action', action?.label || 'Done!');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    const userMsg = { id: `user-${Date.now()}`, type: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // Try real API first
    try {
      const res = await api.post('/copilot/chat', {
        message: userText,
        language: lang,
      });
      const reply = res.data.data;
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: reply.response || reply.message || 'I found that for you!',
        source: reply.source ? `Source: ${reply.source}` : undefined,
        canSpeak: true,
        action: reply.action,
      }]);
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      return;
    } catch {}

    // Fallback: SPIT Knowledge Base RAG
    const kbMatch = findKBAnswer(userText);
    if (kbMatch) {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: kbMatch.answer,
        source: `Source: ${kbMatch.source}`,
        canSpeak: true,
        action: kbMatch.action,
      }]);
    } else {
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        type: 'bot',
        text: 'I don\'t have specific info on that. Try asking about attendance rules, exam policies, fees, grading, room availability, or the academic calendar!',
        canSpeak: true,
      }]);
    }
    setLoading(false);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Aether Copilot</Text>
            <Text style={styles.sub}>Powered by Grok AI + Sarvam Voice</Text>
          </View>
        </View>

        {/* Language pills */}
        <View style={styles.langRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{flexDirection:'row', gap:8, paddingRight:16}}>
              {LANGUAGES.map(l => (
                <TouchableOpacity 
                  key={l.code} 
                  style={[styles.langChip, lang === l.code && styles.langChipActive]}
                  onPress={() => setLang(l.code)}
                >
                  <Text style={[styles.langText, lang === l.code && styles.langTextActive]}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.grokBadge}>
            <Text style={styles.grokIcon}>{'✦'}</Text>
            <Text style={styles.grokText}>Grok</Text>
          </View>
        </View>

        {/* Chat History */}
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatScroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => {
            if (msg.type === 'alert') {
              return (
                <View key={msg.id} style={styles.alertCard}>
                  <View style={styles.alertTopRow}>
                    <View style={styles.alertLeft}>
                      <Text style={{fontSize: 14, color: colors.textSecondary}}>{'★'}</Text>
                      <Text style={styles.alertLabel}>HEADS UP</Text>
                    </View>
                    <View style={styles.alertBtn}><Text style={{fontSize: 14}}>{'→'}</Text></View>
                  </View>
                  <Text style={styles.alertTitle}>{msg.title}</Text>
                  <Text style={styles.alertSub}>{msg.message}</Text>
                </View>
              );
            }

            if (msg.type === 'user') {
              return (
                <View key={msg.id} style={styles.msgUserWrap}>
                  <View style={styles.bubbleUser}>
                    <Text style={styles.textUser}>{msg.text}</Text>
                  </View>
                </View>
              );
            }

            return (
              <View key={msg.id} style={styles.msgBotWrap}>
                <View style={styles.bubbleBot}>
                  <Text style={styles.textBot}>{msg.text}</Text>
                </View>
                <View style={styles.botActions}>
                  {msg.source && <Text style={styles.sourceText}>{msg.source}</Text>}
                  
                  <View style={styles.botRow}>
                    {msg.canSpeak && (
                      <TouchableOpacity style={styles.ttsBtn} onPress={() => handleSpeak(msg.text)}>
                        <Text style={styles.ttsIcon}>{isSpeaking ? '◼' : '▶'}</Text>
                        <Text style={styles.ttsText}>{isSpeaking ? 'Stop' : 'Listen'}</Text>
                      </TouchableOpacity>
                    )}
                    
                    {msg.action && (
                      <TouchableOpacity style={styles.actionBtn} onPress={() => handleAction(msg.action)}>
                        <Text style={styles.actionText}>{msg.action.label}</Text>
                        <Text style={styles.actionIcon}>{'→'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={styles.msgBotWrap}>
              <View style={[styles.bubbleBot, { paddingVertical: 12 }]}>
                <View style={{flexDirection:'row', alignItems:'center', gap:6}}>
                  <Text style={{color: colors.accentGold, fontSize:12}}>{'✦'}</Text>
                  <Text style={{fontSize: 12, fontWeight:'600', color: colors.textMuted}}>Grok is thinking...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputArea}>
          {isRecording ? (
            <View style={styles.recordingRow}>
              <View style={styles.waveRow}>
                <View style={styles.waveBar} />
                <View style={[styles.waveBar, {height: 24}]} />
                <View style={[styles.waveBar, {height: 12}]} />
                <View style={[styles.waveBar, {height: 20}]} />
                <View style={styles.waveBar} />
              </View>
              <Text style={styles.listeningText}>Listening via Sarvam...</Text>
              <TouchableOpacity 
                style={[styles.micBtn, {backgroundColor: colors.accentRed}]}
                onPress={() => {
                  setIsRecording(false);
                  // Simulate voice input for demo
                  setInput('What is the attendance rule?');
                }}
              >
                <Text style={{color: '#FFF', fontSize: 20}}>{'◼'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TouchableOpacity 
                style={styles.micBtn}
                onPress={() => setIsRecording(true)}
              >
                <Text style={{fontSize: 20}}>{'🎙'}</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="Ask anything..."
                placeholderTextColor={colors.textMuted}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !input.trim() && {opacity: 0.5}]}
                onPress={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Text style={{color: '#FFF', fontSize: 20}}>{'↑'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingBottom: spacing.tabBarHeight },
  
  header: { paddingHorizontal: spacing.screenPadding, paddingTop: 60, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', color: colors.textPrimary },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },

  langRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screenPadding, marginBottom: 16 },
  langChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderLight },
  langChipActive: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
  langText: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  langTextActive: { color: colors.textWhite },
  grokBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardLavender, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginLeft: 'auto' },
  grokIcon: { color: colors.accentGold, fontSize: 12, marginRight: 4 },
  grokText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },

  chatScroll: { paddingHorizontal: spacing.screenPadding, paddingBottom: 24 },
  
  alertCard: { backgroundColor: colors.cardMint, borderRadius: 16, padding: 16, marginBottom: 20 },
  alertTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  alertLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.textSecondary },
  alertBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  alertSub: { fontSize: 13, color: colors.textSecondary },

  msgUserWrap: { alignItems: 'flex-end', marginBottom: 16 },
  bubbleUser: { backgroundColor: colors.textPrimary, borderRadius: 20, borderBottomRightRadius: 4, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '80%' },
  textUser: { color: colors.textWhite, fontSize: 15, lineHeight: 22 },

  msgBotWrap: { alignItems: 'flex-start', marginBottom: 24 },
  bubbleBot: { backgroundColor: colors.surface, borderRadius: 20, borderBottomLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, maxWidth: '85%', shadowColor: '#000', shadowOffset: {width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  textBot: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
  
  botActions: { marginTop: 8, marginLeft: 12 },
  sourceText: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginBottom: 8 },
  botRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ttsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  ttsIcon: { fontSize: 10, color: colors.textSecondary, marginRight: 4 },
  ttsText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  actionText: { fontSize: 11, fontWeight: '700', color: colors.info, marginRight: 4 },
  actionIcon: { fontSize: 12, color: colors.info },

  inputArea: { paddingHorizontal: spacing.screenPadding, paddingBottom: 16, paddingTop: 8, backgroundColor: colors.background },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 28, padding: 4, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  micBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  textInput: { flex: 1, height: 48, fontSize: 15, color: colors.textPrimary },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.textPrimary, justifyContent: 'center', alignItems: 'center', marginRight: 4 },

  recordingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 28, padding: 4, paddingLeft: 16, shadowColor: '#000', shadowOffset: {width:0, height:4}, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  waveRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  waveBar: { width: 4, height: 16, borderRadius: 2, backgroundColor: colors.accentRed, opacity: 0.6 },
  listeningText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.accentRed, marginLeft: 16 },
});
