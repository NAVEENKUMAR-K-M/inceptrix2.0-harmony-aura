/*
  ═══════════════════════════════════════════════════════════════════
  Harmony Aura — ESP32-S3 Edge Intelligence Unit (E2EE Secured)
  ═══════════════════════════════════════════════════════════════════

  This module performs ON-DEVICE computation of:
    1. CIS (Composite Index Score) — Worker safety scoring
    2. PdM (Predictive Maintenance) — Machine health assessment

  Security:
    - DECRYPTS incoming wearable data (AES-256-GCM)
    - Computes CIS/PdM on plaintext locally
    - RE-ENCRYPTS results before pushing back to Firebase
    - Zero plaintext ever touches the network

  Hardware:
    - ESP32-S3 DevKitC-1 (or equivalent)
    - Built-in RGB LED → GPIO 48 (status indicator)
    - Optional: Buzzer → GPIO 17 (audible alarm)

  Firebase Paths Consumed:
    - site/iot/vitals         (ENCRYPTED — from ESP32 wearable)
    - site/machines/CONST-001 (from Python simulation — unencrypted)

  Firebase Paths Written:
    - site/iot/edge_intelligence/  (ENCRYPTED results)
*/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#include <ArduinoJson.h>

// ┌──────────────────────────────────────────────────┐
// │  E2EE SECURITY — AES-256-GCM Encryption Layer   │
// └──────────────────────────────────────────────────┘
#include "../shared/harmony_crypto_config.h"

// ═══════════════════════════════════════════════════
//  USER CONFIGURATION
// ═══════════════════════════════════════════════════

#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

#define FIREBASE_HOST   "harmony-aura-default-rtdb.firebaseio.com"
#define API_KEY         "AIzaSyC3wBL1tKjUm1b8aJ9nSBc26E3lH_F0sYI"
#define DATABASE_SECRET "YOUR_DATABASE_SECRET"

// ═══════════════════════════════════════════════════
//  PIN DEFINITIONS
// ═══════════════════════════════════════════════════

#define LED_PIN         48
#define BUZZER_PIN      17

// ═══════════════════════════════════════════════════
//  FIREBASE OBJECTS
// ═══════════════════════════════════════════════════

FirebaseData fbdoStream1;   // Stream: wearable vitals (encrypted)
FirebaseData fbdoStream2;   // Stream: machine telemetry
FirebaseData fbdoWrite;     // For writing encrypted results

FirebaseAuth auth;
FirebaseConfig firebaseConfig;

// ═══════════════════════════════════════════════════
//  CACHED SENSOR DATA (populated after decryption)
// ═══════════════════════════════════════════════════

// Wearable vitals (decrypted from E2EE stream)
volatile float wearable_hr        = 72.0;
volatile float wearable_temp      = 30.0;
volatile float wearable_humidity  = 55.0;
volatile float wearable_gasLevel  = 0.0;
volatile float wearable_vibration = 0.0;
volatile float wearable_tilt      = 0.0;
volatile bool  wearable_online    = false;
volatile uint32_t wearable_pkt    = 0;  // Last seen packet counter

// Machine telemetry (unencrypted from simulation)
volatile float machine_engineLoad  = 0.0;
volatile float machine_coolantTemp = 30.0;
volatile float machine_stressIndex = 0.0;
volatile float machine_vibration   = 0.0;
volatile float machine_degradation = 0.0;
volatile float machine_rpm         = 0.0;
volatile bool  machine_online      = false;

// Edge-computed results
float edgeCIS           = 0.0;
String edgeCISLevel     = "Safe";
float edgePdmHealth     = 100.0;
String edgePdmStatus    = "Healthy";
float edgeFatigue       = 0.0;
float edgeStress        = 0.0;

// ═══════════════════════════════════════════════════
//  TIMING
// ═══════════════════════════════════════════════════

