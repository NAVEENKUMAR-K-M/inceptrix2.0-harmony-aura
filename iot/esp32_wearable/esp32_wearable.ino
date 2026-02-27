/*
  ═══════════════════════════════════════════════════════════════════
  Harmony Aura — ESP32 Wearable Node (E2EE Secured)
  ═══════════════════════════════════════════════════════════════════

  Hardware:
    - ESP32 Dev Module
    - DHT22         → GPIO 4   (Temperature & Humidity)
    - Pulse Sensor  → GPIO 36  (Analog — Heart Rate BPM)
    - MPU6050       → I2C SDA/SCL (GPIO 21/22) (Gyroscope/Accelerometer)
    - MQ Gas Sensor → GPIO 34  (Analog — Air Quality)
    - SW-420 Vibration → GPIO 35 (Analog — Physical Impact)

  Security:
    - AES-256-GCM authenticated encryption
    - Each packet gets a unique 12-byte IV
    - Firebase only sees encrypted ciphertext — zero plaintext exposure

  Data Flow:
    Sensors → AES-256-GCM Encrypt → Firebase RTDB (site/iot/vitals)

  Libraries Required (Install via Arduino Library Manager):
    - Firebase ESP Client (by mobizt)
    - DHT sensor library (by Adafruit)
    - Adafruit Unified Sensor
    - MPU6050_light (by rfetick)
    - ArduinoJson
    - Wire (built-in)
    - mbedtls (built into ESP32 SDK — no install needed)
*/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// Firebase helper addons
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#include <DHT.h>
#include <Wire.h>
#include <MPU6050_light.h>
#include <ArduinoJson.h>

// ┌──────────────────────────────────────────────────┐
// │  E2EE SECURITY — AES-256-GCM Encryption Layer   │
// └──────────────────────────────────────────────────┘
#include "../shared/harmony_crypto_config.h"

// ═══════════════════════════════════════════════════
//  USER CONFIGURATION — UPDATE THESE BEFORE FLASHING
// ═══════════════════════════════════════════════════

// WiFi Credentials
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

// Firebase Credentials (from Firebase Console)
#define FIREBASE_HOST   "harmony-aura-default-rtdb.firebaseio.com"
#define API_KEY         "AIzaSyC3wBL1tKjUm1b8aJ9nSBc26E3lH_F0sYI"

// Firebase Database Secret
#define DATABASE_SECRET "YOUR_DATABASE_SECRET"

// ═══════════════════════════════════════════════════
//  PIN DEFINITIONS
// ═══════════════════════════════════════════════════

#define DHT_PIN         4       // DHT22 data pin
#define DHT_TYPE        DHT22
#define PULSE_PIN       36      // Analog input (VP)
#define GAS_PIN         34      // Analog input
#define VIBRATION_PIN   35      // Analog input

// ═══════════════════════════════════════════════════
//  SENSOR OBJECTS
// ═══════════════════════════════════════════════════

DHT dht(DHT_PIN, DHT_TYPE);
MPU6050 mpu(Wire);

// Firebase objects
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// ═══════════════════════════════════════════════════
//  TIMING
// ═══════════════════════════════════════════════════

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 1000; // 1 second

unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 5000; // 5 seconds

// BPM calculation variables
int pulseReadings[10];
int pulseIndex = 0;
unsigned long lastBeatTime = 0;
int currentBPM = 72;
bool beatDetected = false;
int beatThreshold = 2048;

// Packet counter for replay protection
uint32_t packetCounter = 0;

// ═══════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n═══════════════════════════════════════");
  Serial.println("  Harmony Aura — ESP32 Wearable [E2EE]");
  Serial.println("═══════════════════════════════════════\n");

  // ── Initialize Sensors ──
  dht.begin();
  Wire.begin();

  byte mpuStatus = mpu.begin();
  if (mpuStatus != 0) {
    Serial.println("[WARN] MPU6050 not found! Check wiring.");
  } else {
    Serial.println("[OK] MPU6050 initialized.");
    Serial.println("     Calibrating gyroscope... (keep device still)");
    mpu.calcOffsets();
    Serial.println("     Calibration complete.");
  }

  analogReadResolution(12);

  // ── Connect to WiFi ──
  Serial.printf("[WIFI] Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WIFI] Connected! IP: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WIFI] Connection FAILED. Restarting...");
    ESP.restart();
  }

  // ── Initialize Firebase ──
  config.api_key = API_KEY;
  config.database_url = FIREBASE_HOST;
  config.signer.tokens.legacy_token = DATABASE_SECRET;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectNetwork(true);
  fbdo.setBSSLBufferSize(4096, 1024);

  Serial.println("[FIREBASE] Initialized.");
  Serial.println("[CRYPTO] AES-256-GCM encryption ACTIVE.");
  Serial.printf("[CRYPTO] Key fingerprint: %02X%02X...%02X%02X\n",
                HARMONY_AES_KEY[0], HARMONY_AES_KEY[1],
                HARMONY_AES_KEY[30], HARMONY_AES_KEY[31]);
  Serial.println("[READY] Starting encrypted telemetry loop...\n");
}

