// ──────────────────────────────────────────────
// Translation Service — Sarvam AI (primary) + LibreTranslate (fallback)
// ──────────────────────────────────────────────
// Called AFTER Grok responds, never before.
// If preferred_language === 'en', skip entirely.
// Sarvam AI provides superior Indian language translation + voice.

import axios from 'axios';

type SupportedLanguage = 'en' | 'hi' | 'ta' | 'mr' | 'te';

// Sarvam AI language codes
const SARVAM_LANG_MAP: Record<string, string> = {
  hi: 'hi-IN',
  ta: 'ta-IN',
  mr: 'mr-IN',
  te: 'te-IN',
};

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const SARVAM_BASE_URL = 'https://api.sarvam.ai';
const LIBRE_TRANSLATE_URL = process.env.LIBRE_TRANSLATE_URL || 'https://libretranslate.de';

/**
 * Translate text from English to the target language.
 * Uses Sarvam AI (primary) → LibreTranslate (fallback) → original text.
 */
export async function translate(
  text: string,
  targetLanguage: SupportedLanguage
): Promise<string> {
  // Skip if already English
  if (targetLanguage === 'en') {
    return text;
  }

  // Try Sarvam AI first (better for Indian languages)
  if (SARVAM_API_KEY) {
    try {
      return await translateWithSarvam(text, targetLanguage);
    } catch (error) {
      console.warn('⚠️ Sarvam translation failed, trying LibreTranslate...', error instanceof Error ? error.message : '');
    }
  }

  // Fallback to LibreTranslate
  try {
    return await translateWithLibre(text, targetLanguage);
  } catch (error) {
    console.warn(`⚠️ All translation failed for ${targetLanguage}, returning English.`, error instanceof Error ? error.message : '');
    return text;
  }
}

/**
 * Translate using Sarvam AI API.
 */
async function translateWithSarvam(text: string, targetLanguage: SupportedLanguage): Promise<string> {
  const sarvamLang = SARVAM_LANG_MAP[targetLanguage];
  if (!sarvamLang) return text;

  const response = await axios.post(
    `${SARVAM_BASE_URL}/translate`,
    {
      input: text,
      source_language_code: 'en-IN',
      target_language_code: sarvamLang,
      mode: 'formal',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      timeout: 10000,
    }
  );

  return response.data?.translated_text || text;
}

/**
 * Translate using LibreTranslate API (fallback).
 */
async function translateWithLibre(text: string, targetLanguage: SupportedLanguage): Promise<string> {
  const response = await axios.post(
    `${LIBRE_TRANSLATE_URL}/translate`,
    {
      q: text,
      source: 'en',
      target: targetLanguage,
      format: 'text',
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    }
  );

  return response.data?.translatedText || text;
}
