import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FONTS } from '../../constants/typography';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
  { code: 'mr', label: 'MR' },
  { code: 'ta', label: 'TA' },
  { code: 'te', label: 'TE' },
];

interface LanguageToggleProps {
  selected: string;
  onSelect: (code: string) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ selected, onSelect }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {LANGUAGES.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[styles.pill, selected === lang.code && styles.pillActive]}
          onPress={() => onSelect(lang.code)}
        >
          <Text style={[styles.pillText, selected === lang.code && styles.pillTextActive]}>
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', marginBottom: 16 },
  pill: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#F4F4EF', marginRight: 8,
  },
  pillActive: { backgroundColor: '#1A1A1A' },
  pillText: { fontFamily: FONTS.bold, fontSize: 13, color: '#6B6B6B' },
  pillTextActive: { color: '#FFFFFF' },
});
