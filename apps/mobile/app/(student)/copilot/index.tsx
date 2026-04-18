import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing } from '../../../constants/spacing';
import api from '../../../services/api';

export default function CopilotScreen() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      role: 'system',
      type: 'headsup',
      title: 'Scholarship deadline in 2 days',
      subtitle: '3 steps still pending',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('en');

  const languages = ['EN', 'HI', 'MR', 'TA', 'TE'];

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/copilot/chat', {
        message: userMsg.content,
        language: language.toLowerCase(),
      });
      const reply = res.data.data;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply.response || reply.message || 'I can help with that!',
          source: reply.source,
          action: reply.action,
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I couldn\'t process that. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Aether Copilot</Text>
          <Text style={styles.headerSub}>Ask anything about campus</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>âœ•</Text>
        </TouchableOpacity>
      </View>

      {/* Language selector */}
      <View style={styles.langRow}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[styles.langChip, language === lang.toLowerCase() && styles.langChipActive]}
            onPress={() => setLanguage(lang.toLowerCase())}
          >
            <Text style={[styles.langText, language === lang.toLowerCase() && styles.langTextActive]}>
              {lang}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => {
          if (msg.type === 'headsup') {
            return (
              <View key={i} style={styles.headsupCard}>
                <View style={styles.headsupHeader}>
                  <Text style={{ fontSize: 14 }}>â­</Text>
                  <Text style={styles.headsupLabel}>HEADS UP</Text>
                  <View style={{ flex: 1 }} />
                  <View style={styles.arrowBtn}>
                    <Text style={styles.arrowBtnText}>â†’</Text>
                  </View>
                </View>
                <Text style={styles.headsupTitle}>{msg.title}</Text>
                <Text style={styles.headsupSub}>{msg.subtitle}</Text>
              </View>
            );
          }

          if (msg.role === 'user') {
            return (
              <View key={i} style={styles.userBubble}>
                <Text style={styles.userText}>{msg.content}</Text>
              </View>
            );
          }

          return (
            <View key={i}>
              <View style={styles.assistantBubble}>
                <Text style={styles.assistantText}>{msg.content}</Text>
              </View>
              {msg.source && (
                <Text style={styles.sourceText}>Source: {msg.source}</Text>
              )}
              {msg.action && (
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionText}>{msg.action.label} â†’</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {loading && (
          <View style={styles.assistantBubble}>
            <ActivityIndicator size="small" color={colors.textSecondary} />
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.micButton}>
            <Text style={{ fontSize: 18 }}>ðŸŽ™</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask anything..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Text style={styles.sendText}>â†‘</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 28,
  },
  headerSub: {
    ...typography.caption,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { fontSize: 18, color: colors.textSecondary },

  // Language
  langRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  langChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
  },
  langChipActive: {
    backgroundColor: colors.accent,
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  langTextActive: {
    color: colors.textWhite,
  },

  // Messages
  messageList: { flex: 1 },
  messageContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.lg,
  },

  // Heads up card
  headsupCard: {
    backgroundColor: colors.cardGreen,
    borderRadius: spacing.cardRadius,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
  },
  headsupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  headsupLabel: {
    ...typography.sectionLabel,
    fontSize: 11,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowBtnText: { color: colors.textWhite, fontSize: 16 },
  headsupTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headsupSub: {
    ...typography.caption,
    color: colors.accentGreen,
  },

  // Bubbles
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    maxWidth: '80%',
    marginBottom: spacing.md,
  },
  userText: {
    color: colors.textWhite,
    fontSize: 16,
    lineHeight: 22,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardLavender,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    maxWidth: '80%',
    marginBottom: 4,
  },
  assistantText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 22,
  },
  sourceText: {
    ...typography.small,
    fontStyle: 'italic',
    marginBottom: spacing.md,
    marginLeft: 4,
  },
  actionButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: spacing.md,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 28,
    marginHorizontal: spacing.screenPadding,
    marginBottom: 30,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 4,
  },
  micButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: colors.textWhite,
    fontSize: 20,
    fontWeight: '700',
  },
});

