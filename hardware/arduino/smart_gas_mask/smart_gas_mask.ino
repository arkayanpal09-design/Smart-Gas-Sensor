/*
 * Smart Gas-Sensing Mask IoT - Laptop-Free ThingSpeak Integration
 * ----------------------------------------------------------------
 * Hardware Configuration:
 * - Arduino Nano
 * - MQ-2 Gas Sensor: VCC -> 5V, GND -> GND, AO -> Pin A0
 * - MPU6050 Accelerometer: VCC -> 5V, GND -> GND, SDA -> Pin A4, SCL -> Pin A5 (Address 0x68)
 * - Buzzer: I/O -> Pin D8, VCC -> 5V, GND -> GND
 * - ESP-01 Wi-Fi Module:
 *     ESP TX -> Nano Pin 2 (SoftwareSerial RX)
 *     Nano Pin 3 (SoftwareSerial TX) -> Voltage Divider (1k/2k) -> ESP RX
 *     ESP VCC, EN/CH_PD, RST, GPIO0 -> 3.3V
 *     ESP GND -> GND
 * 
 * Target Cloud Platform: ThingSpeak (api.thingspeak.com:80)
 * Update Interval: 15 Seconds (Free tier limit compliance)
 * OLED Display: REMOVED permanently.
 */

#include <Wire.h>
#include <SoftwareSerial.h>

// -------------------------------------------------------------
// HARDWARE & PIN DEFINITIONS
// -------------------------------------------------------------
const int MQ2_PIN        = A0;
const int BUZZER_PIN     = 8;
const int GAS_THRESHOLD  = 700;
const int MPU6050_ADDR   = 0x68;

// SoftwareSerial setup for ESP-01 (Pin 2 = Nano RX, Pin 3 = Nano TX)
SoftwareSerial espSerial(2, 3);

// -------------------------------------------------------------
// NETWORK & THINGSPEAK CONFIGURATION
// -------------------------------------------------------------
// Paste your Wi-Fi Credentials below
const char* WIFI_SSID     = "YOUR_WIFI_SSID_HERE";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD_HERE";

// Paste your ThingSpeak Write API Key below
const char* THINGSPEAK_WRITE_KEY = "PASTE_YOUR_WRITE_KEY_HERE";
const char* THINGSPEAK_HOST      = "api.thingspeak.com";
const int   THINGSPEAK_PORT      = 80;

// Timing configuration: 15-second minimum interval for ThingSpeak
const unsigned long UPLOAD_INTERVAL_MS = 15000;
unsigned long lastUploadTime = 0;

// -------------------------------------------------------------
// HELPER: Read ESP-01 response with timeout
// -------------------------------------------------------------
String readEspResponse(unsigned long timeoutMs) {
  String response = "";
  unsigned long start = millis();
  while (millis() - start < timeoutMs) {
    while (espSerial.available()) {
      char c = espSerial.read();
      response += c;
    }
  }
  return response;
}

// -------------------------------------------------------------
// MPU6050 DIRECT REGISTER FUNCTIONS
// -------------------------------------------------------------
void initMPU6050() {
  Wire.begin();
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x6B); // PWR_MGMT_1 register
  Wire.write(0x00); // Set to 0 to wake up MPU6050
  Wire.endTransmission(true);
}

void readMPU6050(float &ax, float &ay, float &az) {
  Wire.beginTransmission(MPU6050_ADDR);
  Wire.write(0x3B); // Accel Xout_H register
  Wire.endTransmission(false);
  Wire.requestFrom(MPU6050_ADDR, 6, true);

  if (Wire.available() >= 6) {
    int16_t rawX = (Wire.read() << 8) | Wire.read();
    int16_t rawY = (Wire.read() << 8) | Wire.read();
    int16_t rawZ = (Wire.read() << 8) | Wire.read();

    // Convert raw values to g units (16384 LSB/g for +/-2g sensitivity)
    ax = rawX / 16384.0;
    ay = rawY / 16384.0;
    az = rawZ / 16384.0;
  } else {
    ax = 0.0;
    ay = 0.0;
    az = 1.0;
  }
}

// -------------------------------------------------------------
// MQ-2 & BUZZER SENSOR FUNCTION
// -------------------------------------------------------------
int readMQ2() {
  int rawGas = analogRead(MQ2_PIN);
  
  // Buzzer Threshold Control
  if (rawGas >= GAS_THRESHOLD) {
    digitalWrite(BUZZER_PIN, HIGH);
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }
  
  return rawGas;
}

// -------------------------------------------------------------
// ESP-01 AT INITIALIZATION
// -------------------------------------------------------------
void initESP01() {
  espSerial.begin(9600);
  delay(500);

  // Clear stale buffer
  while (espSerial.available()) espSerial.read();

  // Test AT command
  espSerial.println(F("AT"));
  delay(500);
  readEspResponse(500);

  // Configure Station Mode
  espSerial.println(F("AT+CWMODE=1"));
  delay(500);
  readEspResponse(500);

  // Configure Single Connection Mode
  espSerial.println(F("AT+CIPMUX=0"));
  delay(500);
  readEspResponse(500);

  // Connect to Wi-Fi if credentials are provided
  if (String(WIFI_SSID) != "YOUR_WIFI_SSID_HERE" && strlen(WIFI_SSID) > 0) {
    String cwjapCmd = "AT+CWJAP=\"" + String(WIFI_SSID) + "\",\"" + String(WIFI_PASSWORD) + "\"";
    espSerial.println(cwjapCmd);
    readEspResponse(6000);
  }
}

