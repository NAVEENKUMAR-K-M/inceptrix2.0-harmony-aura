# 👷 Harmony Aura: Operator Safety HUD

The Harmony Aura Operator App is the personal safety companion for frontline industrial workers. It provides an intuitive, high-visibility dashboard for monitoring personal biometrics and machine health.

---

## 🚀 Key Features

### 1. **Personal Safety Dashboard**
- **Real-time Vitals**: Live monitoring of Heart Rate, Fatigue, and Stress levels.
- **Safety Gauge**: A simplified visual representation of the worker's own **CIS Score**.
- **Linked Machine Status**: Instant visibility into the health and thermal state of the machinery currently being operated.

### 2. **Rest Request Lifecycle**
- **One-Tap Reporting**: Send a "Request Rest" signal to the supervisor console instantly.
- **Vitals Snapshot**: Automatically attaches a 5-second heart rate and stress snapshot to the request for medical triage.
- **Approval Tracking**: Live feedback on the status of the request (Pending → Approved/Denied).

---

## 🏗️ Technical Architecture

### 🧬 **State Management**
- **Firebase StreamBuilder**: The UI re-renders automatically as new telemetry is pushed by the `backend/` simulation or physical `iot/` wearables.
- **Normalization Engine**: Converts machine physics (e.g., 98°C Coolant) into an understandable "Machine Stress" percentage for the worker.

### 🎨 **UI Design: "HUD Focused"**
- **Large Interaction Targets**: Designed for use while wearing industrial gloves.
- **High-Contrast Indicators**: Readable under direct sunlight or in dimly lit conditions.

---

## 🛠️ Setup & Execution

1. **Install Flutter SDK**: Ensure you are on Flutter 3.x.
2. **Fetch Packages**:
   ```bash
   flutter pub get
   ```
3. **Run Environment**:
   ```bash
   flutter run --dart-define=FIREBASE_API_KEY=YOUR_KEY
   ```

---
*Your Safety, Your Data. Harmony in Action.*
