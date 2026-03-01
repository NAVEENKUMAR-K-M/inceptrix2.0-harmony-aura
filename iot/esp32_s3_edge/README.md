# 🧠 Harmony Aura: ESP32-S3 Edge Intelligence Node

The Edge Intelligence Node is the "Brain" of the physical IoT layer. Utilizing the powerful **ESP32-S3** dual-core processor, it orchestrates multiple data streams, performs real-time data fusion, and triggers local hardware alarms.

---

## 🏗️ The Sentinel Engine

At the heart of the Edge Node is the `SentinelEngine.h`, a modular C++ class that encapsulates the ecosystem's complex mathematical models.

### 1. **Data Fusion Strategy**
The node concurrently listens to **three distinct Firebase streams**:
- `site/iot/vitals`: Encrypted hardware vitals (Decrypted on-device).
- `site/machines/*`: Physical simulation telemetry.
- `site/iot/synthetic`: Digital Twin parameters (SpO2, Noise, Wind).

### 2. **Real-time CIS Logic**
The S3 Node fuses these streams to calculate the **Composite Intelligence Score (CIS)** locally, ensuring that critical safety decisions can be made even if cloud connectivity is intermittent.

---

## 🛡️ Security Orchestration

- **Decryption**: Uses AES-256-GCM to decrypt incoming wearable hardware packets.
- **Verification**: Validates packet counters to prevent replay attacks on the edge.
- **Re-Encryption**: (Optional/Planned) Securely transmits fused results back to the supervisor dashboard.

---

## 🚨 Local Hardware Triggering

The node acts as a physical safety interlock. If a **Critical State (CIS > 0.75)** is detected:
- **Visual Alert**: Triggers an addressable RGB LED (GPIO 48) to Pulse Red.
- **Auditory Alert**: Activates an active buzzer (GPIO 17) for immediate operator warning.

---

## 🛠️ Setup & Flash

1. **Board**: Select `ESP32S3 Dev Module` in Arduino IDE.
2. **PSRAM**: Ensure OPI PSRAM is enabled if available on your module.
3. **Firmware**: Upload `esp32_s3_edge.ino` (ensure `SentinelEngine.h` is in the same directory).

---
*Edge Intelligence for a Safer Workforce.*
