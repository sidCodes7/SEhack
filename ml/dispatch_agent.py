"""
Dispatch Agent — AquaSentinel ML Pipeline
==========================================
Rule-based alert routing: routes escalated alerts to dashboard, email,
SMS, or webhook channels based on severity level.
"""
import logging, json

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("DispatchAgent")

class AlertDispatcher:
    def __init__(self):
        self.rules = {
            "CRITICAL": ["email", "dashboard", "sms", "webhook"],
            "WARNING":  ["email", "dashboard"],
            "WATCH":    ["dashboard"]
        }

    def dispatch(self, escalated_alerts):
        logger.info(f"Dispatching {len(escalated_alerts)} alerts ...")
        results = []
        for alert in escalated_alerts:
            level = alert.get("level", "WATCH")
            channels = self.rules.get(level, ["dashboard"])
            for ch in channels:
                logger.info(f"  → [{level}] Routing to {ch.upper()}: score={alert.get('score',0)}")
            results.append({"level": level, "channels": channels, "score": alert.get("score",0)})
        logger.info(f"Dispatch complete. {len(results)} alerts routed.")
        return results

if __name__ == "__main__":
    d = AlertDispatcher()
    d.dispatch([{"level":"CRITICAL","score":92},{"level":"WARNING","score":67}])
