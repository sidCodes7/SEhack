// ──────────────────────────────────────────────
// Sarvam AI Service — Voice STT + TTS
// ──────────────────────────────────────────────
// Uses Sarvam AI API for Indian language voice processing
// SARVAM_API_KEY from .env

import axios from 'axios';
import FormData from 'form-data';

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE = 'https://api.sarvam.ai';

// Language code mapping for Sarvam
const LANG_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  ta: 'ta-IN',
  te: 'te-IN',
};

/**
 * Speech-to-Text via Sarvam AI
 * Accepts an audio buffer and returns transcribed text
 */
export async function speechToText(
  audioBuffer: Buffer,
  language: string = 'en'
): Promise<string> {
  if (!SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY not configured');
  }

  const langCode = LANG_MAP[language] || 'en-IN';

  const form = new FormData();
  form.append('file', audioBuffer, { filename: 'audio.webm', contentType: 'audio/webm' });
  form.append('language_code', langCode);
  form.append('model', 'saarika:v2');

  const response = await axios.post(`${SARVAM_BASE}/speech-to-text`, form, {
    headers: {
      ...form.getHeaders(),
      'API-Subscription-Key': SARVAM_API_KEY,
    },
    timeout: 30000,
  });

  return response.data?.transcript || '';
}

/**
 * Text-to-Speech via Sarvam AI
 * Returns audio buffer (wav)
 */
export async function textToSpeech(
  text: string,
  language: string = 'en'
): Promise<Buffer> {
  if (!SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY not configured');
  }

  const langCode = LANG_MAP[language] || 'en-IN';

  const response = await axios.post(
    `${SARVAM_BASE}/text-to-speech`,
    {
      inputs: [text.slice(0, 500)], // Sarvam has a character limit
      target_language_code: langCode,
      speaker: 'meera',  // Indian English/Hindi female voice
      model: 'bulbul:v1',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'API-Subscription-Key': SARVAM_API_KEY,
      },
      timeout: 30000,
    }
  );

  // Response contains base64 audio
  const audioBase64 = response.data?.audios?.[0] || '';
  return Buffer.from(audioBase64, 'base64');
}

/**
 * Translate text via Sarvam AI (better Indic support than LibreTranslate)
 */
export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  if (!SARVAM_API_KEY) {
    throw new Error('SARVAM_API_KEY not configured');
  }

  const targetCode = LANG_MAP[targetLanguage] || 'hi-IN';

  const response = await axios.post(
    `${SARVAM_BASE}/translate`,
    {
      input: text,
      source_language_code: 'en-IN',
      target_language_code: targetCode,
      speaker_gender: 'Female',
      mode: 'formal',
      model: 'mayura:v1',
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'API-Subscription-Key': SARVAM_API_KEY,
      },
      timeout: 15000,
    }
  );

  return response.data?.translated_text || text;
}
