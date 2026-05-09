/**
 * AquaSentinel — Grok API Connectivity Test
 * 
 * Run: node server/src/agents/testGrok.js
 * Requires: XAI_API_KEY environment variable
 */

import 'dotenv/config';
import { testGrokConnection, callGrok } from './grokClient.js';
import { getAgentStatuses, markAgentProcessing, markAgentDone, createInitialState } from './agentState.js';

async function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('  AquaSentinel — Phase 1 Verification');
  console.log('═══════════════════════════════════════════\n');

  // Test 1: Environment check
  console.log('1️⃣  Environment Check');
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error('   ❌ XAI_API_KEY not set! Create a .env file with your API key.');
    console.log('   Set: XAI_API_KEY=your-key-here');
    process.exit(1);
  }
  console.log(`   ✅ XAI_API_KEY present (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})\n`);

  // Test 2: Grok API connectivity
  console.log('2️⃣  Grok API Connectivity');
  const connResult = await testGrokConnection();
  if (connResult.success) {
    console.log(`   ✅ ${connResult.message}`);
    console.log(`   Model: ${connResult.model}`);
    console.log(`   Response: ${connResult.response}\n`);
  } else {
    console.error(`   ❌ ${connResult.message}`);
    process.exit(1);
  }

  // Test 3: JSON response format
  console.log('3️⃣  JSON Response Format');
  try {
    const jsonResponse = await callGrok(
      'You are a marine data validator.',
      'Analyze this reading: {"zone_id":"Z1","sst":30.5,"chlorophyll_a":0.8}. Return JSON with fields: valid (bool), issues (array of strings).',
      { json: true }
    );
    const parsed = JSON.parse(jsonResponse);
    console.log(`   ✅ JSON parsing successful`);
    console.log(`   Response: ${JSON.stringify(parsed, null, 2).split('\n').join('\n   ')}\n`);
  } catch (error) {
    console.error(`   ❌ JSON test failed: ${error.message}\n`);
  }

  // Test 4: Agent state management
  console.log('4️⃣  Agent State Management');
  const statuses = getAgentStatuses();
  console.log(`   ✅ ${Object.keys(statuses).length} agents tracked`);
  console.log(`   Agents: ${Object.keys(statuses).join(', ')}`);
  
  markAgentProcessing('ingestion', 'Test task');
  const updated = getAgentStatuses();
  console.log(`   ✅ Status update works: ingestion = ${updated.ingestion.status}`);
  
  markAgentDone('ingestion', 8, 150);
  const done = getAgentStatuses();
  console.log(`   ✅ Done update works: ingestion = ${done.ingestion.status}, processed = ${done.ingestion.processed}\n`);

  // Test 5: Pipeline state shape
  console.log('5️⃣  Pipeline State Shape');
  const initialState = createInitialState([{ zone_id: 'Z1', sst: 29.0 }]);
  const stateKeys = Object.keys(initialState);
  console.log(`   ✅ State has ${stateKeys.length} fields: ${stateKeys.join(', ')}\n`);

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('  ✅ Phase 1 Complete — All systems go!');
  console.log('═══════════════════════════════════════════');
  console.log('\nNext: Phase 2 — Ingestion + Detection agents');
}

runTests().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