unsigned long lastCompute   = 0;
unsigned long lastPush      = 0;
const unsigned long COMPUTE_INTERVAL = 1000;
const unsigned long PUSH_INTERVAL    = 1500;

// ═══════════════════════════════════════════════════
//  STREAM CALLBACKS
// ═══════════════════════════════════════════════════

// Called when wearable vitals change — now ENCRYPTED
void wearableStreamCallback(FirebaseStream data) {
  if (data.dataTypeEnum() == firebase_rtdb_data_type_json) {
    FirebaseJson &json = data.jsonData();
    FirebaseJsonData jsonData;

    // ── Extract encrypted envelope ──
    String ivB64 = "", ctB64 = "", atB64 = "";
    int version = 0;

    if (json.get(jsonData, "s/v"))  version = jsonData.to<int>();
    if (json.get(jsonData, "s/iv")) ivB64 = jsonData.to<String>();
    if (json.get(jsonData, "s/ct")) ctB64 = jsonData.to<String>();
    if (json.get(jsonData, "s/at")) atB64 = jsonData.to<String>();

    if (version != HARMONY_CRYPTO_VERSION || ivB64.isEmpty()) {
      Serial.println("[EDGE] Received non-encrypted or unknown-version data, skipping");
      return;
    }

    // ┌──────────────────────────────────────────┐
    // │  DECRYPT wearable data on-device          │
    // └──────────────────────────────────────────┘
    String plaintext = decryptPayload(ivB64, ctB64, atB64);

    if (plaintext.isEmpty()) {
      Serial.println("[EDGE] ⚠ DECRYPTION FAILED — Possible tamper or key mismatch!");
      return;
    }

    Serial.println("[EDGE] ✓ Wearable data decrypted successfully");

    // ── Parse decrypted JSON ──
    StaticJsonDocument<512> doc;
    DeserializationError err = deserializeJson(doc, plaintext);
    if (err) {
      Serial.printf("[EDGE] JSON parse error: %s\n", err.c_str());
      return;
    }

    // ── Replay protection: check packet counter ──
    uint32_t pkt = doc["pkt"] | 0;
    if (pkt <= wearable_pkt && wearable_pkt > 0) {
      Serial.printf("[EDGE] ⚠ REPLAY DETECTED — Pkt#%u <= last seen #%u\n", pkt, wearable_pkt);
      return;
    }
    wearable_pkt = pkt;

    // ── Extract sensor values ──
    wearable_hr        = doc["heart_rate_bpm"] | 72.0f;
    wearable_temp      = doc["body_temp_c"] | 30.0f;
    wearable_humidity  = doc["ambient_humidity_pct"] | 55.0f;
    wearable_gasLevel  = doc["gas_ppm"] | 0.0f;
    wearable_vibration = doc["vibration_g"] | 0.0f;
    wearable_tilt      = doc["tilt_angle_deg"] | 0.0f;

    wearable_online = true;
  }
}

// Called when machine telemetry changes (unencrypted — from simulation)
void machineStreamCallback(FirebaseStream data) {
  if (data.dataTypeEnum() == firebase_rtdb_data_type_json) {
    FirebaseJson &json = data.jsonData();
    FirebaseJsonData jsonData;

    if (json.get(jsonData, "engine_load"))    machine_engineLoad = jsonData.to<float>();
    if (json.get(jsonData, "coolant_temp"))   machine_coolantTemp = jsonData.to<float>();
    if (json.get(jsonData, "stress_index"))   machine_stressIndex = jsonData.to<float>();
    if (json.get(jsonData, "vibration_mm_s")) machine_vibration = jsonData.to<float>();
    if (json.get(jsonData, "degradation"))    machine_degradation = jsonData.to<float>();
    if (json.get(jsonData, "engine_rpm"))     machine_rpm = jsonData.to<float>();

    machine_online = true;
  }
}

void streamTimeoutCallback(bool timeout) {
  if (timeout) Serial.println("[STREAM] Timeout — reconnecting...");
}

