"""
Production-Grade Simulation Models
===================================
Each Worker and Machine has unique physiological/physical traits (a "DNA profile")
that ensure no two entities ever produce identical telemetry patterns.

Design principles:
  - Per-entity random seeds for reproducible but distinct behavior
  - Ornstein-Uhlenbeck (mean-reverting) noise for realistic sensor jitter
  - Individual baseline ranges, recovery rates, and escalation sensitivities
  - Machine physics derived from real equipment type characteristics
"""

import random
import time
import math


# ─────────────────────────────────────────────────
# Machine-Type Physical Profiles
# ─────────────────────────────────────────────────
MACHINE_PROFILES = {
    "Excavator": {
        "idle_rpm": 750,    "work_rpm": 1800,   "peak_rpm": 2600,
        "idle_load": 8,     "work_load": 55,    "peak_load": 95,
        "idle_temp": 30,    "work_temp": 52,    "peak_temp": 95,
        "thermal_inertia": 0.03,  # Slow to heat, slow to cool (heavy diesel)
        "load_responsiveness": 0.06,
        "vibration_base": 2.5,
    },
    "Bulldozer": {
        "idle_rpm": 700,    "work_rpm": 1600,   "peak_rpm": 2200,
        "idle_load": 12,    "work_load": 60,    "peak_load": 98,
        "idle_temp": 32,    "work_temp": 58,    "peak_temp": 105,
        "thermal_inertia": 0.025,  # Very heavy; extremely slow thermal response
        "load_responsiveness": 0.05,
        "vibration_base": 3.8,
    },
    "Crane": {
        "idle_rpm": 650,    "work_rpm": 1400,   "peak_rpm": 2000,
        "idle_load": 5,     "work_load": 45,    "peak_load": 88,
        "idle_temp": 26,    "work_temp": 42,    "peak_temp": 78,
        "thermal_inertia": 0.04,  # Lighter hydraulic system, faster thermal
        "load_responsiveness": 0.08,
        "vibration_base": 1.2,
    },
    "Loader": {
        "idle_rpm": 780,    "work_rpm": 1900,   "peak_rpm": 2500,
        "idle_load": 10,    "work_load": 50,    "peak_load": 92,
        "idle_temp": 29,    "work_temp": 48,    "peak_temp": 88,
        "thermal_inertia": 0.035,
        "load_responsiveness": 0.07,
        "vibration_base": 2.8,
    },
    "Truck": {
        "idle_rpm": 680,    "work_rpm": 1700,   "peak_rpm": 2400,
        "idle_load": 6,     "work_load": 42,    "peak_load": 85,
        "idle_temp": 27,    "work_temp": 44,    "peak_temp": 82,
        "thermal_inertia": 0.045,  # Road vehicle, good airflow, fastest cooling
        "load_responsiveness": 0.09,
        "vibration_base": 2.0,
    },
}


