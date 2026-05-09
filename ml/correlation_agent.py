"""
Correlation Agent — AquaSentinel ML Pipeline
=============================================
Datasets:
  1. Shifting Seas — Cross-location SST/pH Pearson correlation
  2. CalCOFI       — Inter-station depth-temperature correlation
"""
import pandas as pd
import numpy as np
import logging, os

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("CorrelationAgent")

SHIFTING_SEAS_PATH = os.path.join(os.path.dirname(__file__), "data", "shifting_seas.csv")
CALCOFI_PATH       = os.path.join(os.path.dirname(__file__), "data", "bottle.csv")


class SpatiotemporalCorrelator:
    """
    Correlation Agent — Finds cross-zone causal patterns using
    Pearson correlation on Shifting Seas locations and CalCOFI stations.
    """

    def __init__(self, corr_threshold=0.7):
        self.corr_threshold = corr_threshold

    def correlate_regions(self, df):
        """Pivot by Location and correlate SST across marine regions."""
        logger.info("Computing inter-region SST correlation (Shifting Seas) ...")
        if "location" not in df.columns or "sst_c" not in df.columns:
            logger.warning("Required columns not found."); return pd.DataFrame()

        if "date" in df.columns:
            df["date"] = pd.to_datetime(df["date"], errors="coerce")
            df["month_year"] = df["date"].dt.to_period("M").astype(str)
            index_col = "month_year"
        else:
            index_col = df.index.name or "index"

        pivot = df.pivot_table(index=index_col, columns="location", values="sst_c", aggfunc="mean")
        corr = pivot.corr()

        pairs = []
        for i, r1 in enumerate(corr.columns):
            for r2 in corr.columns[i + 1:]:
                v = corr.loc[r1, r2]
                if abs(v) >= self.corr_threshold:
                    pairs.append({
                        "zone_a": r1, "zone_b": r2,
                        "correlation": round(v, 4),
                        "relationship": "co_warming" if v > 0 else "inverse_thermal"
                    })
        logger.info(f"  Found {len(pairs)} correlated region pairs (|r| >= {self.corr_threshold}).")
        return pd.DataFrame(pairs) if pairs else pd.DataFrame()

    def correlate_stations(self, df):
        """Cross-station temperature-oxygen correlation from CalCOFI."""
        logger.info("Computing inter-station T/O2 correlation (CalCOFI) ...")
        if "sta_id" not in df.columns or "t_degc" not in df.columns:
            return pd.DataFrame()

        # Get top 10 stations by data volume
        top = df["sta_id"].value_counts().head(10).index.tolist()
        sub = df[df["sta_id"].isin(top)]
        pivot = sub.pivot_table(index=sub.index, columns="sta_id", values="t_degc", aggfunc="mean")
        corr = pivot.corr()

        pairs = []
        cols = corr.columns.tolist()
        for i, s1 in enumerate(cols):
            for s2 in cols[i + 1:]:
                v = corr.loc[s1, s2]
                if not np.isnan(v) and abs(v) >= self.corr_threshold:
                    pairs.append({"station_a": s1, "station_b": s2,
                                  "correlation": round(v, 4)})
        logger.info(f"  Found {len(pairs)} correlated station pairs.")
        return pd.DataFrame(pairs) if pairs else pd.DataFrame()

    def correlate(self, climate_df, ocean_df):
        logger.info("═══ CORRELATION PIPELINE START ═══")
        result = {
            "region_correlations":  self.correlate_regions(climate_df),
            "station_correlations": self.correlate_stations(ocean_df),
        }
        logger.info("═══ CORRELATION PIPELINE COMPLETE ═══\n")
        return result


if __name__ == "__main__":
    corr = SpatiotemporalCorrelator()
    try:
        df = pd.read_csv(SHIFTING_SEAS_PATH)
        df.columns = (df.columns.str.strip().str.lower()
                       .str.replace(r"[°()\s]+", "_", regex=True)
                       .str.replace("__", "_").str.rstrip("_"))
        odf = pd.read_csv(CALCOFI_PATH, nrows=50000, low_memory=False)
        odf.columns = odf.columns.str.strip().str.lower()

        r = corr.correlate(df, odf)
        print("\n── Region Correlations ──")
        print(r["region_correlations"])
        print("\n── Station Correlations ──")
        print(r["station_correlations"])
    except FileNotFoundError as e:
        logger.warning(f"Not found: {e}")
