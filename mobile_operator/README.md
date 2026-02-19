# 👷 Harmony Aura: Operator App

The Harmony Aura Operator App is the companion application for individual workers. It provides a personal safety dashboard, real-time vitals monitoring, and a direct communication link to supervisors for rest requests.

---

## 🚀 Key Features

### 1. **Personal Vitals Dashboard**
- **Real-time Biometrics**: Continuous monitoring of Heart Rate (BPM), Heart Rate Variability (HRV), and Fatigue.
- **CIS Monitoring**: Workers see their own Cognitive Intelligence Score simplified into a safety gauge.
- **Assigned Machine Sync**: The app automatically syncs with the health of the machine being operated by that worker.

### 2. **Rest Request Lifecycle**
- One-tap "Request Rest" functionality.
- Captures a vitals snapshot (HR, Stress, Fatigue) at the moment of request to assist supervisor triage.
- **Live Status Tracking**: Real-time status updates (Pending → Approved/Denied) synced directly from the Supervisor App or Web Dashboard.

---

## 🏗️ Technical Architecture

### 🧬 **Data Models**
- **WorkerData**: Mirrors the backend simulation properties (`heart_rate_bpm`, `fatigue_percent`, etc.).
- **Normalization**: Translates raw machine physics into a consolidated stress level.

### 🔌 **Edge Connectivity**
- Designed to eventually interface with local Bluetooth biometric wearables (Apple Watch, Garmin, Whoop).
- Currently utilizes a Firebase RTDB stream for simulated biometric input from the `backend/` simulation engine.

---

## 🛠️ Setup & Run

1.  **Dependencies**:
    ```bash
    flutter pub get
    ```
2.  **Run**:
    ```bash
    flutter run --dart-define=FIREBASE_API_KEY=YOUR_KEY
    ```

---
*Your Safety, Your Data. Harmony in Action.*
