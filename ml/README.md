# AquaSentinel — ML Agent Pipeline

## Datasets Used

### 1. Shifting Seas: Ocean Climate & Marine Life Dataset
- **Source**: https://www.kaggle.com/datasets/atharvasoundankar/shifting-seas-ocean-climate-and-marine-life-dataset
- **Description**: Multi-year global dataset of sea surface temperature, pH levels, coral bleaching severity, and marine species biodiversity (2015–2023). Covers Red Sea, Great Barrier Reef, Caribbean Sea, and more.
- **Columns**: `Date`, `Location`, `Latitude`, `Longitude`, `SST (°C)`, `pH Level`, `Bleaching Severity`, `Species Observed`, `Marine Heatwave`
- **Used by**: Ingestion Agent, Detection Agent (Isolation Forest), Correlation Agent (inter-region SST), Triage Agent (Marine Heatwave as ground truth)

### 2. CalCOFI Oceanographic Bottle Database (1949–Present)
- **Source**: https://www.kaggle.com/datasets/sohier/calcofi
- **Description**: One of the longest and most complete time-series of oceanographic data in the world. Contains 800K+ bottle samples across 74 features including temperature, salinity, dissolved oxygen, chlorophyll, pH, and nutrient concentrations from the California coast.
- **Key Columns**: `Sta_ID`, `Depthm`, `T_degC`, `Salnty`, `O2ml_L`, `ChlorA`, `pH1`, `PO4uM`, `SiO3uM`, `NO3uM`
- **Used by**: Ingestion Agent, Detection Agent (Z-Score), Correlation Agent (inter-station analysis)

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Download datasets (requires Kaggle credentials)
python download_datasets.py

# Run full 7-agent pipeline
python pipeline.py
```

## Agent Files

| File | Agent | Method |
|------|-------|--------|
| `ingestion_agent.py` | 📡 Ingestion | Data loading, normalization, MinMax scaling, gap-filling |
| `detection_agent.py` | 🔍 Detection | Isolation Forest + Rolling Z-Score |
| `correlation_agent.py` | 🔗 Correlation | Pearson cross-region + inter-station analysis |
| `triage_agent.py` | ⚖️ Triage | Random Forest false-positive suppressor |
| `brief_agent.py` | 📋 Brief | Template-based NL situation reports |
| `dispatch_agent.py` | 🚨 Dispatch | Rule-based multi-channel alert routing |
| `learning_agent.py` | 🧠 Learning | Sensitivity feedback loop with reinforcement |
| `pipeline.py` | 🔄 Orchestrator | Full 7-agent sequential pipeline |
