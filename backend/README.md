# ⚙️ Harmony Aura: Simulation & Logic Engine

The backend of Harmony Aura is a high-fidelity bio-physics simulation engine that generates production-grade synthetic telemetry, handles AI inference for predictive maintenance, and executes supervisor commands.

---

## 🧬 Physiological Modeling (Worker)

Each worker (`W1` through `W10`) is initialized with a unique **Biological DNA Profile** seeded from their ID.

### 1. **Individual Profile Generation**
- **Baseline Heart Rate**: Derived from Gaussian distribution `N(72, 8)`.
- **HRV Sensitivity**: Inverse correlation with age and stress resistance.
- **Fatigue Resistance**: Scalar multiplier (0.6 - 1.4) affecting energy depletion rate.

### 2. **Telemetry Fluctuations (Sensor Noise)**
To simulate real-world IoT sensor jitter, we use the **Ornstein-Uhlenbeck (OU) Process**:
$$dx_t = \theta (\mu - x_t) dt + \sigma dW_t$$
- This ensures sensor readings (HR, Temp) don't jump randomly but behave like real, mean-reverting biological signals.

---

## 🏗️ Physics Modeling (Machine)

Machines are modeled with thermal balance equations and load-response inertia.

### 1. **Thermal Dynamics**
The coolant temperature $T_c$ is calculated as:
$$\Delta T = H_{gen} - H_{loss}$$
- $H_{gen} \propto \text{Engine Load} \times \text{Ambient Temp}$
- $H_{loss} \propto (T_c - T_{amb}) \times \text{Cooling Efficiency}$

### 2. **Machine Stress Index**
A weighted metric combining Thermal Load, Vibration Frequency, and Operating Mode.

---

## 🧠 Core Intelligence

### 1. **CIS Score (Cognitive Intelligence Score)**
The primary safety metric that correlates human and machine health.
- **Formula**: `CIS = (0.55 * HumanRisk) + (0.45 * MachineRisk)`
- **HumanRisk**: `0.4 * HR_Risk + 0.3 * HRV_Risk + 0.3 * Fatigue_Risk`
- **MachineRisk**: `0.6 * Stress_Risk + 0.4 * Degradation_Risk`

### 2. **Predictive Maintenance (PdM)**
- **Architecture**: 1D Convolutional Neural Network.
- **Input**: 60-tick sliding window of 6 telemetry parameters (RPM, Load, Temp, Vibration, Oil Pressure, Ambient Temp).
- **Inference**: Every 5 ticks, the engine runs a `tf.keras` prediction to determine Remaining Useful Life (RUL) category.

---

## 📡 Firebase Uplink Structure

The engine pushes data to Firebase RTDB under specific atomic paths to prevent state race conditions:
- `site/workers/{id}`: Real-time biometrics.
- `site/machines/{id}`: Real-time telemetry.
- `site/recommendations`: Generated via `alerts_engine.py`.
- `site/commands`: Listening for supervisor overrides.

---

## 🛠️ Requirements & Setup
- Python 3.9+
- `pip install -r requirements.txt` (includes: `firebase-admin`, `tensorflow`, `numpy`, `scikit-learn`)
- `serviceAccountKey.json` required for Firebase authentication.

---
*Precision Monitoring for Critical Operations.*
