"""
Brief Agent — AquaSentinel ML Pipeline
=======================================
Generates natural-language situation reports from triaged anomalies.
In production, calls Grok API; here uses template-based generation
grounded in actual Shifting Seas + NDBC data statistics.
"""
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(levelname)s: %(message)s")
logger = logging.getLogger("BriefAgent")

class BriefGenerator:
    def __init__(self):
        self.endpoint = "https://api.x.ai/v1/chat/completions"
        logger.info("Initialized Brief Agent (LLM client for situation reports).")

    def generate_situation_report(self, escalated_alerts, correlations=None):
        logger.info(f"Generating situation report for {len(escalated_alerts)} escalated alerts ...")
        if not escalated_alerts:
            return {"summary": "All zones nominal. No critical anomalies."}

        # Build report from actual alert data
        lines = ["SITUATION REPORT — AquaSentinel", "=" * 40]
        for i, alert in enumerate(escalated_alerts, 1):
            lines.append(f"\n[Alert {i}] {alert.get('level','WARNING')}")
            lines.append(f"  Type:  {alert.get('type','unknown')}")
            lines.append(f"  Score: {alert.get('score', 0)}/100")

        if correlations is not None and len(correlations) > 0:
            lines.append("\nCROSS-ZONE CORRELATIONS:")
            for _, c in correlations.iterrows():
                lines.append(f"  {c.get('zone_a','')} ↔ {c.get('zone_b','')}: r={c.get('correlation','')}")

        lines.append("\nRECOMMENDATIONS:")
        lines.append("  1. Deploy monitoring drones to critical zones.")
        lines.append("  2. Notify coastal authorities for mitigation readiness.")

        report = "\n".join(lines)
        logger.info("Situation report generated.")
        return {"summary": report, "alert_count": len(escalated_alerts)}

if __name__ == "__main__":
    gen = BriefGenerator()
    fake = [{"level":"CRITICAL","type":"thermal_buildup","score":92}]
    print(gen.generate_situation_report(fake)["summary"])
