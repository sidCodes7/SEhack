# AquaSentinel — User Flow & Environmental Monitoring Specification

## 1. What Is Being Monitored

AquaSentinel monitors **8 critical environmental phenomena** across marine and coastal ecosystems. Each phenomenon is tracked through specific metrics, linked to climate change drivers, and tied to actionable alert thresholds.

### 1.1 Monitored Phenomena

| # | Phenomenon | Key Metrics | Climate Change Link | Severity When Undetected |
|---|---|---|---|---|
| 1 | **Sea Surface Temperature (SST) Anomalies** | Temperature °C, rate of change °C/day, marine heatwave indices | Ocean warming drives coral bleaching, species migration, intensified cyclones | 🔴 Critical |
| 2 | **Harmful Algal Blooms (HABs)** | Chlorophyll-a concentration (mg/m³), bloom extent (km²), toxin indicators | Nutrient runoff + warming accelerates bloom frequency and toxicity | 🔴 Critical |
| 3 | **Ocean Hypoxia (Dead Zones)** | Dissolved oxygen (mg/L), oxygen saturation %, stratification index | Warming reduces O₂ solubility; eutrophication consumes remaining O₂ | 🔴 Critical |
| 4 | **Coral Bleaching Events** | SST deviation from monthly mean (DHW), bleaching alert level, PAR | Sustained thermal stress expels symbiotic algae, leading to reef death | 🟠 High |
| 5 | **Ocean Acidification** | pH level, pCO₂ (μatm), aragonite saturation state (Ω) | CO₂ absorption lowers pH, weakens coral/shellfish calcium carbonate structures | 🟠 High |
| 6 | **Coastal Erosion & Sea Level** | Sea level anomaly (mm), wave height (m), storm surge indices | Thermal expansion + ice melt accelerates coastal inundation | 🟡 Medium |
| 7 | **Water Quality Degradation** | Turbidity (NTU), salinity (PSU), nutrient loading (N/P ratios) | Agricultural intensification + extreme rainfall increases pollutant runoff | 🟡 Medium |
| 8 | **Marine Weather Extremes** | Wind speed (m/s), wave height (m), atmospheric pressure (hPa) | Warming SSTs fuel more intense and frequent tropical storms | 🟡 Medium |

### 1.2 Why These Phenomena Matter for Climate Change

```
                         ┌─────────────────────┐
                         │   CLIMATE CHANGE     │
                         │   (Root Driver)      │
                         └────────┬────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
      ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
      │ OCEAN WARMING │  │ CO₂ ABSORPTION│  │ EXTREME WEATHER  │
      └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘
             │                 │                  │
     ┌───────┼─────────┐      │           ┌──────┼──────┐
     ▼       ▼         ▼      ▼           ▼      ▼      ▼
  ┌─────┐ ┌──────┐ ┌──────┐ ┌─────┐  ┌──────┐ ┌─────┐ ┌──────┐
  │ SST │ │Coral │ │Hypoxia│ │Ocean│  │Storm │ │Sea  │ │Erosion│
  │Spike│ │Bleach│ │Zones │ │Acid │  │Surge │ │Level│ │      │
  └─────┘ └──────┘ └──────┘ └─────┘  └──────┘ └─────┘ └──────┘
     │       │         │       │         │        │        │
     └───────┴─────────┴───────┴─────────┴────────┴────────┘
                              │
                    ┌─────────▼──────────┐
                    │  ECOSYSTEM COLLAPSE │
                    │  Fisheries loss,    │
                    │  biodiversity drop, │
                    │  coastal community  │
                    │  displacement       │
                    └────────────────────┘
```

---

## 2. Monitoring Locations

### 2.1 Primary Focus: Indian Ocean & Arabian Sea

AquaSentinel's demo targets the **Indian Ocean Rim** — one of the world's most climate-vulnerable marine regions, supporting 2.7 billion people.

