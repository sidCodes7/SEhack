"""
Learning Agent — AquaSentinel ML Pipeline
==========================================
Adjusts per-zone detection sensitivity based on operator feedback.
Uses Shifting Seas region data to simulate zone baselines that adapt.
"""
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("LearningAgent")

class ContinuousLearner:
    def __init__(self):
        self.sensitivities = {}  # zone_id -> sensitivity float
        logger.info("Learning Agent initialized.")

    def process_feedback(self, zone_id, was_valid, current_sensitivity=1.0):
        logger.info(f"Feedback for {zone_id}: valid={was_valid}, current={current_sensitivity:.2f}")
        lr = 0.05
        if was_valid:
            new = min(2.0, current_sensitivity * (1 + lr))
        else:
            new = max(0.3, current_sensitivity * (1 - lr * 2))
        self.sensitivities[zone_id] = new
        logger.info(f"  Sensitivity: {current_sensitivity:.2f} → {new:.2f}")
        if new < 0.5:
            logger.warning(f"  {zone_id} sensitivity < 0.5 — triggering model retrain.")
        return new

if __name__ == "__main__":
    l = ContinuousLearner()
    l.process_feedback("Coral_Bay", was_valid=False, current_sensitivity=1.0)
    l.process_feedback("Deep_Trench", was_valid=True, current_sensitivity=0.8)
