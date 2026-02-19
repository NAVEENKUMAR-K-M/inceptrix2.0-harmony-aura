import time
import firebase_admin
from firebase_admin import credentials, db
from config import FIREBASE_CREDENTIALS_PATH, FIREBASE_DB_URL, SIMULATION_FREQUENCY, NUM_WORKERS, MACHINE_TYPES
from models import Machine, Worker, SiteEnvironment
import random
import os
import json

# Predictive Maintenance Engine
try:
    from pdm.inference import PredictiveMaintenanceEngine
    PDM_AVAILABLE = True
except ImportError:
    PDM_AVAILABLE = False
    print("[PdM] Predictive Maintenance module not available.")

# Actionable Alerts Engine
from alerts_engine import ActionableAlertsEngine

def initialize_firebase():
    try:
        if not os.path.exists(FIREBASE_CREDENTIALS_PATH):
            print(f"Warning: Firebase credentials not found at {FIREBASE_CREDENTIALS_PATH}")
            print("Using mock mode (printing to console instead of Firebase)")
            return None

        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred, {
            'databaseURL': FIREBASE_DB_URL
        })
        print("Firebase initialized successfully.")
        return db.reference('site')
    except Exception as e:
        print(f"Failed to initialize Firebase: {e}")
        return None


class EscalationManager:
    def __init__(self, db_ref):
        self.db_ref = db_ref
        self.is_active = False
        self.start_time = 0
        self.needs_reset = False
        self.warning_targets = []   # 3 workers -> stay Yellow
        self.critical_targets = []  # 2 workers -> go Red
        self.notified_workers = set()
        self.target_profiles = {}   # Per-target severity/timing variance

        if self.db_ref:
            self.db_ref.child('events/escalation_trigger').listen(self._on_trigger_change)

    def _on_trigger_change(self, event):
        """Firebase listener callback - DO NOT write back to escalation_trigger here."""
        if event.data is True:
            self._activate()
        elif event.data is False:
            self._deactivate()

    def _activate(self):
        if self.is_active:
            return
        print("\n[RISK ESCALATION] ===== ACTIVATED =====")
        self.is_active = True
        self.start_time = time.time()
        self.notified_workers.clear()
        self.target_profiles.clear()

        # Pick exactly 5 random targets from NUM_WORKERS
        all_ids = [f"W{i+1}" for i in range(NUM_WORKERS)]
        targets = random.sample(all_ids, 5)

        # First 2 -> Critical path, remaining 3 -> Warning path
        self.critical_targets = targets[:2]
        self.warning_targets = targets[2:]

        # Assign individual escalation profiles to each target
        # This ensures no two workers escalate identically
        for wid in targets:
            self.target_profiles[wid] = {
                "severity": random.uniform(0.80, 1.20),   # ±20% intensity variance
                "time_offset": random.uniform(-2.0, 2.0), # ±2s timing variance
                "noise_amp": random.uniform(0.02, 0.06),  # Per-tick stochastic jitter
            }

        print(f"  CRITICAL targets (Red):  {self.critical_targets}")
        print(f"  WARNING targets (Yellow): {self.warning_targets}")
        for wid, prof in self.target_profiles.items():
            print(f"    {wid}: severity={prof['severity']:.2f}, offset={prof['time_offset']:+.1f}s")

    def _deactivate(self):
        if not self.is_active:
            return
        print("\n[RISK ESCALATION] ===== DEACTIVATED =====")
        self.is_active = False
        self.critical_targets = []
        self.warning_targets = []
        self.notified_workers.clear()
        self.needs_reset = True  # Signal main loop

    def get_factor(self, worker_id):
        """
        Returns escalation_factor (0.0 - 1.0) for a given worker.
        Each target has individual severity, timing offset, and noise
        so no two workers escalate identically.
        """
        if not self.is_active:
            return 0.0

        prof = self.target_profiles.get(worker_id)
        if not prof:
            return 0.0  # Not a target

        # Effective elapsed time with per-worker offset
        raw_elapsed = time.time() - self.start_time
        elapsed = max(0, raw_elapsed + prof["time_offset"])
        severity = prof["severity"]
        noise = random.uniform(-prof["noise_amp"], prof["noise_amp"])

        if worker_id in self.critical_targets:
            if elapsed < 10:
                factor = (elapsed / 10.0) * 0.5 * severity
            elif elapsed < 20:
                factor = (0.5 + ((elapsed - 10.0) / 10.0) * 0.5) * severity
            else:
                factor = 1.0 * severity

            factor = max(0, min(1.0, factor + noise))

            # Fire notification when crossing 0.8
            if factor >= 0.8 and worker_id not in self.notified_workers:
                self._send_notification(worker_id)
                self.notified_workers.add(worker_id)

            return factor

        elif worker_id in self.warning_targets:
            if elapsed < 10:
                factor = (elapsed / 10.0) * 0.5 * severity
            else:
                factor = 0.5 * severity

            return max(0, min(0.65, factor + noise))  # Cap at 0.65 to stay Warning

        else:
            return 0.0

    def _send_notification(self, worker_id):
        if not self.db_ref:
            return
        reasons = [
            "Critical Heart Rate Spike (>130 BPM)",
            "Severe Fatigue Accumulation (>85%)",
            "Biometric Stress Threshold Exceeded",
            "Rapid HRV Deterioration"
        ]
        notification = {
            "id": f"alert-{int(time.time() * 1000)}",
            "timestamp": time.time() * 1000,
            "type": "CRITICAL",
            "message": f"Worker {worker_id} Critical: {random.choice(reasons)}",
            "worker_id": worker_id
        }
        print(f"  [ALERT] Notification for {worker_id}: {notification['message']}")
        self.db_ref.child('notifications').push(notification)


