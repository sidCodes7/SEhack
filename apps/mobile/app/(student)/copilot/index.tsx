import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CopilotChat } from '../../components/copilot/CopilotChat';

export default function CopilotScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <CopilotChat onClose={() => router.back()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F5' },
});
