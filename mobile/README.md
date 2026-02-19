# 📱 Harmony Aura: Supervisor Mobile App

The Supervisor App is a high-performance Flutter application that serves as the mobile "Command Center" for site managers. It provides real-time alerts, workforce oversight, and direct intervention capabilities.

---

## 🚀 Key Features

### 1. **Actionable Alerts & Triage**
- Real-time push notifications (via RTDB listeners) for critical biometric or machine events.
- **Triage Cards**: View exactly why a worker is at risk (e.g., "High Stress coupled with High Coolant Temp").
- **Direct Intervention**: Send commands (e.g., "Reduce Load to 60%") directly from the alert card.

### 2. **Worker Rest Requests**
- Dedicated workflow for handling operator break requests.
- Supervisors view a vitals snapshot of the operator at the time of request to make informed approval/denial decisions.

### 3. **Fleet Overview**
- Real-time status list of all active workers and their associated machine health.

---

## 🏗️ Technical Architecture

### 🛡️ **Firebase Data Link**
- **Listener Pattern**: Every screen utilizes `StreamBuilder` combined with `FirebaseService` streams for absolute state synchronization with the Web Dashboard.
- **Command Dispatch**: All supervisor actions are pushed to `site/commands/`, which the backend edge simulation listens to and executes.

### 🎨 **Industrial UI Theme**
- Custom design system using the `AuraTheme` class.
- Focus on high contrast for outdoor visibility in industrial environments.
- Consistent color coding with the Web Dashboard (Safe/Warning/Critical).

---

## 🛠️ Setup & Run

1.  **Dependencies**:
    ```bash
    flutter pub get
    ```
2.  **Run with API Key**:
    ```bash
    flutter run --dart-define=FIREBASE_API_KEY=YOUR_KEY
    ```

---
*Command and Control. Anywhere on site.*
