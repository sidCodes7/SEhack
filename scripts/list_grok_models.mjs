import 'dotenv/config';
import '../server/src/middleware/dnsFix.js';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

try {
  const models = await client.models.list();
  for (const m of models.data) {
    console.log(`  ${m.id}`);
  }
} catch (e) {
  console.error('Error listing models:', e.message);
}
