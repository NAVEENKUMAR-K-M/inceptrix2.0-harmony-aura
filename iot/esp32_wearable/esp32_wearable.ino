#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#include <DHT.h>
#include <Wire.h>
#include <MPU6050_light.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <U8g2lib.h>

#include "../shared/harmony_crypto_config.h"

/**************** WIFI ****************/
#define WIFI_SSID       "Naveen"
#define WIFI_PASSWORD   "Pikachu!"

#define FIREBASE_HOST   "harmony-aura-default-rtdb.firebaseio.com"
#define API_KEY         "AIzaSyC3wBL1tKjUm1b8aJ9nSBc26E3lH_F0sYI"
#define DATABASE_SECRET "YOUR_DATABASE_SECRET"

/**************** PINS ****************/
#define DHT_PIN         4
#define DHT_TYPE        DHT22
#define PULSE_PIN       34
#define GAS_PIN         35
#define VIBRATION_PIN   27

#define OLED_MOSI       23
#define OLED_CLK        18
#define OLED_DC         16
#define OLED_CS         5
#define OLED_RESET      17

/**************** OLED ****************/
U8G2_SH1106_128X64_NONAME_F_4W_HW_SPI u8g2(
  U8G2_R0,
  OLED_CS,
  OLED_DC,
  OLED_RESET
);

/**************** OBJECTS ****************/
DHT dht(DHT_PIN, DHT_TYPE);
MPU6050 mpu(Wire);

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

/**************** VARIABLES ****************/
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 1000;
unsigned long lastHeartbeat = 0;
const unsigned long HEARTBEAT_INTERVAL = 5000;
unsigned long lastDisplayUpdate = 0;
const unsigned long DISPLAY_INTERVAL = 200;

unsigned long lastBeatTime = 0;
int currentBPM = 72;
bool beatDetected = false;
int beatThreshold = 2048;

float dispTemp = 0;
float dispHum = 0;
float dispPitch = 0;
float dispRoll = 0;
float dispTilt = 0;
int dispGasRaw = 0;
int dispVibRaw = 0;

uint8_t sparklineBPM[64];
uint8_t sparklineIndex = 0;
unsigned long lastSparklineUpdate = 0;

uint32_t packetCounter = 0;

/************************************************************/
void setup() {

  Serial.begin(115200);
  Serial.println("\n═══════════════════════════════════════");
  Serial.println("  Harmony Aura — ESP32 Wearable [E2EE]");
  Serial.println("═══════════════════════════════════════\n");

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

  SPI.begin(OLED_CLK, -1, OLED_MOSI, OLED_CS);
  u8g2.begin();
  u8g2.setContrast(255);

  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(20, 20, "HARMONY AURA OS");
  u8g2.drawStr(30, 35, "BOOTING SYSTEM...");
  u8g2.sendBuffer();
  delay(1000);

  analogReadResolution(12);

  Serial.printf("[WIFI] Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.printf("\n[WIFI] Connected! IP: %s\n",
                WiFi.localIP().toString().c_str());

  config.api_key = API_KEY;
  config.database_url = FIREBASE_HOST;
  config.signer.tokens.legacy_token = DATABASE_SECRET;
  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectNetwork(true);

  Serial.println("[FIREBASE] Initialized.");
  Serial.println("[CRYPTO] AES-256-GCM encryption ACTIVE.");
  Serial.println("[READY] Starting encrypted telemetry loop...\n");
}