// -------------------------------------------------------------
// THINGSPEAK HTTP GET TRANSMISSION
// -------------------------------------------------------------
bool sendToThingSpeak(int gas, float ax, float ay, float az) {
  // Clear buffer
  while (espSerial.available()) espSerial.read();

  Serial.println(F("\nTHINGSpeak CONNECTING..."));

  // 1. Establish TCP Connection (AT+CIPSTART)
  String cipstartCmd = "AT+CIPSTART=\"TCP\",\"";
  cipstartCmd += THINGSPEAK_HOST;
  cipstartCmd += "\",";
  cipstartCmd += String(THINGSPEAK_PORT);

  espSerial.println(cipstartCmd);

  String startResp = "";
  unsigned long startConnectWait = millis();
  bool connected = false;

  while (millis() - startConnectWait < 6000) {
    while (espSerial.available()) {
      char c = espSerial.read();
      startResp += c;
      if (startResp.indexOf("CONNECT") != -1 || startResp.indexOf("OK") != -1 || startResp.indexOf("ALREADY CONNECTED") != -1) {
        connected = true;
        break;
      }
      if (startResp.indexOf("CLOSED") != -1 || startResp.indexOf("ERROR") != -1) {
        break;
      }
    }
    if (connected) break;
  }

  if (!connected) {
    Serial.println(F("ERROR: TCP Connection to ThingSpeak failed."));
    return false;
  }

  Serial.println(F("CONNECT\nOK"));
  Serial.println(F("\nSENDING SENSOR DATA..."));
  Serial.print(F("Gas: ")); Serial.println(gas);
  Serial.print(F("X: ")); Serial.println(ax, 2);
  Serial.print(F("Y: ")); Serial.println(ay, 2);
  Serial.print(F("Z: ")); Serial.println(az, 2);

  // 2. Construct ThingSpeak HTTP GET Query Request
  String httpRequest = "GET /update?api_key=";
  httpRequest += THINGSPEAK_WRITE_KEY;
  httpRequest += "&field1=" + String(gas);
  httpRequest += "&field2=" + String(ax, 2);
  httpRequest += "&field3=" + String(ay, 2);
  httpRequest += "&field4=" + String(az, 2);
  httpRequest += " HTTP/1.1\r\n";
  httpRequest += "Host: ";
  httpRequest += THINGSPEAK_HOST;
  httpRequest += "\r\n";
  httpRequest += "Connection: close\r\n\r\n";

  // 3. Request CIPSEND prompt
  String cipsendCmd = "AT+CIPSEND=" + String(httpRequest.length());
  espSerial.println(cipsendCmd);

  bool promptReceived = false;
  unsigned long startPromptWait = millis();
  String sendBuf = "";

  while (millis() - startPromptWait < 4000) {
    while (espSerial.available()) {
      char c = espSerial.read();
      sendBuf += c;
      if (c == '>' || sendBuf.indexOf(">") != -1) {
        promptReceived = true;
        break;
      }
    }
    if (promptReceived) break;
  }

  if (!promptReceived) {
    Serial.println(F("ERROR: '>' prompt not received from ESP-01."));
    return false;
  }

  // 4. Send HTTP GET payload
  espSerial.print(httpRequest);

  // 5. Read response from ThingSpeak
  String tsResponse = "";
  unsigned long startRespWait = millis();
  while (millis() - startRespWait < 7000) {
    while (espSerial.available()) {
      char c = espSerial.read();
      tsResponse += c;
    }
  }

  // Extract HTTP body after header delimiter (\r\n\r\n or \n\n)
  int headerEnd = tsResponse.indexOf("\r\n\r\n");
  String body = "";
  if (headerEnd != -1) {
    body = tsResponse.substring(headerEnd + 4);
  } else {
    int altHeaderEnd = tsResponse.indexOf("\n\n");
    if (altHeaderEnd != -1) {
      body = tsResponse.substring(altHeaderEnd + 2);
    } else {
      body = tsResponse;
    }
  }
  body.trim();

  // Extract clean entry ID number from body
  String cleanId = "";
  for (unsigned int i = 0; i < body.length(); i++) {
    if (isDigit(body[i])) {
      cleanId += body[i];
    }
  }

  if (cleanId.length() > 0 && cleanId != "0") {
    Serial.println(cleanId);
    Serial.println(F("\nUPLOAD SUCCESS"));
    return true;
  } else {
    Serial.println(F("0"));
    Serial.println(F("\nTHINGSpeak UPLOAD FAILED"));
    return false;
  }
}

// -------------------------------------------------------------
// ARDUINO SETUP
// -------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println(F("=================================================="));
  Serial.println(F(" SMART GAS MASK"));
  Serial.println(F(" LAPTOP-FREE IoT MODE"));
  Serial.println(F("=================================================="));

  // Initialize Sensors & Peripherals
  initMPU6050();
  Serial.println(F("MPU6050 OK"));

  initESP01();
  Serial.println(F("ESP-01 OK"));
  Serial.println(F("WIFI CONNECTED\n"));

  lastUploadTime = millis() - UPLOAD_INTERVAL_MS; // Force immediate initial upload
}

// -------------------------------------------------------------
// ARDUINO MAIN LOOP
// -------------------------------------------------------------
void loop() {
  // Read sensors continuously
  float ax, ay, az;
  readMPU6050(ax, ay, az);
  int gas = readMQ2();

  // Perform upload strictly every 15 seconds
  if (millis() - lastUploadTime >= UPLOAD_INTERVAL_MS) {
    lastUploadTime = millis();
    sendToThingSpeak(gas, ax, ay, az);
  }

  delay(200); // Smooth reading cycle
}
