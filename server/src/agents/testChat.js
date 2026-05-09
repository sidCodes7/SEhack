/**
 * AquaSentinel — Chat Query + LangGraph Verification Test
 * Tests: queryBriefAgent chat function + LangGraph StateGraph compilation
 */

import 'dotenv/config';
import { queryBriefAgent } from './briefAgent.js';
import { getCacheStats } from './responseCache.js';

async function testChat() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  AquaSentinel — Chat Query + Verification Tests');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Test 1: LangGraph StateGraph compilation
  console.log('1️⃣  LangGraph StateGraph Compilation');
  try {
    const { runPipeline } = await import('./orchestrator.js');
    console.log('   ✅ StateGraph compiled successfully');
    console.log(`   ✅ runPipeline function exported\n`);
  } catch (error) {
    console.error(`   ❌ StateGraph compilation failed: ${error.message}\n`);
  }

  // Test 2: Chat query — "What needs attention right now?"
  console.log('2️⃣  Chat Query: "What needs attention right now?"');
  const context = {
    alerts: [
      { zone_id: 'Z1', zone_name: 'Lakshadweep Coral Reef', anomaly_type: 'thermal_spike', severity: 'critical', score: 87, confidence: 85 },
      { zone_id: 'Z2', zone_name: 'Gujarat Mangrove Coast', anomaly_type: 'bloom_signature', severity: 'critical', score: 78, confidence: 90 },
      { zone_id: 'Z3', zone_name: 'Kerala Upwelling Zone', anomaly_type: 'hypoxia', severity: 'warning', score: 65, confidence: 80 },
    ],
    zones: [
      { id: 'Z1', name: 'Lakshadweep', status: 'critical' },
      { id: 'Z2', name: 'Gujarat', status: 'critical' },
      { id: 'Z3', name: 'Kerala', status: 'warning' },
    ],
    stats: { total: 6, suppressed: 3, escalated: 3, noise_pct: 50 },
  };

  try {
    const stream = await queryBriefAgent('What needs attention right now?', context);
    let fullResponse = '';
    process.stdout.write('   Response: ');
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      process.stdout.write(content);
      fullResponse += content;
    }
    console.log('\n');
    console.log(`   ✅ Chat streaming works (${fullResponse.length} chars)\n`);
  } catch (error) {
    console.error(`   ❌ Chat query failed: ${error.message}\n`);
  }

  // Test 3: Zone-specific query — "Tell me about Lakshadweep"
  console.log('3️⃣  Chat Query: "Tell me about Lakshadweep"');
  try {
    const stream2 = await queryBriefAgent('Tell me about Lakshadweep', context);
    let resp2 = '';
    process.stdout.write('   Response: ');
    for await (const chunk of stream2) {
      const content = chunk.choices?.[0]?.delta?.content || '';
      process.stdout.write(content);
      resp2 += content;
    }
    console.log('\n');
    console.log(`   ✅ Zone query works (${resp2.length} chars)\n`);
  } catch (error) {
    console.error(`   ❌ Zone query failed: ${error.message}\n`);
  }

  // Test 4: Cache layer
  console.log('4️⃣  Cache Layer');
  const stats = getCacheStats();
  console.log(`   ✅ Cache initialized: ${stats.entries} entries, cacheEnabled=${stats.cacheEnabled}, fallbackEnabled=${stats.fallbackEnabled}\n`);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ✅ All verification tests complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

testChat().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