// ═══════════════════════════════════════════════════
//  EDGE CIS CALCULATION
// ═══════════════════════════════════════════════════

void computeEdgeCIS() {
  float baseline_hr = 72.0;
  float max_hr = 180.0;
  float hr_elevation = max(0.0f, wearable_hr - baseline_hr);

  float humidity_factor = 1.0 + max(0.0f, (wearable_humidity - 50.0f) / 90.0f);
  edgeFatigue = min(100.0f, (hr_elevation / (max_hr - baseline_hr)) * 100.0f * humidity_factor);
  edgeStress = min(100.0f, (hr_elevation / (max_hr - baseline_hr)) * 100.0f);

  float raw_cis = (0.4f * (edgeFatigue / 100.0f))
                + (0.3f * (edgeStress / 100.0f))
                + (0.3f * (machine_stressIndex / 100.0f));

  edgeCIS = max(0.0f, min(1.0f, raw_cis));

  if (edgeCIS >= 0.75) edgeCISLevel = "Critical";
  else if (edgeCIS >= 0.40) edgeCISLevel = "Warning";
  else edgeCISLevel = "Safe";
}

// ═══════════════════════════════════════════════════
//  EDGE PdM CALCULATION
// ═══════════════════════════════════════════════════

void computeEdgePdM() {
  float health = 100.0;

  if (machine_engineLoad > 80.0) health -= (machine_engineLoad - 80.0) * 1.5;
  if (machine_coolantTemp > 85.0) health -= (machine_coolantTemp - 85.0) * 2.0;
  if (machine_vibration > 6.0) health -= (machine_vibration - 6.0) * 3.0;
  health -= machine_degradation * 500.0;
  if (machine_stressIndex > 60.0) health -= (machine_stressIndex - 60.0) * 0.5;

  edgePdmHealth = max(0.0f, min(100.0f, health));

  if (edgePdmHealth >= 80.0) edgePdmStatus = "Healthy";
  else if (edgePdmHealth >= 50.0) edgePdmStatus = "Degraded";
  else if (edgePdmHealth >= 20.0) edgePdmStatus = "At Risk";
  else edgePdmStatus = "Critical";
}

// ═══════════════════════════════════════════════════
//  LED & ALARM CONTROL
// ═══════════════════════════════════════════════════

void updateAlarms() {
  if (edgeCISLevel == "Critical" || edgePdmStatus == "Critical") {
    digitalWrite(LED_PIN, HIGH);
    if (BUZZER_PIN > 0) tone(BUZZER_PIN, 2000, 200);
  } else if (edgeCISLevel == "Warning" || edgePdmStatus == "At Risk") {
    digitalWrite(LED_PIN, (millis() / 500) % 2 == 0 ? HIGH : LOW);
  } else {
    digitalWrite(LED_PIN, LOW);
    if (BUZZER_PIN > 0) noTone(BUZZER_PIN);
  }
}

// ═══════════════════════════════════════════════════
//  PUSH ENCRYPTED RESULTS TO FIREBASE
// ═══════════════════════════════════════════════════

