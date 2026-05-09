// ═══════════════════════════════════════════════════════════════
// AquaSentinel — Zone Definitions
// 8 monitored coastal/marine zones with baselines
// ═══════════════════════════════════════════════════════════════

export const ZONES = [
  {
    id: 1,
    name: 'Lakshadweep Coral Reef',
    region: 'Arabian Sea',
    lat: 10.57,
    lng: 72.63,
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [72.13, 10.17], [73.13, 10.17], [73.13, 10.97],
        [72.13, 10.97], [72.13, 10.17],
      ]],
    },
    baseline_config: {
      sst: { mean: 28.5, std: 0.8 },
      chlorophyll: { mean: 0.3, std: 0.1 },
      dissolved_o2: { mean: 6.5, std: 0.5 },
      turbidity: { mean: 2.0, std: 0.8 },
      ph: { mean: 8.1, std: 0.05 },
      salinity: { mean: 35.0, std: 0.5 },
      wind_speed: { mean: 4.5, std: 1.5 },
      wave_height: { mean: 1.2, std: 0.4 },
    },
  },
  {
    id: 2,
    name: 'Gujarat Mangrove Coast',
    region: 'Gulf of Khambhat',
    lat: 21.63,
    lng: 72.18,
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [71.68, 21.23], [72.68, 21.23], [72.68, 22.03],
        [71.68, 22.03], [71.68, 21.23],
      ]],
    },
    baseline_config: {
      sst: { mean: 27.5, std: 1.0 },
      chlorophyll: { mean: 0.9, std: 0.3 },
      dissolved_o2: { mean: 6.2, std: 0.6 },
      turbidity: { mean: 5.0, std: 2.0 },
      ph: { mean: 8.05, std: 0.06 },
      salinity: { mean: 33.5, std: 1.0 },
      wind_speed: { mean: 5.0, std: 2.0 },
      wave_height: { mean: 0.8, std: 0.3 },
    },
  },
  {
    id: 3,
    name: 'Kerala Upwelling Zone',
    region: 'Arabian Sea',
    lat: 9.93,
    lng: 76.26,
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [75.76, 9.53], [76.76, 9.53], [76.76, 10.33],
        [75.76, 10.33], [75.76, 9.53],
      ]],
    },
    baseline_config: {
      sst: { mean: 28.0, std: 0.7 },
      chlorophyll: { mean: 0.5, std: 0.2 },
      dissolved_o2: { mean: 6.5, std: 0.5 },
      turbidity: { mean: 3.0, std: 1.0 },
      ph: { mean: 8.08, std: 0.05 },
      salinity: { mean: 34.5, std: 0.6 },
      wind_speed: { mean: 3.5, std: 1.2 },
      wave_height: { mean: 1.0, std: 0.3 },
    },
  },
  {
    id: 4,
    name: 'Mumbai Offshore',
    region: 'Arabian Sea',
    lat: 19.07,
    lng: 72.87,
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [72.37, 18.67], [73.37, 18.67], [73.37, 19.47],
        [72.37, 19.47], [72.37, 18.67],
      ]],
    },
    baseline_config: {
      sst: { mean: 28.0, std: 0.9 },
      chlorophyll: { mean: 0.6, std: 0.2 },
      dissolved_o2: { mean: 6.0, std: 0.5 },
      turbidity: { mean: 4.0, std: 1.5 },
      ph: { mean: 8.05, std: 0.06 },
      salinity: { mean: 34.0, std: 0.8 },
      wind_speed: { mean: 4.0, std: 1.5 },
      wave_height: { mean: 1.0, std: 0.4 },
    },
  },
  {
    id: 5,
    name: 'Andaman Reef System',
    region: 'Bay of Bengal',
    lat: 11.74,
    lng: 92.66,
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [92.16, 11.34], [93.16, 11.34], [93.16, 12.14],
        [92.16, 12.14], [92.16, 11.34],
      ]],
    },
    baseline_config: {
      sst: { mean: 28.0, std: 0.6 },
      chlorophyll: { mean: 0.25, std: 0.08 },
      dissolved_o2: { mean: 6.8, std: 0.4 },
      turbidity: { mean: 1.5, std: 0.5 },
      ph: { mean: 8.12, std: 0.04 },
      salinity: { mean: 33.0, std: 0.5 },
      wind_speed: { mean: 3.0, std: 1.0 },
      wave_height: { mean: 0.9, std: 0.3 },
    },
  },
  {
    id: 6,
    name: 'Sundarbans Delta',
    region: 'Bay of Bengal',
    lat: 21.94,
    lng: 89.18,
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [88.68, 21.54], [89.68, 21.54], [89.68, 22.34],
        [88.68, 22.34], [88.68, 21.54],
      ]],
    },
    baseline_config: {
      sst: { mean: 27.0, std: 1.2 },
      chlorophyll: { mean: 1.2, std: 0.4 },
      dissolved_o2: { mean: 5.8, std: 0.6 },
      turbidity: { mean: 8.0, std: 3.0 },
      ph: { mean: 8.1, std: 0.06 },
      salinity: { mean: 28.0, std: 2.0 },
      wind_speed: { mean: 4.0, std: 1.5 },
      wave_height: { mean: 0.6, std: 0.2 },
    },
  },
  {
    id: 7,
    name: 'Goa Coastal Strip',
    region: 'Arabian Sea',
    lat: 15.49,
    lng: 73.82,
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [73.32, 15.09], [74.32, 15.09], [74.32, 15.89],
        [73.32, 15.89], [73.32, 15.09],
      ]],
    },
    baseline_config: {
      sst: { mean: 28.2, std: 0.8 },
      chlorophyll: { mean: 0.7, std: 0.3 },
      dissolved_o2: { mean: 6.3, std: 0.5 },
      turbidity: { mean: 3.5, std: 1.2 },
      ph: { mean: 8.07, std: 0.05 },
      salinity: { mean: 34.5, std: 0.7 },
      wind_speed: { mean: 3.8, std: 1.3 },
      wave_height: { mean: 1.1, std: 0.4 },
    },
  },
  {
    id: 8,
    name: 'Sri Lanka Southern Coast',
    region: 'Indian Ocean',
    lat: 6.03,
    lng: 80.22,
    polygon: {
      type: 'Polygon',
      coordinates: [[
        [79.72, 5.63], [80.72, 5.63], [80.72, 6.43],
        [79.72, 6.43], [79.72, 5.63],
      ]],
    },
    baseline_config: {
      sst: { mean: 28.3, std: 0.7 },
      chlorophyll: { mean: 0.35, std: 0.12 },
      dissolved_o2: { mean: 6.6, std: 0.4 },
      turbidity: { mean: 2.5, std: 1.0 },
      ph: { mean: 8.1, std: 0.05 },
      salinity: { mean: 34.0, std: 0.6 },
      wind_speed: { mean: 4.2, std: 1.4 },
      wave_height: { mean: 1.3, std: 0.5 },
    },
  },
];

export default ZONES;
