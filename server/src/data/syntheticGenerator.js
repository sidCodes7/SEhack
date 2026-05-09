// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Synthetic Data Generator
// "The Arabian Sea Crisis" — 30 days × 8 zones × hourly readings
// 5,760 total data points with seeded anomaly trajectories
// ═══════════════════════════════════════════════════════════════

import { ZONES } from './zones.js';

// ───────────────────────────────────────────
// Gaussian random (Box-Muller transform)
// ───────────────────────────────────────────
function gaussianRandom(mean = 0, std = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

// Clamp value to reasonable physical range
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// ───────────────────────────────────────────
// Diurnal cycle: slight SST variation by hour
// ───────────────────────────────────────────
function diurnalOffset(hour, amplitude = 0.3) {
  // Peak at ~14:00, trough at ~05:00
  return amplitude * Math.sin(((hour - 5) / 24) * 2 * Math.PI);
}

// ───────────────────────────────────────────
// Generate baseline reading for any zone
// ───────────────────────────────────────────
function baseReading(zone, hour) {
  const b = zone.baseline_config;
  return {
    sst: gaussianRandom(b.sst.mean + diurnalOffset(hour, 0.2), b.sst.std * 0.5),
    chlorophyll: Math.max(0.01, gaussianRandom(b.chlorophyll.mean, b.chlorophyll.std * 0.5)),
    dissolved_o2: Math.max(0.5, gaussianRandom(b.dissolved_o2.mean, b.dissolved_o2.std * 0.5)),
    turbidity: Math.max(0.1, gaussianRandom(b.turbidity.mean, b.turbidity.std * 0.5)),
    ph: clamp(gaussianRandom(b.ph.mean, b.ph.std * 0.5), 7.5, 8.5),
    salinity: Math.max(20, gaussianRandom(b.salinity.mean, b.salinity.std * 0.5)),
    wind_speed: Math.max(0, gaussianRandom(b.wind_speed.mean, b.wind_speed.std * 0.5)),
    wave_height: Math.max(0.1, gaussianRandom(b.wave_height.mean, b.wave_height.std * 0.5)),
  };
}

// ═══════════════════════════════════════════════════════════════
// ANOMALY INJECTION FUNCTIONS (one per zone scenario)
// ═══════════════════════════════════════════════════════════════

// Z1 Lakshadweep: SST ramp +0.3°C/day from day 22 → day 30 = +2.4°C
function injectZ1(reading, day, hour) {
  if (day >= 22) {
    const daysIn = day - 22;
    const ramp = daysIn * 0.3;
    // Smooth hourly ramp within the day
    const hourFrac = hour / 24;
    const extra = ramp + (0.3 * hourFrac);
    reading.sst += extra;
  }
  return reading;
}

// Z2 Gujarat: Chlorophyll spike — day 27: 3×, day 29: 5×
function injectZ2(reading, day, hour) {
  if (day >= 27 && day <= 28) {
    const multiplier = 2.5 + (day - 27) * 0.5 + gaussianRandom(0, 0.2);
    reading.chlorophyll = reading.chlorophyll * multiplier;
    // Noctiluca blooms reduce DO slightly and increase turbidity
    reading.dissolved_o2 -= 0.3;
    reading.turbidity += 1.5;
  } else if (day >= 29) {
    const multiplier = 4.5 + gaussianRandom(0, 0.3);
    reading.chlorophyll = reading.chlorophyll * multiplier;
    reading.dissolved_o2 -= 0.8;
    reading.turbidity += 3.0;
  }
  return reading;
}

// Z3 Kerala: DO declining -0.15/day from day 20
function injectZ3(reading, day) {
  if (day >= 20) {
    const daysIn = day - 20;
    reading.dissolved_o2 -= daysIn * 0.15;
    // Slight turbidity increase as hypoxia develops
    reading.turbidity += daysIn * 0.1;
  }
  return reading;
}

// Z4 Mumbai: Normal but slight turbidity bump days 25-30 (correlated with Z3)
function injectZ4(reading, day) {
  if (day >= 25) {
    const daysIn = day - 25;
    reading.turbidity += daysIn * 0.2 + gaussianRandom(0, 0.3);
  }
  return reading;
}

// Z5 Andaman: SST ramp starting day 25 (+0.2°C/day) — 3 days AFTER Z1
function injectZ5(reading, day, hour) {
  if (day >= 25) {
    const daysIn = day - 25;
    const ramp = daysIn * 0.2;
    const hourFrac = hour / 24;
    reading.sst += ramp + (0.2 * hourFrac);
  }
  return reading;
}

// Z6 Sundarbans: pH drop starting day 28 (-0.03/day)
function injectZ6(reading, day) {
  if (day >= 28) {
    const daysIn = day - 28;
    reading.ph -= daysIn * 0.03;
    // Acidification slightly correlated with salinity change
    reading.salinity += daysIn * 0.1;
  }
  return reading;
}

// Z7 Goa: Chlorophyll noise (0.5-1.2) — looks like bloom but isn't
function injectZ7(reading, day) {
  // Natural-looking oscillation that triage should suppress
  const noise = 0.5 + Math.abs(Math.sin(day * 0.7)) * 0.7 + gaussianRandom(0, 0.15);
  reading.chlorophyll = clamp(noise, 0.3, 1.4);
  return reading;
}

// Z8 Sri Lanka: Minor SST/wind variations — noise
function injectZ8(reading, day) {
  // Gentle weather pattern shifts
  reading.sst += Math.sin(day * 0.5) * 0.4;
  reading.wind_speed += Math.sin(day * 0.3) * 0.8;
  return reading;
}

// Map zone ID to injector
const INJECTORS = {
  1: injectZ1,
  2: injectZ2,
  3: injectZ3,
  4: injectZ4,
  5: injectZ5,
  6: injectZ6,
  7: injectZ7,
  8: injectZ8,
};

// ═══════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════════════════════════════

/**
 * Generate 30 days of hourly readings for a single zone.
 * @param {object} zone — zone definition from zones.js
 * @param {number} days — number of days (default 30)
 * @param {Date} startDate — start timestamp
 * @returns {object[]} — array of reading objects
 */
export function generateReadings(zone, days = 30, startDate = null) {
  const start = startDate || new Date('2026-04-08T00:00:00Z');
  const readings = [];
  const inject = INJECTORS[zone.id] || ((r) => r);

  for (let day = 1; day <= days; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(start);
      timestamp.setUTCDate(start.getUTCDate() + day - 1);
      timestamp.setUTCHours(hour, 0, 0, 0);

      let reading = baseReading(zone, hour);
      reading = inject(reading, day, hour);

      // Clamp all values to physical ranges
      readings.push({
        zone_id: zone.id,
        timestamp: timestamp.toISOString(),
        sst: +clamp(reading.sst, 20, 38).toFixed(2),
        chlorophyll: +Math.max(0.01, reading.chlorophyll).toFixed(4),
        dissolved_o2: +clamp(reading.dissolved_o2, 0.5, 12).toFixed(2),
        turbidity: +Math.max(0.1, reading.turbidity).toFixed(2),
        ph: +clamp(reading.ph, 7.0, 8.6).toFixed(2),
        salinity: +clamp(reading.salinity, 20, 42).toFixed(2),
        wind_speed: +Math.max(0, reading.wind_speed).toFixed(2),
        wave_height: +Math.max(0.05, reading.wave_height).toFixed(2),
      });
    }
  }

  return readings;
}

/**
 * Generate ALL readings for ALL 8 zones.
 * @returns {object[]} — 5,760 reading objects
 */
export function generateAllReadings(days = 30, startDate = null) {
  const allReadings = [];
  for (const zone of ZONES) {
    const zoneReadings = generateReadings(zone, days, startDate);
    allReadings.push(...zoneReadings);
  }
  console.log(`[syntheticGenerator] Generated ${allReadings.length} readings for ${ZONES.length} zones (${days} days)`);
  return allReadings;
}

export default { generateReadings, generateAllReadings };
