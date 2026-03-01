# 🖥️ Harmony Aura: Mission-Control Dashboard

The Harmony Aura Dashboard is a high-density **React 19** application designed for mission-critical industrial overwatch. It serves as the primary visual interface for supervisors to monitor fleet vitals and machine health in real-time.

---

## 🏗️ State Architecture: The Real-time Link

The application utilizes a **Zero-Latency Sync** strategy via the Firebase Realtime Database. Instead of polling, it uses a listener-based custom hook architecture.

### 🔌 Synchronization Hooks
| Hook | Responsibility | Data Source Path |
| :--- | :--- | :--- |
| `useRealtimeWorkers` | Real-time worker biometrics & stress levels | `site/workers/*` |
| `useRealtimeMachines` | Machine telemetry & PdM predictions | `site/machines/*` |
| `useRealtimeAlerts` | Actionable recommendations & risk triage | `site/recommendations/*` |
| `useRealtimeIoT` | Direct E2EE telemetry from hardware wearables | `site/iot/vitals` |

---

## 🎨 Design System: "Industrial Premium"

We employ a unique "Aura" aesthetic that combines high-tech futuristic elements with industrial clarity.

### 💎 Key Visual Features
- **GSAP Orchestration**: Smooth entry and exit animations for data cards using `gsap`.
- **Atomic Data Pills**: Highly reusable small components for displaying normalized metrics (e.g., `StatPill.jsx`).
- **Responsive HUD**: A layout that adapts from large command-center displays down to ruggedized industrial tablets.

### 🎨 Color Hierarchy
- `🔴 Critical`: Immediate danger (High CIS > 0.75).
- `🟡 Warning`: Pre-emptive caution (CIS 0.40 - 0.75).
- `🟢 Safe`: Optimal operating conditions.
- `💠 Aura Cyan`: Primary branding for active telemetry streams.

---

## 🧩 Key Components

### 1. **Risk Triage Panel (`ActionableAlerts.jsx`)**
A specialized sidebar that aggregates critical events from the `AlertsEngine`. It provides supervisors with "Why" and "What to do" intelligence.

### 2. **Worker HUD (`WorkerCard.jsx`)**
An animated card that displays live heart rate, fatigue, and the health status of the operator's assigned machine.

---

## 🛠️ Development & Build
- **Core**: React 19, Vite.
- **Styling**: Tailwind CSS v4, Lucide Icons.
- **Animation**: GSAP, Framer Motion.
- **Build**: `npm run build` generates a highly optimized production bundle.

---
*Visibility is Safety. Accuracy is Harmony.*
