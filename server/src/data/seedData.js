// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Seed Data Entry Point
// Re-exports all data generation functions from one place.
// This is the canonical import path per implementation.md:
//   import { ZONES, generateAllReadings, generateNextReading } from '../data/seedData.js';
// ═══════════════════════════════════════════════════════════════

export { ZONES } from './zones.js';
export { generateReadings, generateAllReadings } from './syntheticGenerator.js';
export { generateNextReading, generateAllNextReadings } from './generateNextReading.js';
