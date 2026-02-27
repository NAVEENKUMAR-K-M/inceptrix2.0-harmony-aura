/*
  ═══════════════════════════════════════════════════════════════════
  Harmony Aura — ESP32 Wearable Node (Operator Biometric Telemetry)
  ═══════════════════════════════════════════════════════════════════

  Hardware:
    - ESP32 Dev Module
    - DHT22         → GPIO 4   (Temperature & Humidity)
    - Pulse Sensor  → GPIO 36  (Analog — Heart Rate BPM)
    - MPU6050       → I2C SDA/SCL (GPIO 21/22) (Gyroscope/Accelerometer)
    - MQ Gas Sensor → GPIO 34  (Analog — Air Quality)
    - SW-420 Vibration → GPIO 35 (Analog — Physical Impact)

  Data Flow:
    Sensors → ESP32 → WiFi → Firebase RTDB (site/iot/vitals)

  Libraries Required (Install via Arduino Library Manager):
    - Firebase ESP Client (by mobizt)
    - DHT sensor library (by Adafruit)
    - Adafruit Unified Sensor
    - MPU6050_light (by rfetick)
    - PulseSensorPlayground
    - ArduinoJson
    - Wire (built-in)

  Firebase Auth: Uses database secret / legacy token for simplicity.
  For production, use service account OAuth.
*/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>

// Firebase helper addons
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#include <DHT.h>
#include <Wire.h>
#include <MPU6050_light.h>

// ═══════════════════════════════════════════════════
//  USER CONFIGURATION — UPDATE THESE BEFORE FLASHING
// ═══════════════════════════════════════════════════

// WiFi Credentials
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

// Firebase Credentials (from Firebase Console)
#define FIREBASE_HOST   "harmony-aura-default-rtdb.firebaseio.com"
#define API_KEY         "AIzaSyC3wBL1tKjUm1b8aJ9nSBc26E3lH_F0sYI"

// Firebase Database Secret (Project Settings → Service Accounts → Database Secrets)
// This is used for legacy auth. For production, use service account.
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

// Heartbeat tracking (last seen timestamp for online detection)
unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 5000; // 5 seconds

// BPM calculation variables
int pulseReadings[10];
int pulseIndex = 0;
unsigned long lastBeatTime = 0;
int currentBPM = 72; // default resting HR
bool beatDetected = false;
int beatThreshold = 2048; // Midpoint for 12-bit ADC

// ═══════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n═══════════════════════════════════════");
  Serial.println("  Harmony Aura — ESP32 Wearable Node");
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

  // ADC resolution (ESP32 = 12-bit)
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

  // Legacy token auth (simplest for ESP32)
  config.signer.tokens.legacy_token = DATABASE_SECRET;

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectNetwork(true);

  // Set database read timeout
  fbdo.setBSSLBufferSize(4096, 1024);

  Serial.println("[FIREBASE] Initialized.");
  Serial.println("[READY] Starting telemetry loop...\n");
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

    if (beatInterval > 300 && beatInterval < 2000) { // 30–200 BPM range
      int bpm = 60000 / beatInterval;
      // Exponential smoothing
      currentBPM = (int)(currentBPM * 0.7 + bpm * 0.3);
      currentBPM = constrain(currentBPM, 40, 200);
    }
  }
  if (pulseRaw < beatThreshold - 200) {
    beatDetected = false;
  }

  // ── Send Data to Firebase at Interval ──
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

    // Calculate "tilt angle" (simplified postural analysis)
    float tiltAngle = mpu.getAngleX();

    // Read Gas Sensor (raw ADC → approximate PPM mapping)
    int gasRaw = analogRead(GAS_PIN);
    float gasPPM = map(gasRaw, 0, 4095, 0, 1000); // Rough linear map

    // Read Vibration Sensor
    int vibrationRaw = analogRead(VIBRATION_PIN);
    float vibrationG = (float)vibrationRaw / 4095.0 * 16.0; // Scale to g-force approx

    // ── Validate DHT readings ──
    if (isnan(temperature)) temperature = -1;
    if (isnan(humidity)) humidity = -1;

    // ── Build Firebase JSON ──
    FirebaseJson json;

    // Biometrics
    json.set("heart_rate_bpm", currentBPM);

    // Environmental (from wearable's perspective)
    json.set("body_temp_c", roundf(temperature * 10) / 10);
    json.set("ambient_humidity_pct", roundf(humidity * 10) / 10);

    // Motion & Posture
    json.set("accel_x", roundf(accelX * 100) / 100);
    json.set("accel_y", roundf(accelY * 100) / 100);
    json.set("accel_z", roundf(accelZ * 100) / 100);
    json.set("gyro_x", roundf(gyroX * 100) / 100);
    json.set("gyro_y", roundf(gyroY * 100) / 100);
    json.set("gyro_z", roundf(gyroZ * 100) / 100);
    json.set("tilt_angle_deg", roundf(tiltAngle * 10) / 10);

    // Air Quality
    json.set("gas_ppm", (int)gasPPM);

    // Physical Impact
    json.set("vibration_g", roundf(vibrationG * 100) / 100);

    // Metadata
    json.set("device_id", "ESP32-WEARABLE-01");
    json.set("timestamp", (double)millis());
    json.set("wifi_rssi", WiFi.RSSI());
    json.set("uptime_s", (int)(millis() / 1000));

    // ── Push to Firebase ──
    if (Firebase.ready()) {
      if (Firebase.RTDB.setJSON(&fbdo, "/site/iot/vitals", &json)) {
        Serial.printf("[TX] HR:%d | T:%.1f°C | H:%.0f%% | Gas:%d | Vib:%.2fg | Tilt:%.1f°\n",
                      currentBPM, temperature, humidity, (int)gasPPM, vibrationG, tiltAngle);
      } else {
        Serial.printf("[ERR] Firebase push failed: %s\n", fbdo.errorReason().c_str());
      }
    }

    // ── Heartbeat (for online status detection) ──
    if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
      lastHeartbeat = now;
      Firebase.RTDB.setInt(&fbdo, "/site/iot/status/wearable_last_seen", (int)(millis() / 1000));
    }
  }

  delay(10); // Small delay for analog stability
}
