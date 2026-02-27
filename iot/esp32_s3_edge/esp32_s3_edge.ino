/*
  ═══════════════════════════════════════════════════════════════════
  Harmony Aura — ESP32-S3 Edge Intelligence Unit
  ═══════════════════════════════════════════════════════════════════

  This module performs ON-DEVICE computation of:
    1. CIS (Composite Index Score) — Worker safety scoring
    2. PdM (Predictive Maintenance) — Machine health assessment

  It reads data from Firebase RTDB (pushed by the Python simulation
  and the ESP32 wearable), computes CIS/PdM locally on the S3 chip,
  and pushes the results BACK to Firebase under site/iot/edge_intelligence/.

  This demonstrates EDGE COMPUTING: safety-critical logic runs on
  the microcontroller, NOT in the cloud or on a laptop.

  Hardware:
    - ESP32-S3 DevKitC-1 (or equivalent)
    - Built-in RGB LED → GPIO 48 (status indicator)
    - Optional: Buzzer → GPIO 17 (audible alarm)

  Libraries Required:
    - Firebase ESP Client (by mobizt)
    - ArduinoJson

  Firebase Paths Consumed:
    - site/iot/vitals         (from ESP32 wearable)
    - site/machines/CONST-001 (from Python simulation — any machine)

  Firebase Paths Written:
    - site/iot/edge_intelligence/
*/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>

#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

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

#define LED_PIN         48    // Built-in RGB or external LED
#define BUZZER_PIN      17    // Optional buzzer for audible alert

// ═══════════════════════════════════════════════════
//  FIREBASE OBJECTS
// ═══════════════════════════════════════════════════

FirebaseData fbdoStream1;   // Stream: wearable vitals
FirebaseData fbdoStream2;   // Stream: machine telemetry
FirebaseData fbdoWrite;     // For writing results

FirebaseAuth auth;
FirebaseConfig firebaseConfig;

// ═══════════════════════════════════════════════════
//  CACHED SENSOR DATA (populated by Firebase streams)
// ═══════════════════════════════════════════════════

// Wearable vitals
volatile float wearable_hr        = 72.0;
volatile float wearable_temp      = 30.0;
volatile float wearable_humidity  = 55.0;
volatile float wearable_gasLevel  = 0.0;
volatile float wearable_vibration = 0.0;
volatile float wearable_tilt      = 0.0;
volatile bool  wearable_online    = false;

// Machine telemetry
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
float edgeFatigue       = 0.0;   // Estimated from HR
float edgeStress        = 0.0;   // Estimated from HR

// ═══════════════════════════════════════════════════
//  TIMING
// ═══════════════════════════════════════════════════

unsigned long lastCompute   = 0;
unsigned long lastPush      = 0;
const unsigned long COMPUTE_INTERVAL = 1000;  // Compute CIS every 1s
const unsigned long PUSH_INTERVAL    = 1500;  // Push results every 1.5s

// ═══════════════════════════════════════════════════
//  STREAM CALLBACKS
// ═══════════════════════════════════════════════════

// Called when wearable vitals change in Firebase
void wearableStreamCallback(FirebaseStream data) {
  if (data.dataTypeEnum() == firebase_rtdb_data_type_json) {
    FirebaseJson &json = data.jsonData();
    FirebaseJsonData jsonData;

    if (json.get(jsonData, "heart_rate_bpm"))  wearable_hr = jsonData.to<float>();
    if (json.get(jsonData, "body_temp_c"))     wearable_temp = jsonData.to<float>();
    if (json.get(jsonData, "ambient_humidity_pct")) wearable_humidity = jsonData.to<float>();
    if (json.get(jsonData, "gas_ppm"))         wearable_gasLevel = jsonData.to<float>();
    if (json.get(jsonData, "vibration_g"))     wearable_vibration = jsonData.to<float>();
    if (json.get(jsonData, "tilt_angle_deg"))  wearable_tilt = jsonData.to<float>();

    wearable_online = true;
  }
}