# ============================================================
# Deterministic Machine Assignments
# Each worker always maps to the same machine across restarts.
# ============================================================
WORKER_MACHINE_MAP = {
    "W1": "CONST-001",
    "W2": "CONST-002",
    "W3": "CONST-003",
    "W4": "CONST-004",
    "W5": "CONST-005",
    "W6": "CONST-001",
    "W7": "CONST-002",
    "W8": "CONST-003",
    "W9": "CONST-004",
    "W10": "CONST-005",
}


def main():
    site_ref = initialize_firebase()

    # Clear stale state on startup
    if site_ref:
        print("Clearing stale Firebase state...")
        site_ref.child('events/escalation_trigger').set(False)
        site_ref.child('events/escalation_active').set(False)
        site_ref.child('events/escalation_progress').set(0)

    escalation_mgr = EscalationManager(site_ref)

    # Initialize Predictive Maintenance Engine
    pdm_engine = None
    if PDM_AVAILABLE:
        pdm_engine = PredictiveMaintenanceEngine()
        if pdm_engine.load():
            print("[PdM] ✅ Predictive Maintenance engine ready.")
        else:
            pdm_engine = None
            print("[PdM] ⚠️  Running without predictive maintenance.")

    # Initialize Actionable Alerts Engine
    alerts_engine = ActionableAlertsEngine()
    print("[ALERTS] ✅ Actionable alerts engine ready.")

    # Initialize Machines
    machines = {}
    for i in range(5):
        mid = f"CONST-{str(i+1).zfill(3)}"
        mtype = MACHINE_TYPES[i % len(MACHINE_TYPES)]
        machines[mid] = Machine(mid, mtype)

    # Initialize Workers with DETERMINISTIC machine assignment
    workers = {}
    for i in range(NUM_WORKERS):
        wid = f"W{i+1}"
        assigned_mid = WORKER_MACHINE_MAP[wid]
        workers[wid] = Worker(wid, assigned_mid)

    # Initialize Site Environment
    site_env = SiteEnvironment()
    print(f"[ENV] Site environment initialized (ambient={site_env.ambient_temp:.1f}°C, humidity={site_env.humidity:.1f}%)")

    # Listen for weather events from Firebase
    if site_ref:
        def _on_weather_change(event):
            if event.data and isinstance(event.data, str):
                site_env.weather = event.data
                print(f"\n[ENV] Weather changed to: {event.data}")
        site_ref.child('events/weather').listen(_on_weather_change)

    print(f"Initialized {len(workers)} workers, {len(machines)} machines.")
    print("Worker -> Machine assignments:")
    for wid, w in workers.items():
        print(f"  {wid} -> {w.assigned_machine_id}")
    print("\nStarting simulation loop...")
    tick_count = 0

    while True:
        loop_start = time.time()

        # --- Hard Reset Check ---
        if escalation_mgr.needs_reset:
            print("[RESET] Hard resetting all entities to safe baseline.")
            for m in machines.values():
                m.reset()
            for w in workers.values():
                w.reset()
            escalation_mgr.needs_reset = False

        # --- Update Site Environment ---
        env_data = site_env.update()

        # --- Update Machines ---
        machine_data = {}
        machine_stress = {}

        for mid, machine in machines.items():
            # Find max escalation factor among workers assigned to this machine
            max_esc = 0.0
            for wid, w in workers.items():
                if w.assigned_machine_id == mid:
                    f = escalation_mgr.get_factor(wid)
                    if f > max_esc:
                        max_esc = f

            m_state = machine.update(escalation_factor=max_esc, ambient_temp=site_env.ambient_temp)
            machine_data[mid] = m_state
            machine_stress[mid] = machine.stress_index

        # --- Update Workers ---
        worker_data = {}
        for wid, worker in workers.items():
            m_stress = machine_stress.get(worker.assigned_machine_id, 0)
            esc_factor = escalation_mgr.get_factor(wid)
            w_state = worker.update(m_stress, escalation_factor=esc_factor, humidity_factor=site_env.fatigue_multiplier)
            worker_data[wid] = w_state

        # --- PdM: Push sensor data and run inference ---
        if pdm_engine:
            tick_count += 1
            for mid, m_state in machine_data.items():
                pdm_engine.push_reading(
                    mid,
                    m_state['engine_rpm'],
                    m_state['engine_load'],
                    m_state['coolant_temp'],
                    m_state['vibration_mm_s'],
                    m_state.get('oil_pressure', 22.0),
                    env_data.get('ambient_temp_c', 30.0),
                )

            # Run inference every 5 ticks to avoid overhead
            if tick_count % 5 == 0:
                pdm_predictions = {}
                for mid in machines:
                    try:
                        result = pdm_engine.predict(mid)
                        if result:
                            pdm_predictions[mid] = result
                    except Exception as e:
                        print(f"\n[PdM] Prediction error for {mid}: {e}")

                if pdm_predictions and site_ref:
                    try:
                        site_ref.child('maintenance').update(pdm_predictions)
                    except Exception as e:
                        print(f"\n[PdM] Firebase write error: {e}")

        # --- Actionable Alerts: Evaluate every 5 ticks ---
        if tick_count % 5 == 0:
            recs = alerts_engine.evaluate(worker_data, machine_data, env_data)
            if recs and site_ref:
                try:
                    # Push latest recommendations (overwrite for real-time)
                    site_ref.child('recommendations').set({
                        "alerts": recs,
                        "count": len(recs),
                        "timestamp": time.time() * 1000,
                    })
                except Exception as e:
                    print(f"\n[ALERTS] Firebase write error: {e}")

        # --- Push to Firebase ---
        # CRITICAL FIX: Write to SPECIFIC paths to avoid overwriting escalation_trigger
        if site_ref:
            try:
                site_ref.child('machines').update(machine_data)
                site_ref.child('workers').update(worker_data)
                site_ref.child('env').set(env_data)
                site_ref.child('last_updated').set(time.time())
                # Write escalation status to SEPARATE keys (NOT replacing the whole 'events' object)
                site_ref.child('events/escalation_active').set(escalation_mgr.is_active)
                site_ref.child('events/escalation_progress').set(
                    int(time.time() - escalation_mgr.start_time) if escalation_mgr.is_active else 0
                )
                print(".", end="", flush=True)
            except Exception as e:
                print(f"\nError pushing to Firebase: {e}")
        else:
            # Mock mode
            print(f"\n[MOCK] tick={int(time.time())}")
            if escalation_mgr.is_active:
                elapsed = int(time.time() - escalation_mgr.start_time)
                print(f"  Escalation active for {elapsed}s")
            for wid in sorted(worker_data.keys(), key=lambda x: int(x[1:])):
                wd = worker_data[wid]
                print(f"  {wid}: HR={wd['heart_rate_bpm']} Fat={wd['fatigue_percent']}% CIS={wd['cis_score']} [{wd['cis_risk_level']}]")

        # --- Sleep ---
        elapsed = time.time() - loop_start
        sleep_time = max(0, (1.0 / SIMULATION_FREQUENCY) - elapsed)
        time.sleep(sleep_time)


if __name__ == "__main__":
    main()