| Zone ID | Zone Name | Coordinates (Center) | Region | Primary Risk | Why This Zone |
|---|---|---|---|---|---|
| Z1 | **Lakshadweep Coral Reef** | 10.57°N, 72.63°E | Arabian Sea | Coral bleaching, SST anomaly | India's only coral atoll, mass bleaching events in 2016, 2020, 2024 |
| Z2 | **Gujarat Mangrove Coast** | 21.63°N, 72.18°E | Gulf of Khambhat | HABs, water quality | Major industrial + agricultural runoff zone, Noctiluca blooms |
| Z3 | **Kerala Upwelling Zone** | 9.93°N, 76.26°E | Arabian Sea | Hypoxia, dead zones | Seasonal upwelling creates natural O₂ depletion, worsening with warming |
| Z4 | **Mumbai Offshore** | 19.07°N, 72.87°E | Arabian Sea | Water quality, storm surge | 20M population exposed, industrial discharge, cyclone vulnerability |
| Z5 | **Andaman Reef System** | 11.74°N, 92.66°E | Bay of Bengal | Coral bleaching, acidification | Pristine but threatened reef system, sentinels for wider Indo-Pacific |
| Z6 | **Sundarbans Delta** | 21.94°N, 89.18°E | Bay of Bengal | Sea level, coastal erosion | World's largest mangrove forest, losing 200 km² per decade |
| Z7 | **Goa Coastal Strip** | 15.49°N, 73.82°E | Arabian Sea | Tourism impact, HABs | Indicator zone for human-activity-driven water quality changes |
| Z8 | **Sri Lanka Southern Coast** | 6.03°N, 80.22°E | Indian Ocean | SST anomaly, marine weather | Critical shipping lane, regional climate bellwether |

### 2.2 Zone Map (GeoJSON Polygons)

Each zone is defined as a ~50km radius polygon around the center coordinates. Zones are connected via:
- **Ocean current adjacency** (Arabian Sea counter-clockwise gyre)
- **Atmospheric teleconnection** (monsoon-driven patterns)
- **Ecological corridors** (species migration, larval transport)

---

## 3. Data Sources

### 3.1 Primary Data Sources (Free & Publicly Available)

| # | Source | Provider | Data Type | Resolution | Access Method | Update Frequency |
|---|---|---|---|---|---|---|
| 1 | **GHRSST Level 4** | NASA / NOAA | Sea Surface Temperature | 1km, daily | NOAA CoastWatch ERDDAP | Daily |
| 2 | **Ocean Color (MODIS-Aqua)** | NASA OceanColor | Chlorophyll-a, ocean color | 4km, 8-day composite | NASA Earthdata API | 8-day |
| 3 | **ERA5 Reanalysis** | ECMWF / Copernicus CDS | Wind, waves, pressure, SST | 0.25°, hourly | CDS API (`cdsapi` Python) | Monthly (near-real-time within 5 days) |
| 4 | **Copernicus Marine (CMEMS)** | EU Copernicus | Ocean physics, biogeochemistry | Varies (1/12° to 1/4°) | Copernicus Marine Toolbox | Daily |
| 5 | **NOAA Coral Reef Watch** | NOAA | Bleaching alerts, DHW, hotspots | 5km, daily | ERDDAP / WMS | Daily |
| 6 | **INCOIS ERDDAP** | Govt of India | Indian Ocean SST, chlorophyll, currents | Varies | ERDDAP / OpenDAP | Daily |
| 7 | **Global Ocean Acidification Observing Network (GOA-ON)** | IOC-UNESCO | pH, pCO₂, carbonate chemistry | Point observations | Data portal download | Monthly |
| 8 | **NOAA Tides & Currents** | NOAA | Sea level, tidal data | Station-level, 6-min | CO-OPS API | Real-time |

### 3.2 Data Pipeline

For the **hackathon MVP**, we use a hybrid approach:

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATA PIPELINE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  REAL DATA (for credibility)         SYNTHETIC DATA (for demo)  │
│  ┌──────────────────────┐           ┌────────────────────────┐  │
│  │ • ERA5 historical    │           │ • 30-day time series   │  │
│  │   (pre-downloaded)   │           │   per zone             │  │
│  │ • NOAA Coral Reef    │           │ • Realistic anomalies  │  │
│  │   Watch alerts       │           │   seeded in Zones 1-6  │  │
│  │ • CMEMS monthly      │           │ • Normal noise in      │  │
│  │   climatology        │           │   Zones 7-8            │  │
│  └──────────┬───────────┘           └──────────┬─────────────┘  │
│             │                                  │                │
│             └──────────────┬───────────────────┘                │
│                            ▼                                    │
│                  ┌──────────────────┐                            │
│                  │ INGESTION AGENT  │                            │
│                  │ Normalizes to    │                            │
│                  │ unified schema   │                            │
│                  └──────────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Data Schema (Per Reading)

