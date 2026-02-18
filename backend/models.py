
import random
import time
import math

class Machine:
    def __init__(self, machine_id, machine_type):
        self.machine_id = machine_id
        self.machine_type = machine_type
        self.engine_rpm = 0
        self.engine_load = 0
        self.coolant_temp = 25.0  # Celsius
        self.oil_pressure = 0
        self.hydraulic_pressure = 0
        self.fuel_level = 100.0
        self.degradation = 0.0
        self.stress_index = 0.0
        self.fault_codes = []
        self.operating_mode = "IDLE"  # IDLE, WORKING, HIGH_LOAD, ERROR
        self.timestamp = time.time()

    def update(self):
        self.timestamp = time.time()
        
        # Simulate operating mode changes
        if random.random() < 0.05:
            modes = ["IDLE", "WORKING", "HIGH_LOAD"]
            weights = [0.2, 0.6, 0.2]
            self.operating_mode = random.choices(modes, weights=weights)[0]

        # Physics-based updates
        if self.operating_mode == "IDLE":
            target_rpm = 800
            target_load = 10
            heat_gain = 0.1
        elif self.operating_mode == "WORKING":
            target_rpm = 1800
            target_load = 60
            heat_gain = 0.5
        elif self.operating_mode == "HIGH_LOAD":
            target_rpm = 2400
            target_load = 90
            heat_gain = 1.2
        else: # ERROR
            target_rpm = 0
            target_load = 0
            heat_gain = -0.5

        # Smooth transitions (Simple low-pass filter)
        self.engine_rpm += (target_rpm - self.engine_rpm) * 0.1 + random.uniform(-10, 10)
        self.engine_load += (target_load - self.engine_load) * 0.1 + random.uniform(-2, 2)
        
        # Thermal lag model
        self.coolant_temp += heat_gain * 0.1 - (self.coolant_temp - 25) * 0.01
        
        # Pressure dynamics
        self.oil_pressure = (self.engine_rpm / 2500) * 60 + random.uniform(-2, 2)
        self.hydraulic_pressure = (self.engine_load / 100) * 3000 + random.uniform(-50, 50)

        # Degradation & Stress
        stress_factor = (self.engine_load / 100) * (self.coolant_temp / 100)
        self.stress_index = stress_factor * 100
        self.degradation += stress_factor * 0.0001
        
        self.fuel_level -= (self.engine_load / 100) * 0.01
        if self.fuel_level < 0: self.fuel_level = 0

        return self.to_dict()

    def to_dict(self):
        return {
            "machine_id": self.machine_id,
            "machine_type": self.machine_type,
            "engine_rpm": round(self.engine_rpm),
            "engine_load": round(self.engine_load, 1),
            "coolant_temp": round(self.coolant_temp, 1),
            "oil_pressure": round(self.oil_pressure, 1),
            "hydraulic_pressure": round(self.hydraulic_pressure, 1),
            "fuel_level": round(self.fuel_level, 1),
            "degradation": round(self.degradation, 4),
            "stress_index": round(self.stress_index, 1),
            "operating_mode": self.operating_mode,
            "fault_codes": self.fault_codes,
            "timestamp": self.timestamp
        }

class Worker:
    def __init__(self, worker_id, assigned_machine_id):
        self.worker_id = worker_id
        self.assigned_machine_id = assigned_machine_id
        self.heart_rate = 70
        self.hrv = 50
        self.fatigue = 0
        self.stress = 0
        self.cis_score = 0.0
        self.cis_risk_level = "Safe"
        self.timestamp = time.time()

    def update(self, machine_stress):
        self.timestamp = time.time()
        
        # Base HR on machine stress (coupling) + fatigue
        target_hr = 70 + (machine_stress * 0.5) + (self.fatigue * 0.5)
        self.heart_rate += (target_hr - self.heart_rate) * 0.1 + random.uniform(-2, 2)
        
        # HRV inversely related to stress
        self.hrv = 100 - (self.heart_rate - 50) + random.uniform(-5, 5)
        
        # Fatigue accumulation
        self.fatigue += 0.01 + (machine_stress * 0.001)
        if self.fatigue > 100: self.fatigue = 100
        
        # Human Stress calculation
        self.stress = (self.heart_rate - 60) / 1.2
        if self.stress < 0: self.stress = 0
        if self.stress > 100: self.stress = 100
        
        # CIS Calculation
        # CIS = 0.4*HumanFatigue + 0.3*HumanStress + 0.3*MachineStress (normalized 0-1)
        raw_cis = (0.4 * self.fatigue + 0.3 * self.stress + 0.3 * machine_stress) / 100
        self.cis_score = round(raw_cis, 2)
        
        # Assess Risk
        if self.cis_score < 0.3:
            self.cis_risk_level = "Safe"
        elif self.cis_score < 0.7:
            self.cis_risk_level = "Warning"
        else:
            self.cis_risk_level = "Critical"

        return self.to_dict()

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
            "timestamp": self.timestamp
        }
