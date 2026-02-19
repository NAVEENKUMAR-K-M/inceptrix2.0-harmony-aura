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

    def update(self, escalation_factor=0.0, ambient_temp=30.0, cooling_efficiency=1.0, load_cap=None):
        self.timestamp = time.time()
        p = self.profile
        v = self._variance

        # --- Supervisor Override: force IDLE when load_cap is very low ---
        if load_cap is not None and load_cap <= 10:
            self.operating_mode = "IDLE"
        elif escalation_factor > 0.5:
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
        elif self.operating_mode == "WORKING":
            target_rpm = p["work_rpm"] * v
            target_load = p["work_load"] * v
        else:  # HIGH_LOAD
            target_rpm = p["peak_rpm"] * v
            target_load = p["peak_load"] * v

        # --- Escalation Boost ---
        target_load += 20 * escalation_factor
        target_load = min(target_load, 100)

        # --- Supervisor Override: cap load ---
        if load_cap is not None:
            target_load = min(target_load, load_cap)
            target_rpm = min(target_rpm, p["work_rpm"] * 0.7)  # reduce RPM proportionally

        # --- Smooth Transitions with Type-Specific Inertia ---
        resp = p["load_responsiveness"]

        self.engine_rpm += (target_rpm - self.engine_rpm) * resp
        self.engine_load += (target_load - self.engine_load) * resp

        # --- Physics-based Thermal Balance ---
        # Heat generation: proportional to load + escalation
        heat_gen = (self.engine_load / 100) * 1.2 + escalation_factor * 0.8
        # Radiator cooling: proportional to (coolant - ambient), scaled by efficiency
        heat_loss = (self.coolant_temp - ambient_temp) * 0.025 * cooling_efficiency
        # Net temperature change
        self.coolant_temp += heat_gen - heat_loss

        # --- Add Sensor Noise (Ornstein-Uhlenbeck) ---
        self._rpm_noise = self._ou_step(self._rpm_noise, 0.3, 8.0)
        self._load_noise = self._ou_step(self._load_noise, 0.4, 0.8)
        self._temp_noise = self._ou_step(self._temp_noise, 0.2, 0.3)

        self.engine_rpm += self._rpm_noise
        self.engine_load += self._load_noise
        self.coolant_temp += self._temp_noise

        # Clamp
        self.engine_load = max(0, min(100, self.engine_load))
        self.coolant_temp = max(20, min(130, self.coolant_temp))

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

    def update(self, machine_stress, escalation_factor=0.0, humidity_factor=1.0, force_break=False):
        self.timestamp = time.time()

        # ── Supervisor Override: Mandatory Break ──
        if force_break:
            # Rapidly bring worker to resting state
            self.heart_rate += (self.baseline_hr - self.heart_rate) * 0.15
            self.fatigue = max(0, self.fatigue - 0.8)  # fast recovery
            self.stress = max(0, self.stress - 1.5)
            self.hrv = min(90, self.hrv + 0.5)
            self.cis_score = round(max(0, min(1.0,
                0.4 * (self.fatigue / 100) + 0.3 * (self.stress / 100) + 0.3 * (machine_stress / 100)
            )), 2)
            if self.cis_score >= 0.75:
                self.cis_risk_level = "Critical"
            elif self.cis_score >= 0.40:
                self.cis_risk_level = "Warning"
            else:
                self.cis_risk_level = "Safe"
            return self.to_dict()

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
        # Environmental coupling: high humidity accelerates fatigue
        if escalation_factor > 0:
            fatigue_gain = 0.6 * escalation_factor * self.fatigue_resistance * humidity_factor
            self.fatigue += fatigue_gain
        else:
            # Even at rest, high humidity slowly drains energy
            env_drain = max(0, (humidity_factor - 1.0) * 0.08)
            self.fatigue += (self.baseline_fatigue - self.fatigue) * self.recovery_rate + env_drain

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