class Machine:
    def __init__(self, machine_id, machine_type):
        self.machine_id = machine_id
        self.machine_type = machine_type

        # Get type-specific profile (with fallback)
        profile = MACHINE_PROFILES.get(machine_type, MACHINE_PROFILES["Truck"])
        self.profile = profile

        # Per-instance randomization ("manufacturing variance")
        # Each machine of the same type still behaves slightly differently
        self._rng = random.Random(hash(machine_id))
        self._variance = self._rng.uniform(0.92, 1.08)  # ±8% unit-to-unit variance

        # State
        self.engine_rpm = profile["idle_rpm"] * self._variance
        self.engine_load = profile["idle_load"] * self._variance
        self.coolant_temp = profile["idle_temp"] + self._rng.uniform(-2, 2)
        self.oil_pressure = 22.0 + self._rng.uniform(-3, 3)
        self.hydraulic_pressure = 300
        self.fuel_level = 100.0
        self.degradation = self._rng.uniform(0, 0.005)  # Pre-existing wear
        self.stress_index = 0.0
        self.vibration = profile["vibration_base"]
        self.fault_codes = []
        self.operating_mode = "IDLE"
        self.timestamp = time.time()

        # Noise state (Ornstein-Uhlenbeck process)
        self._rpm_noise = 0.0
        self._load_noise = 0.0
        self._temp_noise = 0.0

    def _ou_step(self, current, mean_reversion=0.3, volatility=1.0):
        """Ornstein-Uhlenbeck step: mean-reverting random walk for sensor jitter."""
        return current * (1 - mean_reversion) + self._rng.gauss(0, volatility)

    def update(self, escalation_factor=0.0):
        self.timestamp = time.time()
        p = self.profile
        v = self._variance

        # --- Operating Mode ---
        if escalation_factor > 0.5:
            self.operating_mode = "HIGH_LOAD"
        elif escalation_factor > 0.1:
            self.operating_mode = "WORKING"
        else:
            # Realistic mode cycling: mostly IDLE with brief WORKING bursts
            if self._rng.random() < 0.03:
                self.operating_mode = "WORKING" if self.operating_mode == "IDLE" else "IDLE"

        # --- Target Values by Mode ---
        if self.operating_mode == "IDLE":
            target_rpm = p["idle_rpm"] * v
            target_load = p["idle_load"] * v
            target_temp = p["idle_temp"]
        elif self.operating_mode == "WORKING":
            target_rpm = p["work_rpm"] * v
            target_load = p["work_load"] * v
            target_temp = p["work_temp"]
        else:  # HIGH_LOAD
            target_rpm = p["peak_rpm"] * v
            target_load = p["peak_load"] * v
            target_temp = p["peak_temp"]

        # --- Escalation Boost ---
        target_load += 20 * escalation_factor
        target_load = min(target_load, 100)
        target_temp += 35 * escalation_factor

        # --- Smooth Transitions with Type-Specific Inertia ---
        resp = p["load_responsiveness"]
        therm = p["thermal_inertia"]

        self.engine_rpm += (target_rpm - self.engine_rpm) * resp
        self.engine_load += (target_load - self.engine_load) * resp
        self.coolant_temp += (target_temp - self.coolant_temp) * therm

        # --- Add Sensor Noise (Ornstein-Uhlenbeck) ---
        self._rpm_noise = self._ou_step(self._rpm_noise, 0.3, 8.0)
        self._load_noise = self._ou_step(self._load_noise, 0.4, 0.8)
        self._temp_noise = self._ou_step(self._temp_noise, 0.2, 0.3)

        self.engine_rpm += self._rpm_noise
        self.engine_load += self._load_noise
        self.coolant_temp += self._temp_noise

        # Clamp
        self.engine_load = max(0, min(100, self.engine_load))
        self.coolant_temp = max(20, min(120, self.coolant_temp))

        # --- Derived Values ---
        self.oil_pressure = max(0, (self.engine_rpm / 2500) * 55 - 8 * escalation_factor + self._rng.uniform(-0.5, 0.5))
        self.hydraulic_pressure = (self.engine_load / 100) * 3000 + self._rng.uniform(-20, 20)
        self.vibration = p["vibration_base"] + (self.engine_load / 100) * 4.0 + escalation_factor * 3.0 + self._rng.uniform(-0.2, 0.2)

        # --- Stress Index ---
        load_norm = self.engine_load / 100
        temp_norm = self.coolant_temp / 100
        stress_raw = (load_norm * 0.5 + temp_norm * 0.3 + escalation_factor * 0.2) * 100
        self.stress_index = max(0, min(100, stress_raw))

        # --- Degradation (cumulative) ---
        self.degradation += (self.stress_index / 100) * 0.00005 * v

        # --- Fuel consumption ---
        self.fuel_level = max(0, self.fuel_level - (self.engine_load / 100) * 0.003 * v)

        return self.to_dict()

    def reset(self):
        """Hard reset to safe idle baseline."""
        p = self.profile
        v = self._variance
        self.operating_mode = "IDLE"
        self.engine_rpm = p["idle_rpm"] * v
        self.engine_load = p["idle_load"] * v
        self.coolant_temp = p["idle_temp"] + self._rng.uniform(-1, 1)
        self.oil_pressure = 22.0 + self._rng.uniform(-2, 2)
        self.hydraulic_pressure = 300
        self.stress_index = 0.0
        self.vibration = p["vibration_base"]
        self.fault_codes = []
        self._rpm_noise = 0.0
        self._load_noise = 0.0
        self._temp_noise = 0.0

    def to_dict(self):
        return {
            "machine_id": self.machine_id,
            "machine_type": self.machine_type,
            "engine_rpm": round(self.engine_rpm),
            "engine_load": round(self.engine_load, 1),
            "coolant_temp": round(self.coolant_temp, 1),
            "oil_pressure": round(self.oil_pressure, 1),
            "hydraulic_pressure": round(self.hydraulic_pressure),
            "fuel_level": round(self.fuel_level, 1),
            "degradation": round(self.degradation, 4),
            "stress_index": round(self.stress_index, 1),
            "vibration_mm_s": round(self.vibration, 1),
            "operating_mode": self.operating_mode,
            "fault_codes": self.fault_codes,
            "timestamp": self.timestamp,
        }


# ─────────────────────────────────────────────────
# Worker Physiological DNA Profiles
# ─────────────────────────────────────────────────
# Each worker gets a unique "bio-profile" seeded from their ID.
# This ensures W1 always behaves like W1, but differently from W2.