```json
{
  "zone_id": "Z1",
  "timestamp": "2026-05-08T14:00:00Z",
  "source": "ERA5+SYNTHETIC",
  "metrics": {
    "sst": 29.8,
    "sst_anomaly": 1.2,
    "chlorophyll_a": 0.45,
    "dissolved_o2": 5.8,
    "ph": 8.05,
    "turbidity": 3.2,
    "salinity": 35.1,
    "wind_speed": 4.7,
    "wave_height": 1.3,
    "sea_level_anomaly": 12.5
  },
  "quality_flags": {
    "missing_data": false,
    "sensor_error": false,
    "interpolated": true
  }
}
```

---

## 4. User Flow — End to End

### 4.1 System Startup Flow

```
User opens AquaSentinel Dashboard
         │
         ▼
┌─────────────────────────────────┐
│  1. DASHBOARD LOADS             │
│  • Dark mission control layout  │
│  • 8 zones on map (all green)   │
│  • Agent status: all 💤 Idle    │
│  • Charts: baseline data loaded │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  2. USER CLICKS "START          │
│     MONITORING"                 │
│  • Triggers auto-ingestion loop │
│  • Agents activate sequentially │
│  • Data flow animation begins   │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  3. AUTONOMOUS OPERATION        │
│  • New readings every 10 sec    │
│  • 7 agents process in pipeline │
│  • Alerts auto-generate         │
│  • Briefings auto-appear        │
│  • User observes, can interact  │
└─────────────────────────────────┘
```

### 4.2 Alert Lifecycle

```
  New Reading Arrives
         │
         ▼
  ┌──────────────┐     ┌──────────────┐
  │ 📡 INGESTION │────▶│ 🔍 DETECTION │
  │ Normalize    │     │ Score 0-100  │
  │ Quality check│     │ Classify type│
  └──────────────┘     └──────┬───────┘
                              │
                    Score < 30│         Score ≥ 30
                    ┌─────────┴──────────┐
                    ▼                    ▼
             ┌──────────┐        ┌──────────────┐
             │ DISCARD  │        │ 🔗 CORRELATE │
             │ (Normal) │        │ Cross-zone   │
             └──────────┘        │ check        │
                                 └──────┬───────┘
                                        │
                                        ▼
                                 ┌──────────────┐
                                 │ ⚖️ TRIAGE    │
                                 │ Rank, filter │
                                 │ suppress noise│
                                 └──────┬───────┘
                                        │
                          ┌─────────────┼─────────────┐
                          ▼             ▼             ▼
                   ┌──────────┐  ┌──────────┐  ┌──────────┐
                   │SUPPRESSED│  │ WATCH    │  │ESCALATED │
                   │(logged)  │  │(dashboard│  │(alert +  │
                   │          │  │ only)    │  │ email)   │
                   └──────────┘  └──────────┘  └────┬─────┘
                                                    │
                                              ┌─────┼─────┐
                                              ▼           ▼
                                       ┌──────────┐ ┌──────────┐
                                       │📋 BRIEF  │ │🚨 DISPATCH│
                                       │Generate  │ │Send email │
                                       │briefing  │ │Update feed│
                                       └──────────┘ └──────────┘
                                              │           │
                                              └─────┬─────┘
                                                    ▼
                                             ┌──────────┐
                                             │ USER     │
                                             │ Reviews  │
                                             │ alert    │
                                             └────┬─────┘
                                                  │
                                          ┌───────┼───────┐
                                          ▼               ▼
                                    ┌──────────┐   ┌──────────┐
                                    │✅ VALID  │   │❌ FALSE  │
                                    │          │   │ POSITIVE │
                                    └────┬─────┘   └────┬─────┘
                                         │              │
                                         └──────┬───────┘
                                                ▼
                                         ┌──────────┐
                                         │🧠 LEARN  │
                                         │Adjust    │
                                         │sensitivity│
                                         └──────────┘
```

### 4.3 User Interaction Flows

#### Flow A: Passive Monitoring (Observe Mode)
1. Dashboard auto-updates every 10 seconds
2. Map markers change color as anomalies are detected
3. Alert cards slide into the feed autonomously
4. Agent status strip shows processing activity
5. Charts update with new data points
6. Automation timeline scrolls with new events
7. **User does nothing — system is fully autonomous**

#### Flow B: Active Investigation
1. User notices amber marker on Lakshadweep zone
2. Clicks zone → Zone Detail Panel slides in
3. Sees time-series: SST rising 0.3°C/day for 8 days
4. Sees sparklines for all metrics
5. Sees linked anomalies from Knowledge Graph
6. Reads auto-generated briefing for this zone
7. Clicks "Ask AI" → Opens chat with zone context pre-loaded