/************************************************************/
void loop() {

  unsigned long now = millis();
  int pulseRaw = analogRead(PULSE_PIN);

  if (pulseRaw > beatThreshold && !beatDetected) {
    beatDetected = true;
    unsigned long beatInterval = now - lastBeatTime;
    lastBeatTime = now;

    if (beatInterval > 300 && beatInterval < 2000) {
      int bpm = 60000 / beatInterval;
      currentBPM = currentBPM * 0.7 + bpm * 0.3;
      currentBPM = constrain(currentBPM, 40, 200);
    }
  }

  if (pulseRaw < beatThreshold - 200)
    beatDetected = false;

  if (now - lastSendTime >= SEND_INTERVAL) {

    lastSendTime = now;

    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();

    mpu.update();

    int gasRaw = analogRead(GAS_PIN);
    int vibrationRaw = analogRead(VIBRATION_PIN);

    if (isnan(temperature)) temperature = -1;
    if (isnan(humidity)) humidity = -1;

    dispTemp = temperature;
    dispHum = humidity;
    dispPitch = mpu.getAngleY();
    dispRoll = mpu.getAngleX();
    dispTilt = max(abs(dispPitch), abs(dispRoll));
    dispGasRaw = gasRaw;
    dispVibRaw = vibrationRaw;

    StaticJsonDocument<512> doc;
    doc["heart_rate_bpm"] = currentBPM;
    doc["body_temp_c"] = temperature;
    doc["ambient_humidity_pct"] = humidity;
    doc["pkt"] = packetCounter++;

    char plaintext[512];
    serializeJson(doc, plaintext);

    EncryptedPayload encrypted;

    if (encryptPayload(plaintext, encrypted)) {

      FirebaseJson secureJson;
      secureJson.set("s/v", HARMONY_CRYPTO_VERSION);
      secureJson.set("s/iv", encrypted.iv);
      secureJson.set("s/ct", encrypted.ct);
      secureJson.set("s/at", encrypted.at);

      if (Firebase.ready()) {
        if (Firebase.RTDB.setJSON(&fbdo,
                                  "/site/iot/vitals",
                                  &secureJson)) {

          Serial.printf("[TX-E2EE] Pkt#%u | HR:%d | T:%.1f°C | Encrypted ✓\n",
                        packetCounter - 1,
                        currentBPM,
                        temperature);
        }
      }
    }
  }

  if (now - lastDisplayUpdate >= DISPLAY_INTERVAL) {
    lastDisplayUpdate = now;
    updateOLED();
  }

  if (now - lastSparklineUpdate >= 250) {
    lastSparklineUpdate = now;
    int traceVal = map(currentBPM, 40, 180, 1, 28);
    traceVal = constrain(traceVal, 1, 28);
    sparklineBPM[sparklineIndex] = traceVal;
    sparklineIndex = (sparklineIndex + 1) % 64;
  }

  delay(10);
}

/************************************************************/
void updateOLED() {

  u8g2.clearBuffer();

  // Header Bar
  u8g2.drawBox(0, 0, 128, 12);
  u8g2.setDrawColor(0);
  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.drawStr(2, 9, "AURA [SECURED]");
  u8g2.setDrawColor(1);

  if (WiFi.status() == WL_CONNECTED)
    u8g2.drawStr(100, 9, "WIFI");

  // Divider
  u8g2.drawVLine(64, 12, 52);

  // BPM
  u8g2.setFont(u8g2_font_logisoso18_tr);
  char bpmStr[6];
  sprintf(bpmStr, "%d", currentBPM);
  u8g2.drawStr(5, 35, bpmStr);

  // Sparkline
  int startX = 1;
  int startY = 62;
  for (int i = 0; i < 62; i++) {
    int idx = (sparklineIndex + i) % 64;
    int nextIdx = (sparklineIndex + i + 1) % 64;
    u8g2.drawLine(startX + i,
                  startY - sparklineBPM[idx],
                  startX + i + 1,
                  startY - sparklineBPM[nextIdx]);
  }

  u8g2.setFont(u8g2_font_6x12_tf);

  char buf[16];

  sprintf(buf, "T:%dC", (int)dispTemp);
  u8g2.drawStr(68, 20, buf);

  sprintf(buf, "H:%d%%", (int)dispHum);
  u8g2.drawStr(98, 20, buf);

  sprintf(buf, "G:%d%%", map(dispGasRaw, 0, 4095, 0, 100));
  u8g2.drawStr(68, 32, buf);

  sprintf(buf, "V:%d%%", map(dispVibRaw, 0, 4095, 0, 100));
  u8g2.drawStr(98, 32, buf);

  sprintf(buf, "P:%d", (int)dispPitch);
  u8g2.drawStr(68, 44, buf);

  sprintf(buf, "R:%d", (int)dispRoll);
  u8g2.drawStr(98, 44, buf);

  sprintf(buf, "A:%d", (int)dispTilt);
  u8g2.drawStr(68, 58, buf);

  u8g2.sendBuffer();
}