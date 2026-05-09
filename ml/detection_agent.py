"""
Detection Agent — AquaSentinel ML Pipeline
===========================================
Datasets Used:
  1. Shifting Seas — SST, pH, Bleaching Severity → Isolation Forest anomaly detection
  2. CalCOFI       — T_degC, O2ml_L, Salnty, ChlorA → Rolling Z-Score spike detection

Detection Methods:
  • Isolation Forest (sklearn) — unsupervised multivariate anomaly detection
  • Z-Score threshold — per-metric statistical deviation from rolling baseline
  • Composite scoring — weighted blend → anomaly score 0-100
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import logging
import os

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("DetectionAgent")

SHIFTING_SEAS_PATH = os.path.join(os.path.dirname(__file__), "data", "shifting_seas.csv")
CALCOFI_PATH       = os.path.join(os.path.dirname(__file__), "data", "bottle.csv")


class AnomalyDetector:
    """
    Detection Agent — Hybrid anomaly detection using Isolation Forest on
    satellite climate data and rolling Z-Score on oceanographic sensor data.
    """

    def __init__(self, contamination=0.05, z_threshold=2.5):
        self.contamination = contamination
        self.z_threshold   = z_threshold
        self.scaler        = StandardScaler()
        self.iso_forest    = IsolationForest(
            n_estimators=200, contamination=contamination,
            random_state=42, n_jobs=-1
        )

    # ── 1. Isolation Forest on Shifting Seas ─────────────────────────────────
    def detect_climate_anomalies(self, df):
        logger.info("Running Isolation Forest on Shifting Seas climate features ...")
        feature_cols = [c for c in ["sst_c", "ph_level", "bleaching_severity",
                                    "species_observed"] if c in df.columns]
        if not feature_cols:
            logger.warning("No climate feature columns found."); return df

        X = df[feature_cols].dropna()
        X_scaled = self.scaler.fit_transform(X)

        labels = self.iso_forest.fit_predict(X_scaled)
        scores = self.iso_forest.decision_function(X_scaled)

        s_min, s_max = scores.min(), scores.max()
        norm_scores = 100 * (1 - (scores - s_min) / (s_max - s_min + 1e-9))

        df.loc[X.index, "iso_anomaly_label"] = labels
        df.loc[X.index, "iso_anomaly_score"] = norm_scores

        n = (labels == -1).sum()
        logger.info(f"  → Isolation Forest flagged {n} anomalies out of {len(X)} rows.")
        return df

    # ── 2. Z-Score on CalCOFI oceanographic data ────────────────────────────
    def detect_ocean_anomalies(self, df, window=100):
        logger.info(f"Running rolling Z-Score (window={window}) on CalCOFI data ...")
        sensor_cols = [c for c in ["t_degc", "o2ml_l", "salnty", "chlora"]
                       if c in df.columns]
        if not sensor_cols:
            logger.warning("No sensor columns found."); return df

        anomaly_flags = pd.DataFrame(index=df.index)
        for col in sensor_cols:
            roll_mean = df[col].rolling(window=window, min_periods=1).mean()
            roll_std  = df[col].rolling(window=window, min_periods=1).std().replace(0, 1e-9)
            z = (df[col] - roll_mean) / roll_std
            anomaly_flags[f"{col}_zscore"]  = z.abs()
            anomaly_flags[f"{col}_anomaly"] = (z.abs() > self.z_threshold).astype(int)

        zscore_cols = [c for c in anomaly_flags.columns if c.endswith("_zscore")]
        df["ocean_anomaly_score"] = anomaly_flags[zscore_cols].mean(axis=1).clip(0, 5) * 20

        # Classify anomaly type
        df["anomaly_type"] = "normal"
        type_map = {"t_degc": "thermal_buildup", "o2ml_l": "hypoxia",
                    "salnty": "salinity_shift", "chlora": "algal_bloom"}
        for col in sensor_cols:
            mask = anomaly_flags.get(f"{col}_anomaly", pd.Series(0, index=df.index)) == 1
            df.loc[mask, "anomaly_type"] = type_map.get(col, "unknown")

        n = (df["ocean_anomaly_score"] > 50).sum()
        logger.info(f"  → Z-Score flagged {n} high-score anomalies (score > 50).")
        return df

    # ── 3. Full detection pipeline ───────────────────────────────────────────
    def detect(self, climate_df, ocean_df):
        logger.info("═══ DETECTION PIPELINE START ═══")
        climate_result = self.detect_climate_anomalies(climate_df)
        ocean_result   = self.detect_ocean_anomalies(ocean_df)
        logger.info("═══ DETECTION PIPELINE COMPLETE ═══\n")
        return {"climate_anomalies": climate_result, "ocean_anomalies": ocean_result}


if __name__ == "__main__":
    detector = AnomalyDetector()
    try:
        cdf = pd.read_csv(SHIFTING_SEAS_PATH)
        cdf.columns = (cdf.columns.str.strip().str.lower()
                        .str.replace(r"[°()\s]+", "_", regex=True)
                        .str.replace("__", "_").str.rstrip("_"))

        odf = pd.read_csv(CALCOFI_PATH, nrows=50000, low_memory=False)
        odf.columns = odf.columns.str.strip().str.lower()

        results = detector.detect(cdf, odf)

        print("\n── Climate Anomalies (Shifting Seas) ──")
        a = results["climate_anomalies"]
        print(a[a["iso_anomaly_label"] == -1].head(5))

        print("\n── Ocean Anomalies (CalCOFI) ──")
        b = results["ocean_anomalies"]
        print(b[b["ocean_anomaly_score"] > 50][["t_degc", "o2ml_l", "ocean_anomaly_score", "anomaly_type"]].head(5))

    except FileNotFoundError as e:
        logger.warning(f"Not found: {e}. Run: python ml/download_datasets.py")
