// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Next Reading Generator (Simulation Mode)
// Generates the next realistic reading per zone, continuing
// the anomaly trajectories from where the 30-day seed ends.
// Used by Siddh's simulation loop endpoint.
// ═══════════════════════════════════════════════════════════════

import { ZONES } from './zones.js';

// Gaussian random (Box-Muller)
function gauss(mean = 0, std = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * std;
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/**
 * Generate the next reading for a zone, given its current cycle count.
 * cycle=0 means "day 31" (first reading after seed data ends).
 * Each cycle represents 1 hour of simulated time.
 *
 * @param {number} zoneId — 1-8
 * @param {number} cycle — simulation cycle count (0-based)
 * @returns {object} — reading object ready for insertReading()
 */
export function generateNextReading(zoneId, cycle = 0) {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone) throw new Error(`Unknown zone ID: ${zoneId}`);

  const b = zone.baseline_config;
  const day = 31 + Math.floor(cycle / 24);  // Continue from day 31
  const hour = cycle % 24;
  const diurnal = 0.2 * Math.sin(((hour - 5) / 24) * 2 * Math.PI);
  const timestamp = new Date();
  timestamp.setMinutes(0, 0, 0);

  // Base values
  let sst = gauss(b.sst.mean + diurnal, b.sst.std * 0.5);
  let chlorophyll = Math.max(0.01, gauss(b.chlorophyll.mean, b.chlorophyll.std * 0.5));
  let dissolved_o2 = Math.max(0.5, gauss(b.dissolved_o2.mean, b.dissolved_o2.std * 0.5));
  let turbidity = Math.max(0.1, gauss(b.turbidity.mean, b.turbidity.std * 0.5));
  let ph = clamp(gauss(b.ph.mean, b.ph.std * 0.5), 7.5, 8.5);
  let salinity = Math.max(20, gauss(b.salinity.mean, b.salinity.std * 0.5));
  let wind_speed = Math.max(0, gauss(b.wind_speed.mean, b.wind_speed.std * 0.5));
  let wave_height = Math.max(0.1, gauss(b.wave_height.mean, b.wave_height.std * 0.5));

  // Continue anomaly trajectories
  switch (zoneId) {
    case 1: // Lakshadweep: SST keeps rising (crisis worsening)
      sst += 2.4 + (cycle / 24) * 0.15;
      break;
    case 2: // Gujarat: HAB at peak
      chlorophyll *= 4.5 + gauss(0, 0.3);
      dissolved_o2 -= 1.0;
      turbidity += 3.5;
      break;
    case 3: // Kerala: DO continues declining
      dissolved_o2 -= 1.5 + (cycle / 24) * 0.1;
      break;
    case 4: // Mumbai: Turbidity elevated
      turbidity += 1.0 + gauss(0, 0.3);
      break;
    case 5: // Andaman: SST continues rising
      sst += 1.0 + (cycle / 24) * 0.1;
      break;
    case 6: // Sundarbans: pH continues dropping
      ph -= 0.06 + (cycle / 24) * 0.02;
      break;
    case 7: // Goa: Natural chlorophyll noise
      chlorophyll = clamp(0.5 + Math.abs(Math.sin(day * 0.7)) * 0.7 + gauss(0, 0.15), 0.3, 1.4);
      break;
    case 8: // Sri Lanka: Minor weather noise
      sst += Math.sin(day * 0.5) * 0.4;
      wind_speed += Math.sin(day * 0.3) * 0.8;
      break;
  }

  return {
    zone_id: zoneId,
    timestamp: timestamp.toISOString(),
    sst: +clamp(sst, 20, 38).toFixed(2),
    chlorophyll: +Math.max(0.01, chlorophyll).toFixed(4),
    dissolved_o2: +clamp(dissolved_o2, 0.5, 12).toFixed(2),
    turbidity: +Math.max(0.1, turbidity).toFixed(2),
    ph: +clamp(ph, 7.0, 8.6).toFixed(2),
    salinity: +clamp(salinity, 20, 42).toFixed(2),
    wind_speed: +Math.max(0, wind_speed).toFixed(2),
    wave_height: +Math.max(0.05, wave_height).toFixed(2),
  };
}

/**
 * Generate next readings for ALL 8 zones at once.
 */
export function generateAllNextReadings(cycle = 0) {
  return ZONES.map((z) => generateNextReading(z.id, cycle));
}

export default { generateNextReading, generateAllNextReadings };