#### Flow C: Natural Language Query
1. User opens AI Chat panel
2. Types: "What needs attention right now?"
3. Brief Agent synthesizes all active alerts
4. Returns ranked response:
   - "#1: Lakshadweep — Coral bleaching risk HIGH (87% confidence)"
   - "#2: Kerala — Hypoxia developing (72% confidence)"
   - "#3: Gujarat — Possible HAB, monitoring (54% confidence)"
5. Each item is clickable → navigates to zone detail

#### Flow D: Alert Response
1. Critical alert appears with red pulse animation
2. Alert card shows: zone, type, confidence, reasoning
3. User clicks "View Details" → full brief with:
   - What's happening (anomaly description)
   - Why it matters (impact assessment)
   - What to do (recommended actions)
   - Historical context (similar past events)
4. User clicks ✅ Valid or ❌ False Positive
5. Learning Agent adjusts sensitivity

#### Flow E: Knowledge Graph Exploration
1. User opens Knowledge Graph panel
2. Sees force-directed graph of events, zones, metrics
3. Notices correlation edge: Z3 hypoxia → Z4 fish migration
4. Clicks edge → sees temporal relationship details
5. Understands cascading impact across zones

---

## 5. Alert System

### 5.1 Alert Types

| Alert Type | Trigger | Severity | Icon | Example Message |
|---|---|---|---|---|
| **Thermal Anomaly** | SST > seasonal baseline + (2σ × sensitivity) | 🔴 Critical when sustained >5 days | 🌡️ | "Sustained thermal stress in Lakshadweep: +1.8°C above May baseline for 8 consecutive days. Coral bleaching threshold exceeded." |
| **Harmful Algal Bloom** | Chlorophyll-a > 3× baseline AND increasing | 🔴 Critical when > 5× | 🦠 | "Rapid chlorophyll increase in Gujarat Coast: 4.2 mg/m³ (baseline: 0.9). Pattern consistent with Noctiluca bloom initiation." |
| **Hypoxia Warning** | Dissolved O₂ < 4.0 mg/L AND declining trend | 🟠 Warning | 💀 | "Dissolved oxygen dropping in Kerala Upwelling Zone: 3.2 mg/L (7-day trend: -0.3/day). Potential dead zone formation." |
| **Coral Bleaching Risk** | DHW > 4°C-weeks | 🔴 Critical when DHW > 8 | 🪸 | "Degree Heating Weeks at 6.2 in Andaman Reef. Historical data suggests 60% bleaching probability at current trajectory." |
| **Acidification Alert** | pH < 8.0 AND declining | 🟠 Warning | ⚗️ | "Ocean pH at 7.94 in Zone 5. Aragonite saturation at 2.8 — approaching critical threshold for coral growth." |
| **Sea Level Anomaly** | Sea level > +150mm from mean | 🟡 Watch | 🌊 | "Sea level anomaly of +180mm in Sundarbans. Combined with spring tide forecast, elevated flooding risk for 48h." |
| **Water Quality** | Turbidity > 2× baseline OR salinity deviation > 3σ | 🟡 Watch | 💧 | "Turbidity spike in Mumbai Offshore: 12.4 NTU (baseline: 3.1). Possible sediment discharge from recent rainfall." |
| **Weather Extreme** | Wind > 15 m/s OR waves > 4m | 🟠 Warning | ⛈️ | "Sustained winds 18 m/s in Sri Lanka Southern Coast. Wave heights 4.5m expected next 12h. Small craft advisory." |

### 5.2 Alert Confidence Scoring

Each alert has a composite confidence score (0-100) based on:

| Factor | Weight | Description |
|---|---|---|
| **Signal magnitude** | 30% | How far above threshold is the reading? |
| **Temporal persistence** | 25% | How many consecutive readings show the anomaly? |
| **Multi-metric convergence** | 20% | Do multiple metrics agree (e.g., SST + chlorophyll)? |
| **Historical pattern match** | 15% | Does this match known event signatures? |
| **Cross-zone correlation** | 10% | Are adjacent zones showing related signals? |

---

## 6. Suggested Actions & Potential Impacts

### 6.1 Action Recommendations (Per Alert Type)