void pushEdgeResults() {
  if (!Firebase.ready()) return;

  // ┌──────────────────────────────────────────┐
  // │  Step 1: Build plaintext results JSON     │
  // └──────────────────────────────────────────┘
  StaticJsonDocument<512> doc;

  // CIS Results
  doc["cis_score"] = roundf(edgeCIS * 100) / 100;
  doc["cis_risk_level"] = edgeCISLevel;
  doc["fatigue_estimated"] = roundf(edgeFatigue * 10) / 10;
  doc["stress_estimated"] = roundf(edgeStress * 10) / 10;

  // PdM Results
  doc["pdm_health_score"] = roundf(edgePdmHealth * 10) / 10;
  doc["pdm_status"] = edgePdmStatus;

  // Input summary
  doc["input_hr"] = wearable_hr;
  doc["input_machine_stress"] = machine_stressIndex;
  doc["input_machine_load"] = machine_engineLoad;

  // Metadata
  doc["computed_on"] = "ESP32-S3-EDGE-01";
  doc["computation_type"] = "on-device";
  doc["wearable_connected"] = wearable_online;
  doc["machine_feed_active"] = machine_online;
  doc["timestamp"] = (double)millis();

  char plaintext[512];
  serializeJson(doc, plaintext, sizeof(plaintext));

  // ┌──────────────────────────────────────────┐
  // │  Step 2: Encrypt with AES-256-GCM         │
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

    if (Firebase.RTDB.setJSON(&fbdoWrite, "/site/iot/edge_intelligence", &secureJson)) {
      Serial.printf("[EDGE-E2EE] CIS:%.2f (%s) | PdM:%.1f%% (%s) | Encrypted ✓\n",
                    edgeCIS, edgeCISLevel.c_str(), edgePdmHealth, edgePdmStatus.c_str());
    } else {
      Serial.printf("[ERR] Edge push failed: %s\n", fbdoWrite.errorReason().c_str());
    }
  } else {
    Serial.println("[CRYPTO ERR] Edge result encryption failed!");
  }

  // Heartbeat (non-sensitive — unencrypted)
  Firebase.RTDB.setInt(&fbdoWrite, "/site/iot/status/edge_last_seen", (int)(millis() / 1000));
}

// ═══════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n═══════════════════════════════════════");
  Serial.println("  Harmony Aura — ESP32-S3 Edge [E2EE]");
  Serial.println("═══════════════════════════════════════\n");

  pinMode(LED_PIN, OUTPUT);
  if (BUZZER_PIN > 0) pinMode(BUZZER_PIN, OUTPUT);

  // ── WiFi ──
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

  // ── Firebase ──
  firebaseConfig.api_key = API_KEY;
  firebaseConfig.database_url = FIREBASE_HOST;
  firebaseConfig.signer.tokens.legacy_token = DATABASE_SECRET;
  firebaseConfig.token_status_callback = tokenStatusCallback;

  Firebase.begin(&firebaseConfig, &auth);
  Firebase.reconnectNetwork(true);

  // ── Start Firebase Streams ──
  if (!Firebase.RTDB.beginStream(&fbdoStream1, "/site/iot/vitals")) {
    Serial.printf("[ERR] Vitals stream failed: %s\n", fbdoStream1.errorReason().c_str());
  }
  Firebase.RTDB.setStreamCallback(&fbdoStream1, wearableStreamCallback, streamTimeoutCallback);

  if (!Firebase.RTDB.beginStream(&fbdoStream2, "/site/machines/CONST-001")) {
    Serial.printf("[ERR] Machine stream failed: %s\n", fbdoStream2.errorReason().c_str());
  }
  Firebase.RTDB.setStreamCallback(&fbdoStream2, machineStreamCallback, streamTimeoutCallback);

  Serial.println("[FIREBASE] Streams initialized.");
  Serial.println("[CRYPTO] AES-256-GCM decryption + re-encryption ACTIVE.");
  Serial.printf("[CRYPTO] Key fingerprint: %02X%02X...%02X%02X\n",
                HARMONY_AES_KEY[0], HARMONY_AES_KEY[1],
                HARMONY_AES_KEY[30], HARMONY_AES_KEY[31]);
  Serial.println("[READY] Edge computation with E2EE active.\n");
}

// ═══════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════

void loop() {
  unsigned long now = millis();

  if (now - lastCompute >= COMPUTE_INTERVAL) {
    lastCompute = now;
    computeEdgeCIS();
    computeEdgePdM();
    updateAlarms();
  }

  if (now - lastPush >= PUSH_INTERVAL) {
    lastPush = now;
    pushEdgeResults();
  }

  delay(10);
}
