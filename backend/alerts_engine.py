"""
Actionable Alerts Engine
=========================
Rule-based recommendation system that generates supervisor-actionable alerts
based on worker biometrics, machine telemetry, and environmental conditions.

Each rule evaluates the current state and produces a structured recommendation
with severity, action text, and the triggering metric.
"""

import time


class ActionableAlertsEngine:
    """Generates actionable recommendations for supervisors."""

    # Cooldown per worker/machine to avoid alert spam (seconds)
    COOLDOWN_SECONDS = 30

    def __init__(self):
        self._last_alert_time = {}  # key -> timestamp

    def _can_alert(self, key):
        """Check if enough time has passed since the last alert for this key."""
        now = time.time()
        last = self._last_alert_time.get(key, 0)
        if now - last < self.COOLDOWN_SECONDS:
            return False
        self._last_alert_time[key] = now
        return True

    def evaluate(self, worker_data, machine_data, env_data):
        """
        Evaluate all rules and return a list of actionable recommendations.

        Args:
            worker_data: dict of {worker_id: worker_dict}
            machine_data: dict of {machine_id: machine_dict}
            env_data: dict with keys ambient_temp_c, humidity_pct, weather, wind_speed_kmh

        Returns:
            list of recommendation dicts, each with:
                - id: unique alert ID
                - timestamp: epoch ms
                - severity: "WARNING" | "CRITICAL" | "INFO"
                - target_type: "worker" | "machine" | "site"
                - target_id: worker/machine ID or "site"
                - metric: triggering metric name
                - value: current value of the metric
                - threshold: threshold that was exceeded
                - action: recommended supervisor action
                - message: human-readable summary
        """
        recommendations = []

        # ── Worker Rules ──
        for wid, w in worker_data.items():
            # Rule 1: Critical CIS Score → Assign Break
            if w.get("cis_score", 0) >= 0.80 and self._can_alert(f"{wid}_cis_crit"):
                recommendations.append(self._make_rec(
                    severity="CRITICAL",
                    target_type="worker", target_id=wid,
                    metric="cis_score", value=w["cis_score"], threshold=0.80,
                    action="ASSIGN 15-MIN MANDATORY BREAK",
                    message=f"Worker {wid}: CIS Score {w['cis_score']:.2f} – immediate rest required.",
                ))

            # Rule 2: Warning CIS Score → Monitor Closely
            elif w.get("cis_score", 0) >= 0.55 and self._can_alert(f"{wid}_cis_warn"):
                recommendations.append(self._make_rec(
                    severity="WARNING",
                    target_type="worker", target_id=wid,
                    metric="cis_score", value=w["cis_score"], threshold=0.55,
                    action="SCHEDULE BREAK WITHIN 30 MINUTES",
                    message=f"Worker {wid}: CIS Score rising ({w['cis_score']:.2f}) – schedule rest.",
                ))

            # Rule 3: High Heart Rate
            if w.get("heart_rate_bpm", 0) >= 130 and self._can_alert(f"{wid}_hr"):
                recommendations.append(self._make_rec(
                    severity="CRITICAL",
                    target_type="worker", target_id=wid,
                    metric="heart_rate_bpm", value=w["heart_rate_bpm"], threshold=130,
                    action="REMOVE FROM ACTIVE DUTY IMMEDIATELY",
                    message=f"Worker {wid}: Heart rate {w['heart_rate_bpm']} BPM – cardiac stress risk.",
                ))

            # Rule 4: High Fatigue
            if w.get("fatigue_percent", 0) >= 70 and self._can_alert(f"{wid}_fatigue"):
                recommendations.append(self._make_rec(
                    severity="WARNING",
                    target_type="worker", target_id=wid,
                    metric="fatigue_percent", value=w["fatigue_percent"], threshold=70,
                    action="ROTATE TO LIGHTER DUTIES",
                    message=f"Worker {wid}: Fatigue at {w['fatigue_percent']}% – reassign to lighter tasks.",
                ))

        # ── Machine Rules ──
        for mid, m in machine_data.items():
            # Rule 5: High Vibration → Cap Load
            if m.get("vibration_mm_s", 0) >= 8.0 and self._can_alert(f"{mid}_vib"):
                recommendations.append(self._make_rec(
                    severity="WARNING",
                    target_type="machine", target_id=mid,
                    metric="vibration_mm_s", value=m["vibration_mm_s"], threshold=8.0,
                    action="CAP ENGINE LOAD TO 50%",
                    message=f"Machine {mid}: Vibration {m['vibration_mm_s']} mm/s – reduce load to prevent bearing damage.",
                ))

            # Rule 6: Overheating → Idle Cooldown
            if m.get("coolant_temp", 0) >= 95.0 and self._can_alert(f"{mid}_temp"):
                recommendations.append(self._make_rec(
                    severity="CRITICAL",
                    target_type="machine", target_id=mid,
                    metric="coolant_temp", value=m["coolant_temp"], threshold=95.0,
                    action="SWITCH TO IDLE – COOLDOWN REQUIRED",
                    message=f"Machine {mid}: Coolant temp {m['coolant_temp']}°C – overheat risk.",
                ))

            # Rule 7: High Stress Index
            if m.get("stress_index", 0) >= 70.0 and self._can_alert(f"{mid}_stress"):
                recommendations.append(self._make_rec(
                    severity="WARNING",
                    target_type="machine", target_id=mid,
                    metric="stress_index", value=m["stress_index"], threshold=70.0,
                    action="REDUCE OPERATING INTENSITY",
                    message=f"Machine {mid}: Stress index {m['stress_index']}% – sustained damage risk.",
                ))

        # ── Environmental Rules ──
        ambient = env_data.get("ambient_temp_c", 30)
        humidity = env_data.get("humidity_pct", 50)

        # Rule 8: Heatwave → Increase Hydration Breaks
        if ambient >= 40.0 and self._can_alert("site_heat"):
            recommendations.append(self._make_rec(
                severity="WARNING",
                target_type="site", target_id="site",
                metric="ambient_temp_c", value=ambient, threshold=40.0,
                action="INCREASE HYDRATION BREAKS TO EVERY 30 MIN",
                message=f"Site ambient temperature {ambient}°C – heat stress protocol required.",
            ))

        # Rule 9: Extreme Heat → Suspend Outdoor Work
        if ambient >= 46.0 and self._can_alert("site_extreme_heat"):
            recommendations.append(self._make_rec(
                severity="CRITICAL",
                target_type="site", target_id="site",
                metric="ambient_temp_c", value=ambient, threshold=46.0,
                action="SUSPEND ALL OUTDOOR OPERATIONS",
                message=f"EXTREME HEAT: {ambient}°C – cease outdoor work immediately.",
            ))

        # Rule 10: High Humidity → Fatigue Warning
        if humidity >= 80.0 and self._can_alert("site_humidity"):
            recommendations.append(self._make_rec(
                severity="INFO",
                target_type="site", target_id="site",
                metric="humidity_pct", value=humidity, threshold=80.0,
                action="MONITOR WORKERS FOR HEAT EXHAUSTION",
                message=f"Site humidity {humidity}% – increased fatigue risk for all workers.",
            ))

        return recommendations

    def _make_rec(self, severity, target_type, target_id, metric, value, threshold, action, message):
        return {
            "id": f"rec-{int(time.time() * 1000)}",
            "timestamp": time.time() * 1000,
            "severity": severity,
            "target_type": target_type,
            "target_id": target_id,
            "metric": metric,
            "value": round(value, 2) if isinstance(value, float) else value,
            "threshold": threshold,
            "action": action,
            "message": message,
        }