| Alert Type | Immediate Actions | Medium-Term Actions | Stakeholders |
|---|---|---|---|
| **Thermal Anomaly** | Deploy monitoring buoys, increase satellite overpass requests | Implement shading structures for critical reef areas, prepare coral rescue teams | Marine biologists, reef managers, fisheries |
| **Harmful Algal Bloom** | Issue swimming/fishing advisories, sample for toxins | Trace nutrient source, engage upstream agriculture/industry | Public health, fisheries regulators, coastal admin |
| **Hypoxia** | Alert fishing fleets to avoid zone, monitor fish kill reports | Investigate nutrient loading sources, assess bottom trawling impact | Fisheries, environmental agencies, NGOs |
| **Coral Bleaching** | Reduce local stressors (anchoring, pollution), document bleaching extent | Plan reef restoration, genetic banking of resistant corals | Conservation NGOs, dive operators, researchers |
| **Acidification** | Increase sampling frequency, cross-reference with CO₂ flux data | Support marine protected area expansion, policy advocacy | Policy makers, researchers, shellfish industry |
| **Sea Level Anomaly** | Activate coastal flood warnings, pre-position emergency resources | Accelerate mangrove restoration, update flood risk maps | Disaster management, coastal planners, communities |
| **Water Quality** | Identify discharge source, notify pollution control board | Enforce discharge standards, install monitoring stations | Pollution control boards, municipal bodies |
| **Weather Extreme** | Issue marine weather warnings, harbor closures | Upgrade coastal infrastructure, improve forecasting models | Coast guard, port authorities, fishing communities |

### 6.2 Impact Assessment Matrix

| Phenomenon | Ecological Impact | Economic Impact | Human Impact | Reversibility |
|---|---|---|---|---|
| SST Anomaly | Species migration, ecosystem disruption | Fisheries displacement ($B) | Food security, livelihood loss | 🟡 Slow (decades) |
| Algal Blooms | Toxin bioaccumulation, fish kills | Tourism loss, fishery closures | Respiratory illness, contaminated seafood | 🟢 Fast (weeks) if source controlled |
| Hypoxia | Mass mortality, biodiversity loss | Fisheries collapse in zone | Protein supply disruption | 🟡 Slow (years) |
| Coral Bleaching | Reef death, habitat loss for 25% of marine species | Tourism revenue loss ($10B/yr globally) | Cultural loss, coastal protection loss | 🔴 Very slow (50+ years) |
| Acidification | Shell dissolution, food web disruption | Shellfish industry decline | Nutritional deficiency in coastal communities | 🔴 Irreversible at current timescales |
| Sea Level Rise | Saltwater intrusion, wetland loss | Property damage, infrastructure costs | Displacement, migration | 🔴 Irreversible |
| Water Quality | Eutrophication, habitat degradation | Treatment costs, tourism impact | Health risks from contaminated water | 🟢 Fast (months) if source controlled |
| Weather Extremes | Structural reef damage, coastal erosion | Shipping disruption, infrastructure damage | Loss of life, displacement | 🟢 Event-based recovery |

---

## 7. Email Alert Outputs

### 7.1 Critical Alert Email Template

```
Subject: 🔴 CRITICAL | AquaSentinel Alert — {Zone Name}: {Alert Type}

──────────────────────────────────────────────
AQUASENTINEL CRITICAL ALERT
Automated Environmental Intelligence Report
──────────────────────────────────────────────

ZONE: {Zone Name} ({Zone ID})
TYPE: {Alert Type}
SEVERITY: CRITICAL
CONFIDENCE: {Score}%
DETECTED: {Timestamp}

──── SITUATION ────
{AI-generated natural language description of the anomaly,
including current readings, deviation from baseline, and
duration of the anomaly.}

──── EVIDENCE ────
• {Metric 1}: {Current Value} (baseline: {Baseline}, deviation: +{Deviation})
• {Metric 2}: {Current Value} (baseline: {Baseline}, deviation: +{Deviation})
• Temporal persistence: {N} consecutive readings
• Cross-zone correlation: {Yes/No — details if yes}

──── RECOMMENDED ACTIONS ────
1. {Action 1}
2. {Action 2}
3. {Action 3}

──── POTENTIAL IMPACT ────
{AI-generated impact assessment based on the alert type,
zone characteristics, and historical precedent.}

──── HISTORICAL CONTEXT ────
{Previous similar events in this zone, if any.}

──────────────────────────────────────────────
This is an automated alert from AquaSentinel.
Dashboard: https://aquasentinel.app/zone/{zone_id}
──────────────────────────────────────────────
```

### 7.2 Daily Digest Email

A daily summary email is also generated (triggered by Dispatch Agent at 06:00 UTC):
- Overview of all 8 zones (status color + one-line summary)
- Top 3 anomalies requiring attention
- 24-hour trend summary
- Noise reduction stats ("X alerts processed, Y suppressed, Z escalated")
- Link to full dashboard