// ═══════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════

void loop() {
  unsigned long now = millis();

  // ── Read Pulse Sensor (high frequency for BPM accuracy) ──
  int pulseRaw = analogRead(PULSE_PIN);

  // Simple beat detection
  if (pulseRaw > beatThreshold && !beatDetected) {
    beatDetected = true;
    unsigned long beatInterval = now - lastBeatTime;
    lastBeatTime = now;

    if (beatInterval > 300 && beatInterval < 2000) {
      int bpm = 60000 / beatInterval;
      currentBPM = (int)(currentBPM * 0.7 + bpm * 0.3);
      currentBPM = constrain(currentBPM, 40, 200);
    }
  }
  if (pulseRaw < beatThreshold - 200) {
    beatDetected = false;
  }

  // ── Send Encrypted Data to Firebase at Interval ──
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;

    // Read DHT22
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    // Read MPU6050
    mpu.update();
    float accelX = mpu.getAccX();
    float accelY = mpu.getAccY();
    float accelZ = mpu.getAccZ();
    float gyroX = mpu.getGyroX();
    float gyroY = mpu.getGyroY();
    float gyroZ = mpu.getGyroZ();
    float tiltAngle = mpu.getAngleX();

    // Read Gas Sensor
    int gasRaw = analogRead(GAS_PIN);
    float gasPPM = map(gasRaw, 0, 4095, 0, 1000);

    // Read Vibration Sensor
    int vibrationRaw = analogRead(VIBRATION_PIN);
    float vibrationG = (float)vibrationRaw / 4095.0 * 16.0;

    // Validate DHT readings
    if (isnan(temperature)) temperature = -1;
    if (isnan(humidity)) humidity = -1;

    // ┌──────────────────────────────────────────┐
    // │  Step 1: Build Plaintext JSON Payload    │
    // └──────────────────────────────────────────┘
    StaticJsonDocument<512> doc;
    doc["heart_rate_bpm"] = currentBPM;
    doc["body_temp_c"] = roundf(temperature * 10) / 10;
    doc["ambient_humidity_pct"] = roundf(humidity * 10) / 10;
    doc["accel_x"] = roundf(accelX * 100) / 100;
    doc["accel_y"] = roundf(accelY * 100) / 100;
    doc["accel_z"] = roundf(accelZ * 100) / 100;
    doc["gyro_x"] = roundf(gyroX * 100) / 100;
    doc["gyro_y"] = roundf(gyroY * 100) / 100;
    doc["gyro_z"] = roundf(gyroZ * 100) / 100;
    doc["tilt_angle_deg"] = roundf(tiltAngle * 10) / 10;
    doc["gas_ppm"] = (int)gasPPM;
    doc["vibration_g"] = roundf(vibrationG * 100) / 100;
    doc["device_id"] = "ESP32-WEARABLE-01";
    doc["timestamp"] = (double)millis();
    doc["wifi_rssi"] = WiFi.RSSI();
    doc["uptime_s"] = (int)(millis() / 1000);
    doc["pkt"] = packetCounter++;  // Replay protection counter

    // Serialize to string
    char plaintext[512];
    serializeJson(doc, plaintext, sizeof(plaintext));

    // ┌──────────────────────────────────────────┐
    // │  Step 2: Encrypt with AES-256-GCM        │
    // └──────────────────────────────────────────┘
    EncryptedPayload encrypted;
    if (encryptPayload(plaintext, encrypted)) {

      // ┌──────────────────────────────────────────┐
      // │  Step 3: Push Secure Envelope to Firebase │
      // └──────────────────────────────────────────┘
      FirebaseJson secureJson;
      secureJson.set("s/v", HARMONY_CRYPTO_VERSION);
      secureJson.set("s/iv", encrypted.iv);
      secureJson.set("s/ct", encrypted.ct);
      secureJson.set("s/at", encrypted.at);

      if (Firebase.ready()) {
        if (Firebase.RTDB.setJSON(&fbdo, "/site/iot/vitals", &secureJson)) {
          Serial.printf("[TX-E2EE] Pkt#%u | HR:%d | T:%.1f°C | Encrypted ✓\n",
                        packetCounter - 1, currentBPM, temperature);
        } else {
          Serial.printf("[ERR] Firebase push failed: %s\n", fbdo.errorReason().c_str());
        }
      }
    } else {
      Serial.println("[CRYPTO ERR] Encryption failed! Skipping packet.");
    }

    // ── Heartbeat (unencrypted — non-sensitive metadata) ──
    if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
      lastHeartbeat = now;
      Firebase.RTDB.setInt(&fbdo, "/site/iot/status/wearable_last_seen", (int)(millis() / 1000));
    }
  }

  delay(10);
}
