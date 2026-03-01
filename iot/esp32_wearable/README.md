# ⌚ Harmony Aura: ESP32 Wearable Node

The Wearable Node is a low-power **ESP32 Dev Module** based device that captures real-time worker biometrics and environmental data. It features end-to-end encryption (E2EE) to ensure sensitive health data is never exposed as plaintext.

---

## 🏗️ Hardware Architecture

### 🔌 Pinout Configuration
| Sensor | Connection | ESP32 Pin |
| :--- | :--- | :--- |
| **Pulse Sensor** | Analog | GPIO 34 |
| **DHT22** | Digital | GPIO 4 |
| **MPU6050** | I2C (SDA/SCL) | GPIO 21 / 22 |
| **Gas Sensor (MQ)** | Analog | GPIO 35 |
| **SW-420 Vib** | Analog | GPIO 27 |
| **OLED (SSD1306)** | SPI (MOSI/CLK/CS/DC/RES) | 23 / 18 / 5 / 16 / 17 |

---

## 🛡️ Security Layer: E2EE

To protect worker privacy, the wearable performs on-device encryption before the data ever leaves the local heap.

- **Algorithm**: AES-256-GCM (Authenticated Encryption).
- **Library**: `mbedtls` (Native ESP32 hardware acceleration).
- **Data Envelope**:
    - **IV (Initialization Vector)**: Unique per packet (12-byte).
    - **Ciphertext**: The encrypted JSON vitals.
    - **Tag**: 16-byte authentication tag to prevent tampering.

---

## 📊 Local Feedback: OLED HUD

The wearable provides an immediate safety HUD for the worker:
- **HR Sparkline**: Real-time heart rate trend visualization.
- **Orientation HUD**: Pitch, Roll, and Tilt Severity from the MPU6050.
- **E2EE Status**: Persistent "Secure" indicator verifying encryption is active.

---

## 🛠️ Installation & Setup

1. **Libraries**: Install `Firebase ESP Client`, `ArduinoJson`, `DHT`, `Adafruit SSD1306`, and `MPU6050_light`.
2. **Key Config**: Set your `HARMONY_AES_KEY` in `../shared/harmony_crypto_config.h`.
3. **Flash**: Upload `esp32_wearable.ino` via Arduino IDE.

---
*Portable Safety. Absolute Privacy.*