// Called when machine telemetry changes
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
  if (timeout) {
    Serial.println("[STREAM] Timeout — reconnecting...");
  }
}

// ═══════════════════════════════════════════════════
//  EDGE CIS CALCULATION
//  Ported from backend/models.py Worker.update()
// ═══════════════════════════════════════════════════

void computeEdgeCIS() {
  // ── Step 1: Estimate Fatigue from HR ──
  // In the real simulation, fatigue accumulates over time.
  // On the edge, we estimate it from HR elevation and humidity.
  float baseline_hr = 72.0;
  float max_hr = 180.0;
  float hr_elevation = max(0.0f, wearable_hr - baseline_hr);

  // Humidity multiplier (ported from SiteEnvironment.fatigue_multiplier)
  float humidity_factor = 1.0 + max(0.0f, (wearable_humidity - 50.0f) / 90.0f);

  // Fatigue estimation: HR elevation * humidity coupling
  edgeFatigue = min(100.0f, (hr_elevation / (max_hr - baseline_hr)) * 100.0f * humidity_factor);

  // ── Step 2: Estimate Stress from HR ──
  // Ported from Worker.update(): stress = (hr_elevation / hr_range) * 100
  edgeStress = min(100.0f, (hr_elevation / (max_hr - baseline_hr)) * 100.0f);

  // ── Step 3: CIS Score (exact formula from simulation.py) ──
  // CIS = 0.4 * (Fatigue/100) + 0.3 * (Stress/100) + 0.3 * (MachineStress/100)
  float raw_cis = (0.4f * (edgeFatigue / 100.0f))
                + (0.3f * (edgeStress / 100.0f))
                + (0.3f * (machine_stressIndex / 100.0f));

  edgeCIS = max(0.0f, min(1.0f, raw_cis));

  // ── Step 4: Risk Level Classification ──
  if (edgeCIS >= 0.75) {
    edgeCISLevel = "Critical";
  } else if (edgeCIS >= 0.40) {
    edgeCISLevel = "Warning";
  } else {
    edgeCISLevel = "Safe";
  }
}

// ═══════════════════════════════════════════════════
//  EDGE PdM (Predictive Maintenance) CALCULATION
//  Simplified threshold-based approach for MCU
// ═══════════════════════════════════════════════════

void computeEdgePdM() {
  // Machine health score: 100 = perfect, 0 = imminent failure
  float health = 100.0;

  // Penalty for high engine load (>80% is stressful)
  if (machine_engineLoad > 80.0) {
    health -= (machine_engineLoad - 80.0) * 1.5;
  }

  // Penalty for high coolant temperature (>85°C is concerning)
  if (machine_coolantTemp > 85.0) {
    health -= (machine_coolantTemp - 85.0) * 2.0;
  }

  // Penalty for high vibration (>6 mm/s indicates wear)
  if (machine_vibration > 6.0) {
    health -= (machine_vibration - 6.0) * 3.0;
  }

  // Penalty for accumulated degradation
  health -= machine_degradation * 500.0;

  // Penalty for high stress index
  if (machine_stressIndex > 60.0) {
    health -= (machine_stressIndex - 60.0) * 0.5;
  }

  edgePdmHealth = max(0.0f, min(100.0f, health));

  // Status classification
  if (edgePdmHealth >= 80.0) {
    edgePdmStatus = "Healthy";
  } else if (edgePdmHealth >= 50.0) {
    edgePdmStatus = "Degraded";
  } else if (edgePdmHealth >= 20.0) {
    edgePdmStatus = "At Risk";
  } else {
    edgePdmStatus = "Critical";
  }
}

// ═══════════════════════════════════════════════════
//  LED & ALARM CONTROL
// ═══════════════════════════════════════════════════

