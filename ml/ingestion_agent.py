"""
Ingestion Agent — AquaSentinel ML Pipeline
==========================================
Datasets Used:
  1. Shifting Seas: Ocean Climate & Marine Life Dataset
     https://www.kaggle.com/datasets/atharvasoundankar/shifting-seas-ocean-climate-and-marine-life-dataset
     Columns: Date, Location, Latitude, Longitude, SST (°C), pH Level,
              Bleaching Severity, Species Observed, Marine Heatwave

  2. CalCOFI Oceanographic Bottle Database (1949–Present)
     https://www.kaggle.com/datasets/sohier/calcofi
     Columns: Sta_ID, Depthm, T_degC, Salnty, O2ml_L, ChlorA, pH1, PO4uM, etc.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import logging
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("IngestionAgent")

# ── Paths to Kaggle CSVs (place downloaded files in ml/data/) ────────────────
SHIFTING_SEAS_PATH = os.path.join(os.path.dirname(__file__), "data", "shifting_seas.csv")
CALCOFI_PATH       = os.path.join(os.path.dirname(__file__), "data", "bottle.csv")


class DataIngestor:
    """
    Ingestion Agent — Receives raw multi-source sensor data, normalizes into
    zone-level signals, detects missing/corrupt readings, and fills gaps.
    Merges satellite-derived climate data (Shifting Seas) with in-situ
    oceanographic observations (CalCOFI) into unified frames per zone.
    """

    def __init__(self, shifting_seas_path=SHIFTING_SEAS_PATH, calcofi_path=CALCOFI_PATH):
        self.shifting_seas_path = shifting_seas_path
        self.calcofi_path = calcofi_path
        self.scaler = MinMaxScaler()

    # ── 1. Load Shifting Seas (Satellite / Climate) ──────────────────────────
    def load_shifting_seas(self):
        """
        Load the Shifting Seas dataset.
        Columns: Date, Location, Latitude, Longitude, SST (°C), pH Level,
                 Bleaching Severity, Species Observed, Marine Heatwave
        """
        logger.info(f"Loading Shifting Seas satellite climate data from {self.shifting_seas_path} ...")
        df = pd.read_csv(self.shifting_seas_path)

        # Standardize column names
        df.columns = (df.columns
                       .str.strip()
                       .str.lower()
                       .str.replace(r"[°()\s]+", "_", regex=True)
                       .str.replace("__", "_")
                       .str.rstrip("_"))

        # Parse date
        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")

        logger.info(f"  → Loaded {len(df)} rows, columns: {list(df.columns)}")
        return df

    # ── 2. Load CalCOFI Bottle Data (In-Situ Oceanographic) ──────────────────
    def load_calcofi(self, nrows=50000):
        """
        Load the CalCOFI bottle database (capped to nrows for speed).
        Key columns: T_degC (temp), Salnty (salinity), O2ml_L (dissolved O2),
                     ChlorA (chlorophyll-a), pH1, Depthm, Sta_ID
        """
        logger.info(f"Loading CalCOFI oceanographic data from {self.calcofi_path} (nrows={nrows}) ...")

        # Select only the columns we need to keep memory reasonable
        use_cols = ["Sta_ID", "Depthm", "T_degC", "Salnty", "O2ml_L",
                    "ChlorA", "Phaeop", "PO4uM", "SiO3uM", "NO3uM", "pH1"]
        df = pd.read_csv(self.calcofi_path, usecols=use_cols, nrows=nrows, low_memory=False)

        # Standardize
        df.columns = df.columns.str.strip().str.lower()

        logger.info(f"  → Loaded {len(df)} rows from {df['sta_id'].nunique()} unique stations.")
        return df

    # ── 3. Normalize & Clean ─────────────────────────────────────────────────
    def normalize_and_clean(self, df, numeric_cols=None):
        """
        • Detect missing/corrupt readings
        • Impute gaps using forward-fill + interpolation
        • Min-Max scale numeric columns to [0, 1]
        • Add quality flags per row
        """
        logger.info("Running data quality checks and normalization ...")

        if numeric_cols is None:
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

        # ── Encode categorical columns that were requested ───────────────────
        for col in list(numeric_cols):
            if df[col].dtype == object:
                logger.info(f"  → Encoding categorical column '{col}' to numeric ...")
                df[col] = pd.Categorical(df[col]).codes.astype(float)

        # ── Filter to only columns that are actually numeric ─────────────────
        numeric_cols = [c for c in numeric_cols if pd.api.types.is_numeric_dtype(df[c])]

        # ── Quality flags ────────────────────────────────────────────────────
        df["quality_flag"] = "OK"
        missing_mask = df[numeric_cols].isnull().any(axis=1)
        df.loc[missing_mask, "quality_flag"] = "IMPUTED"

        missing_pct = missing_mask.sum() / len(df) * 100
        logger.info(f"  → Missing data in {missing_pct:.1f}% of rows — flagging & imputing.")

        # ── Gap filling: forward-fill then linear interpolation ──────────────
        df[numeric_cols] = df[numeric_cols].infer_objects(copy=False).ffill().interpolate(method="linear")

        # ── Min-Max normalization ────────────────────────────────────────────
        df[numeric_cols] = self.scaler.fit_transform(df[numeric_cols])

        logger.info(f"  → Normalized {len(numeric_cols)} numeric columns to [0, 1].")
        return df

    # ── 4. Full ingestion pipeline ───────────────────────────────────────────
    def ingest(self):
        logger.info("═══ INGESTION PIPELINE START ═══")

        shifting_seas_df = self.load_shifting_seas()
        calcofi_df       = self.load_calcofi()

        # Normalize Shifting Seas
        climate_cols = [c for c in ["sst_c", "ph_level", "bleaching_severity",
                                    "species_observed", "latitude", "longitude"]
                        if c in shifting_seas_df.columns]
        shifting_seas_clean = self.normalize_and_clean(shifting_seas_df.copy(), climate_cols)

        # Normalize CalCOFI
        ocean_cols = [c for c in ["t_degc", "salnty", "o2ml_l", "chlora", "ph1",
                                  "po4um", "sio3um", "no3um", "depthm"]
                      if c in calcofi_df.columns]
        calcofi_clean = self.normalize_and_clean(calcofi_df.copy(), ocean_cols)

        logger.info("═══ INGESTION PIPELINE COMPLETE ═══\n")
        return {
            "satellite_climate": shifting_seas_clean,
            "ocean_sensors":     calcofi_clean,
        }


# ── Standalone test ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    ingestor = DataIngestor()
    try:
        data = ingestor.ingest()
        print("\n── Satellite Climate Data (Shifting Seas) ──")
        print(data["satellite_climate"].head(5))
        print(f"Shape: {data['satellite_climate'].shape}")

        print("\n── Oceanographic Data (CalCOFI) ──")
        print(data["ocean_sensors"].head(5))
        print(f"Shape: {data['ocean_sensors'].shape}")

    except FileNotFoundError as e:
        logger.warning(f"Dataset file not found: {e}")
        logger.info("Run: python ml/download_datasets.py")