class Worker:
    def __init__(self, worker_id, assigned_machine_id):
        self.worker_id = worker_id
        self.assigned_machine_id = assigned_machine_id

        # Deterministic per-worker RNG
        self._rng = random.Random(hash(worker_id + "_bio"))

        # ── Bio-Profile ("DNA") ──
        # Each worker has unique physiological characteristics
        self.baseline_hr = self._rng.uniform(64, 78)        # Resting HR: athletes ~60, avg ~72, unfit ~80
        self.max_hr = self._rng.uniform(160, 195)            # Max HR capacity
        self.hr_reactivity = self._rng.uniform(0.03, 0.08)   # How fast HR responds to stress (smoothing factor)
        self.hr_jitter = self._rng.uniform(0.3, 1.5)         # Natural HR variability amplitude (BPM)
        self.fatigue_resistance = self._rng.uniform(0.6, 1.4) # <1 = resilient (slow fatigue), >1 = fatigues fast
        self.recovery_rate = self._rng.uniform(0.05, 0.15)    # How fast fatigue decays when safe
        self.stress_sensitivity = self._rng.uniform(0.8, 1.2) # Stress response multiplier
        self.baseline_fatigue = self._rng.uniform(1.0, 8.0)   # Natural resting fatigue %
        self.baseline_hrv = self._rng.uniform(55, 72)         # Resting HRV (ms)

        # State
        self.heart_rate = self.baseline_hr
        self.hrv = self.baseline_hrv
        self.fatigue = self.baseline_fatigue
        self.stress = 0.0
        self.cis_score = 0.0
        self.cis_risk_level = "Safe"
        self.timestamp = time.time()

        # Noise state (OU processes for each sensor)
        self._hr_noise = 0.0
        self._fatigue_noise = 0.0

    def _ou_step(self, current, mean_reversion=0.3, volatility=1.0):
        """Ornstein-Uhlenbeck: mean-reverting random walk."""
        return current * (1 - mean_reversion) + self._rng.gauss(0, volatility)

    def update(self, machine_stress, escalation_factor=0.0):
        self.timestamp = time.time()

        # ── Heart Rate ──
        # Composed of: baseline + machine coupling + escalation + physiological noise
        machine_coupling = machine_stress * 0.06 * self.stress_sensitivity
        escalation_drive = (self.max_hr - self.baseline_hr) * escalation_factor * 0.55
        fatigue_drive = self.fatigue * 0.12  # Tired workers have slightly elevated HR

        target_hr = self.baseline_hr + machine_coupling + escalation_drive + fatigue_drive

        # Smooth with individual reactivity
        self.heart_rate += (target_hr - self.heart_rate) * self.hr_reactivity

        # Add physiological noise (heartbeat irregularity)
        self._hr_noise = self._ou_step(self._hr_noise, 0.25, self.hr_jitter)
        self.heart_rate += self._hr_noise
        self.heart_rate = max(50, min(self.max_hr, self.heart_rate))

        # ── HRV ──
        # HRV inversely correlates with HR and stress
        hr_above_rest = max(0, self.heart_rate - self.baseline_hr)
        self.hrv = self.baseline_hrv - hr_above_rest * 0.35 - (20 * escalation_factor)
        self.hrv += self._rng.uniform(-1.5, 1.5)  # Sensor jitter
        self.hrv = max(8, min(90, self.hrv))

        # ── Fatigue ──
        if escalation_factor > 0:
            # Accumulate: rate depends on individual resistance and escalation intensity
            fatigue_gain = 0.6 * escalation_factor * self.fatigue_resistance
            self.fatigue += fatigue_gain
        else:
            # Recovery: drift back towards personal baseline
            self.fatigue += (self.baseline_fatigue - self.fatigue) * self.recovery_rate

        # Add biological micro-variation
        self._fatigue_noise = self._ou_step(self._fatigue_noise, 0.2, 0.15)
        self.fatigue += self._fatigue_noise
        self.fatigue = max(0, min(100, self.fatigue))

        # ── Stress ──
        # Function of HR elevation and individual sensitivity
        hr_elevation = max(0, self.heart_rate - self.baseline_hr)
        raw_stress = (hr_elevation / (self.max_hr - self.baseline_hr)) * 100 * self.stress_sensitivity
        self.stress = max(0, min(100, raw_stress))

        # ── CIS Score ──
        # Weighted composite: Fatigue 40%, Stress 30%, Machine Stress 30%
        raw_cis = (
            0.4 * (self.fatigue / 100) +
            0.3 * (self.stress / 100) +
            0.3 * (machine_stress / 100)
        )
        self.cis_score = round(max(0, min(1.0, raw_cis)), 2)

        # ── Risk Level ──
        if self.cis_score >= 0.75:
            self.cis_risk_level = "Critical"
        elif self.cis_score >= 0.40:
            self.cis_risk_level = "Warning"
        else:
            self.cis_risk_level = "Safe"

        return self.to_dict()

    def reset(self):
        """Hard reset to safe personal baseline."""
        self.heart_rate = self.baseline_hr + self._rng.uniform(-1, 1)
        self.hrv = self.baseline_hrv + self._rng.uniform(-2, 2)
        self.fatigue = self.baseline_fatigue
        self.stress = 0.0
        self.cis_score = round(self.baseline_fatigue / 250, 2)  # Very low
        self.cis_risk_level = "Safe"
        self._hr_noise = 0.0
        self._fatigue_noise = 0.0

    def to_dict(self):
        return {
            "worker_id": self.worker_id,
            "assigned_machine": self.assigned_machine_id,
            "heart_rate_bpm": round(self.heart_rate),
            "hrv_ms": round(self.hrv),
            "fatigue_percent": round(self.fatigue, 1),
            "stress_percent": round(self.stress, 1),
            "cis_score": self.cis_score,
            "cis_risk_level": self.cis_risk_level,
            "timestamp": self.timestamp,
        }
