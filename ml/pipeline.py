"""
AquaSentinel ML Pipeline — Full Orchestrator
=============================================
Runs all 7 agents in sequence:
  Ingest → Detect → Correlate → Triage → Brief → Dispatch → Learn
"""
from ingestion_agent import DataIngestor
from detection_agent import AnomalyDetector
from correlation_agent import SpatiotemporalCorrelator
from triage_agent import TriageEngine
from brief_agent import BriefGenerator
from dispatch_agent import AlertDispatcher
from learning_agent import ContinuousLearner
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("Orchestrator")

def run_pipeline():
    logger.info("╔══════════════════════════════════════════╗")
    logger.info("║   AQUASENTINEL ML PIPELINE — FULL RUN    ║")
    logger.info("╚══════════════════════════════════════════╝\n")

    # 1. INGEST
    ingestor = DataIngestor()
    data = ingestor.ingest()

    # 2. DETECT
    detector = AnomalyDetector()
    detections = detector.detect(data["satellite_climate"], data["ocean_sensors"])

    # 3. CORRELATE
    correlator = SpatiotemporalCorrelator()
    correlations = correlator.correlate(data["satellite_climate"], data["ocean_sensors"])

    # 4. TRIAGE
    triage = TriageEngine()
    triage.train_on_historical(data["satellite_climate"])
    triaged = triage.evaluate_alerts(detections["climate_anomalies"].head(50))

    # 5. BRIEF
    brief = BriefGenerator()
    report = brief.generate_situation_report(
        triaged["escalated"],
        correlations.get("region_correlations")
    )

    # 6. DISPATCH
    dispatcher = AlertDispatcher()
    dispatcher.dispatch(triaged["escalated"])

    # 7. LEARN (simulate operator feedback)
    learner = ContinuousLearner()
    if triaged["escalated"]:
        learner.process_feedback("Coral_Bay", was_valid=True, current_sensitivity=1.0)
        learner.process_feedback("Reef_Shelf", was_valid=False, current_sensitivity=1.0)

    logger.info("\n" + report["summary"])
    logger.info("\n✅ FULL PIPELINE COMPLETE.")

if __name__ == "__main__":
    run_pipeline()