void updateAlarms() {
  if (edgeCISLevel == "Critical" || edgePdmStatus == "Critical") {
    digitalWrite(LED_PIN, HIGH);
    if (BUZZER_PIN > 0) tone(BUZZER_PIN, 2000, 200); // Short beep
  } else if (edgeCISLevel == "Warning" || edgePdmStatus == "At Risk") {
    // Slow blink
    digitalWrite(LED_PIN, (millis() / 500) % 2 == 0 ? HIGH : LOW);
  } else {
    digitalWrite(LED_PIN, LOW);
    if (BUZZER_PIN > 0) noTone(BUZZER_PIN);
  }
}

// ═══════════════════════════════════════════════════
//  PUSH RESULTS TO FIREBASE
// ═══════════════════════════════════════════════════

void pushEdgeResults() {
  if (!Firebase.ready()) return;

  FirebaseJson json;

  // CIS Results
  json.set("cis_score", roundf(edgeCIS * 100) / 100);
  json.set("cis_risk_level", edgeCISLevel);
  json.set("fatigue_estimated", roundf(edgeFatigue * 10) / 10);
  json.set("stress_estimated", roundf(edgeStress * 10) / 10);

  // PdM Results
  json.set("pdm_health_score", roundf(edgePdmHealth * 10) / 10);
  json.set("pdm_status", edgePdmStatus);

  // Input summary (what the edge used to calculate)
  json.set("input_hr", wearable_hr);
  json.set("input_machine_stress", machine_stressIndex);
  json.set("input_machine_load", machine_engineLoad);

  // Metadata
  json.set("computed_on", "ESP32-S3-EDGE-01");
  json.set("computation_type", "on-device");
  json.set("wearable_connected", wearable_online);
  json.set("machine_feed_active", machine_online);
  json.set("timestamp", (double)millis());

  if (Firebase.RTDB.setJSON(&fbdoWrite, "/site/iot/edge_intelligence", &json)) {
    Serial.printf("[EDGE] CIS:%.2f (%s) | PdM:%.1f%% (%s)\n",
                  edgeCIS, edgeCISLevel.c_str(), edgePdmHealth, edgePdmStatus.c_str());
  } else {
    Serial.printf("[ERR] Edge push failed: %s\n", fbdoWrite.errorReason().c_str());
  }

  // Also push heartbeat
  Firebase.RTDB.setInt(&fbdoWrite, "/site/iot/status/edge_last_seen", (int)(millis() / 1000));
}

// ═══════════════════════════════════════════════════
//  SETUP
// ═══════════════════════════════════════════════════

void setup() {
  Serial.begin(115200);
  Serial.println("\n═══════════════════════════════════════");
  Serial.println("  Harmony Aura — ESP32-S3 Edge Brain");
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
  // Stream 1: Listen to wearable vitals
  if (!Firebase.RTDB.beginStream(&fbdoStream1, "/site/iot/vitals")) {
    Serial.printf("[ERR] Vitals stream failed: %s\n", fbdoStream1.errorReason().c_str());
  }
  Firebase.RTDB.setStreamCallback(&fbdoStream1, wearableStreamCallback, streamTimeoutCallback);

  // Stream 2: Listen to machine CONST-001 telemetry
  if (!Firebase.RTDB.beginStream(&fbdoStream2, "/site/machines/CONST-001")) {
    Serial.printf("[ERR] Machine stream failed: %s\n", fbdoStream2.errorReason().c_str());
  }
  Firebase.RTDB.setStreamCallback(&fbdoStream2, machineStreamCallback, streamTimeoutCallback);

  Serial.println("[FIREBASE] Streams initialized.");
  Serial.println("[READY] Edge computation active.\n");
}

// ═══════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════

void loop() {
  unsigned long now = millis();

  // Compute CIS + PdM at regular intervals
  if (now - lastCompute >= COMPUTE_INTERVAL) {
    lastCompute = now;
    computeEdgeCIS();
    computeEdgePdM();
    updateAlarms();
  }

  // Push results to Firebase
  if (now - lastPush >= PUSH_INTERVAL) {
    lastPush = now;
    pushEdgeResults();
  }

  delay(10);
}