# ─────────────────────────────────────────────────
# Site Environment Simulation
# ─────────────────────────────────────────────────
# Simulates ambient conditions at the construction site:
#   - Temperature follows a sinusoidal day/night cycle (compressed to ~5 min)
#   - Humidity inversely correlates with temperature
#   - Weather events (heatwave, rain) can be triggered externally
#
# Coupling effects:
#   Machine: ambient heat reduces cooling efficiency → higher coolant_temp
#   Worker:  high humidity accelerates fatigue accumulation

class SiteEnvironment:
    """Simulates ambient site conditions with realistic physics.

    Key improvements over v1:
    - Stochastic autonomous weather transitions (no external trigger needed)
    - Wind gusts correlated with storm fronts
    - Atmospheric pressure-driven humidity shifts
    - Multiple noise layers for micro-variation
    - Thermal mass: temperature changes lag behind target (inertia)
    """

    DAY_CYCLE_SECONDS = 300.0  # Compressed day = ~5 min for demo

    # Weather transition matrix: probability of transitioning per tick (~1s)
    # Format: {current: [(next, prob_per_tick), ...]}
    WEATHER_TRANSITIONS = {
        "Clear":    [("Overcast", 0.005), ("Heatwave", 0.002)],
        "Overcast": [("Clear",    0.008), ("Rain",     0.006)],
        "Rain":     [("Overcast", 0.007), ("Clear",    0.003)],
        "Heatwave": [("Clear",    0.006), ("Overcast", 0.003)],
    }

    # Weather-specific modifiers
    WEATHER_PROFILES = {
        "Clear":    {"temp_offset": 0.0,  "hum_offset": 0.0,   "wind_base": 8.0,  "wind_gust": 3.0},
        "Overcast": {"temp_offset": -2.5, "hum_offset": 10.0,  "wind_base": 12.0, "wind_gust": 5.0},
        "Rain":     {"temp_offset": -6.0, "hum_offset": 25.0,  "wind_base": 18.0, "wind_gust": 12.0},
        "Heatwave": {"temp_offset": 9.0,  "hum_offset": -12.0, "wind_base": 4.0,  "wind_gust": 2.0},
    }

    def __init__(self):
        self._rng = random.Random(42)
        self._tick = 0

        # Base ranges
        self._temp_min = 26.0   # Night-time low
        self._temp_max = 38.0   # Daytime high
        self._hum_min = 38.0
        self._hum_max = 78.0

        # State
        self.ambient_temp = 30.0
        self.humidity = 55.0
        self.weather = "Clear"
        self.wind_speed_kmh = 8.0
        self._weather_hold = 0          # Minimum ticks before next transition
        self._weather_ticks_elapsed = 0 # How long current weather has lasted

        # Noise (Ornstein-Uhlenbeck)
        self._temp_noise = 0.0
        self._hum_noise = 0.0
        self._wind_noise = 0.0

        # Atmospheric pressure (affects humidity drift)
        self._pressure = 1013.0  # hPa
        self._pressure_drift = 0.0

    def _ou_step(self, current, mean_reversion=0.15, volatility=0.5):
        return current * (1 - mean_reversion) + self._rng.gauss(0, volatility)

    def _try_weather_transition(self):
        """Stochastically transition weather based on Markov chain."""
        self._weather_ticks_elapsed += 1
        if self._weather_hold > 0:
            self._weather_hold -= 1
            return

        transitions = self.WEATHER_TRANSITIONS.get(self.weather, [])
        for next_weather, prob in transitions:
            if self._rng.random() < prob:
                self.weather = next_weather
                self._weather_hold = self._rng.randint(40, 120)  # Hold for 40-120s
                self._weather_ticks_elapsed = 0
                return

    def update(self):
        """Advance by one simulation tick (~1 s)."""
        self._tick += 1

        # ── Weather: Autonomous transitions ──
        self._try_weather_transition()

        wp = self.WEATHER_PROFILES[self.weather]

        # ── Day/Night sinusoidal cycle ──
        phase = (self._tick / self.DAY_CYCLE_SECONDS) * 2 * math.pi
        day_factor = (math.sin(phase) + 1.0) / 2.0  # 0 (night) → 1 (noon)

        # ── Atmospheric pressure drift (affects humidity) ──
        self._pressure_drift = self._ou_step(self._pressure_drift, 0.05, 0.15)
        self._pressure += self._pressure_drift
        self._pressure = max(990, min(1035, self._pressure))
        # Low pressure = more moisture
        pressure_hum_bonus = max(0, (1013.0 - self._pressure) * 0.6)

        # ── Target values ──
        target_temp = (
            self._temp_min
            + (self._temp_max - self._temp_min) * day_factor
            + wp["temp_offset"]
        )
        target_hum = (
            self._hum_max
            - (self._hum_max - self._hum_min) * day_factor
            + wp["hum_offset"]
            + pressure_hum_bonus
        )

        # ── Thermal inertia: slow approach to target ──
        # Atmosphere has thermal mass — temperature can't jump instantly
        inertia = 0.012  # ~80 ticks to close 63% of the gap
        self.ambient_temp += (target_temp - self.ambient_temp) * inertia
        self.humidity += (target_hum - self.humidity) * 0.018

        # ── Multi-layer noise ──
        # Layer 1: Smooth drift (slow, large)
        self._temp_noise = self._ou_step(self._temp_noise, 0.08, 0.25)
        self._hum_noise = self._ou_step(self._hum_noise, 0.1, 0.6)
        # Layer 2: Fast micro-jitter (sensor noise)
        micro_temp = self._rng.gauss(0, 0.12)
        micro_hum = self._rng.gauss(0, 0.3)

        self.ambient_temp += self._temp_noise + micro_temp
        self.humidity += self._hum_noise + micro_hum

        # ── Clamp ──
        self.ambient_temp = max(18, min(52, self.ambient_temp))
        self.humidity = max(20, min(98, self.humidity))

        # ── Wind: base + gusts ──
        target_wind = wp["wind_base"]
        gust = 0.0
        # Random gusts: more frequent and stronger in Rain
        if self._rng.random() < 0.05:
            gust = self._rng.uniform(0, wp["wind_gust"])
        self._wind_noise = self._ou_step(self._wind_noise, 0.15, 0.8)
        self.wind_speed_kmh += (target_wind - self.wind_speed_kmh) * 0.04 + self._wind_noise + gust
        self.wind_speed_kmh = max(0, min(55, self.wind_speed_kmh))

        return self.to_dict()

    # ── Coupling Coefficients ──

    @property
    def thermal_penalty(self):
        """Extra degrees to add to machine coolant_temp due to ambient heat.
        Returns 0 when ambient ≤ 30°C, scales up to +12°C at 50°C."""
        return max(0, (self.ambient_temp - 30.0) * 0.6)

    @property
    def fatigue_multiplier(self):
        """Multiplier for worker fatigue accumulation due to humidity.
        Returns 1.0 at 50% humidity, up to 1.5 at 95% humidity."""
        return 1.0 + max(0, (self.humidity - 50.0) / 90.0)

    @property
    def cooling_efficiency(self):
        """Machine radiator cooling efficiency: 1.0 in clear weather, reduced in heatwave.
        Rain actually HELPS cooling (water spray). Wind also helps."""
        base = {"Clear": 1.0, "Overcast": 0.95, "Rain": 1.15, "Heatwave": 0.7}
        wind_bonus = min(0.15, self.wind_speed_kmh / 200)
        return base.get(self.weather, 1.0) + wind_bonus

    def to_dict(self):
        return {
            "ambient_temp_c": round(self.ambient_temp, 1),
            "humidity_pct": round(self.humidity, 1),
            "weather": self.weather,
            "wind_speed_kmh": round(self.wind_speed_kmh, 1),
        }

