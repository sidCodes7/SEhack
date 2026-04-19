import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../../constants/colors';
import { spacing } from '../../../constants/spacing';
import { typography } from '../../../constants/typography';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'mr', label: 'MR' },
  { code: 'ta', label: 'TA' },
];

export default function CopilotChatScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Initial mock state matching web exactly
    setMessages([
      { id: 'alert-1', type: 'alert', title: 'Scholarship deadline in 2 days', message: '3 steps still pending' },
      { id: 'user-1', type: 'user', text: 'Mini project kab submit karna hai?' },
      { id: 'bot-1', type: 'bot', text: '22 April, raat 11:59 baje tak submit karna hai.', source: "Source: Prof. Harshav's notice", canSpeak: true },
      { id: 'user-2', type: 'user', text: 'What rooms are available tomorrow at 2pm?' },
      { id: 'bot-2', type: 'bot', text: 'Room 302 and Lab 201 are free at 2 PM tomorrow.', canSpeak: true, action: { label: 'Book Room 302', icon: '↗' } },
    ]);
  }, []);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { id: `user-${Date.now()}`, type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Mock response
    setTimeout(() => {
      const demoReplies = [
        { text: 'I found that information for you. The deadline is next Friday at 5 PM.', source: 'Source: Academic Calendar' },
        { text: 'Based on the latest notices, you have 2 pending assignments this week.', source: 'Source: Recent Notices' },
        { text: 'Room 302 and Lab 201 are available. Shall I book one for you?', action: { label: 'Book Room 302', icon: '↗' } },
        { text: 'Your current karma score is 240 points. You\'re in the top 28% of students!', source: 'Source: Karma System' },
      ];
      const reply = demoReplies[Math.floor(Math.random() * demoReplies.length)];
      setMessages(prev => [...prev, { id: `bot-${Date.now()}`, type: 'bot', ...reply, canSpeak: true }]);
      setLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <Text style={styles.grokIcon}>✦</Text>
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
                      <Text style={{fontSize: 14, color: colors.textSecondary}}>★</Text>
                      <Text style={styles.alertLabel}>HEADS UP</Text>
                    </View>
                    <View style={styles.alertBtn}><Text style={{fontSize: 14}}>→</Text></View>
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
                      <TouchableOpacity style={styles.ttsBtn}>
                        <Text style={styles.ttsIcon}>▶</Text>
                        <Text style={styles.ttsText}>Listen</Text>
                      </TouchableOpacity>
                    )}
                    
                    {msg.action && (
                      <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionText}>{msg.action.label}</Text>
                        <Text style={styles.actionIcon}>{msg.action.icon}</Text>
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
                  <Text style={{color: colors.accentGold, fontSize:12}}>✦</Text>
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
                onPress={() => setIsRecording(false)}
              >
                <Text style={{color: '#FFF', fontSize: 20}}>◼</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TouchableOpacity 
                style={styles.micBtn}
                onPress={() => setIsRecording(true)}
              >
                <Text style={{fontSize: 20}}>🎙</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.textInput}
                placeholder="Ask anything..."
                placeholderTextColor={colors.textMuted}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !input.trim() && {opacity: 0.5}]}
                onPress={sendMessage}
                disabled={!input.trim() || loading}
              >
                <Text style={{color: '#FFF', fontSize: 20}}>↑</Text>
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
  ttsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceAlt, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderCurve: 'continuous' },
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
