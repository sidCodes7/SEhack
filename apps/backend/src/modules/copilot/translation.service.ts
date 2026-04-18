// ──────────────────────────────────────────────
// Translation Service — LibreTranslate
// ──────────────────────────────────────────────
// Called AFTER Grok responds, never before.
// If preferred_language === 'en', skip entirely.

import axios from 'axios';

type SupportedLanguage = 'en' | 'hi' | 'ta' | 'mr' | 'te';

const LIBRE_TRANSLATE_URL = process.env.LIBRE_TRANSLATE_URL || 'https://libretranslate.de';

/**
 * Translate text from English to the target language.
 * Uses LibreTranslate API. Falls back to returning original text on failure.
 */
export async function translate(
  text: string,
  targetLanguage: SupportedLanguage
): Promise<string> {
  // Skip if already English
  if (targetLanguage === 'en') {
    return text;
  }

  try {
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
        timeout: 10000, // 10s timeout
      }
    );

    return response.data?.translatedText || text;
  } catch (error) {
    // Translation failure should not break the copilot — return original
    console.warn(`⚠️ Translation to ${targetLanguage} failed, returning English text.`, error instanceof Error ? error.message : '');
    return text;
  }
}
