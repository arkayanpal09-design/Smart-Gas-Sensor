/*
 * Arduino Nano + ESP-01 High-Speed HTTP POST Test Sketch
 * 
 * Hardware Setup:
 * - Arduino Nano connected to PC via USB (Serial Monitor at 115200 baud)
 * - ESP-01 connected via SoftwareSerial on Pins 2 & 3 at 9600 baud:
 *     Nano Pin 2 (RX)  <--- ESP-01 TX
 *     Nano Pin 3 (TX)  ---> Voltage Divider (1k / 2k) ---> ESP-01 RX
 *     ESP-01 VCC & CH_PD ---> 3.3V
 *     ESP-01 GND        ---> GND
 * 
 * Target Endpoint:
 *   http://puppet-penknife-embroider.ngrok-free.dev/sensor-data
 */

#include <SoftwareSerial.h>

// SoftwareSerial pins: Pin 2 = Nano RX (from ESP TX), Pin 3 = Nano TX (to ESP RX)
SoftwareSerial espSerial(2, 3);

// Endpoint Configuration
const char* HOST = "puppet-penknife-embroider.ngrok-free.dev";
const int   PORT = 80;
const char* PATH = "/sensor-data";

// Fixed JSON Test Payload
const String JSON_PAYLOAD = "{\"gas\":786,\"accel_x\":-0.12,\"accel_y\":0.00,\"accel_z\":0.98}";

void setup() {
  // PC Serial Monitor at 115200 baud
  Serial.begin(115200);
  delay(1000);
  
  // ESP-01 SoftwareSerial at 9600 baud
  espSerial.begin(9600);
  
  Serial.println(F("\n=================================================="));
  Serial.println(F(" Smart Gas Mask - ESP-01 High-Speed HTTP POST Test"));
  Serial.println(F("=================================================="));

  runFastHttpTest();
}

void loop() {
  // Single execution test - do not loop continuously
}

void runFastHttpTest() {
  // Clear any stale serial buffer data from ESP-01
  while (espSerial.available()) {
    espSerial.read();
  }

  // -------------------------------------------------------------
  // STEP 1: Check Wi-Fi Connection via AT+CIFSR (No password re-entry)
  // -------------------------------------------------------------
  Serial.println(F("\n[1/5] Checking Wi-Fi IP Status (AT+CIFSR)..."));
  espSerial.println(F("AT+CIFSR"));
  
  String cifsrResponse = readEspResponse(2000);
  Serial.print(F("ESP Response:\n"));
  Serial.println(cifsrResponse);

  if (cifsrResponse.indexOf("0.0.0.0") != -1 || cifsrResponse.indexOf("ERROR") != -1 || cifsrResponse.indexOf("STAIP") == -1) {
    Serial.println(F("WARNING: ESP-01 does not appear to have a valid Wi-Fi IP!"));
    Serial.println(F("Ensure ESP-01 is connected to Wi-Fi before running this test."));
  } else {
    Serial.println(F("-> Wi-Fi IP Verified Active."));
  }

  // -------------------------------------------------------------
  // STEP 2: Configure Single Connection Mode (AT+CIPMUX=0)
  // -------------------------------------------------------------
  Serial.println(F("\n[2/5] Setting Single Connection Mode (AT+CIPMUX=0)..."));
  espSerial.println(F("AT+CIPMUX=0"));
  String cipmuxResponse = readEspResponse(1000);
  Serial.println(cipmuxResponse);

  // -------------------------------------------------------------
  // STEP 3: Construct Dynamic HTTP POST Request & Calculate Lengths
  // -------------------------------------------------------------
  int contentLength = JSON_PAYLOAD.length();

  String httpRequest = "";
  httpRequest += "POST ";
  httpRequest += PATH;
  httpRequest += " HTTP/1.1\r\n";
  httpRequest += "Host: ";
  httpRequest += HOST;
  httpRequest += "\r\n";
  httpRequest += "Content-Type: application/json\r\n";
  httpRequest += "Content-Length: ";
  httpRequest += String(contentLength);
  httpRequest += "\r\n";
  httpRequest += "Connection: close\r\n";
  httpRequest += "\r\n";
  httpRequest += JSON_PAYLOAD;

  int totalRequestLength = httpRequest.length();

  Serial.println(F("\n[3/5] Constructed HTTP POST Request:"));
  Serial.println(F("--------------------------------------------------"));
  Serial.print(httpRequest);
  Serial.println(F("--------------------------------------------------"));
  Serial.print(F("Calculated Content-Length : "));
  Serial.println(contentLength);
  Serial.print(F("Calculated Total CIPSEND  : "));
  Serial.println(totalRequestLength);

  // -------------------------------------------------------------
  // STEP 4: Initiate TCP Connection (AT+CIPSTART)
  // -------------------------------------------------------------
  Serial.println(F("\n[4/5] Initiating TCP Connection (AT+CIPSTART)..."));
  
  String cipstartCmd = "AT+CIPSTART=\"TCP\",\"";
  cipstartCmd += HOST;
  cipstartCmd += "\",";
  cipstartCmd += String(PORT);

  Serial.print(F("Sending: "));
  Serial.println(cipstartCmd);
  
  espSerial.println(cipstartCmd);

  // -------------------------------------------------------------
  // ZERO-DELAY HIGH SPEED SEQUENCE:
  // Detect CONNECT/OK immediately and send AT+CIPSEND without delay!
  // -------------------------------------------------------------
  bool connected = false;
  bool connectionClosed = false;
  unsigned long startConnectWait = millis();
  String connectBuffer = "";

  while (millis() - startConnectWait < 5000) {
    while (espSerial.available()) {
      char c = espSerial.read();
      connectBuffer += c;
      Serial.write(c); // Live debug echo to PC Serial Monitor

      if (connectBuffer.indexOf("CONNECT") != -1 || connectBuffer.indexOf("OK") != -1 || connectBuffer.indexOf("ALREADY CONNECTED") != -1) {
        connected = true;
        break;
      }
      if (connectBuffer.indexOf("CLOSED") != -1 || connectBuffer.indexOf("ERROR") != -1) {
        connectionClosed = true;
        break;
      }
    }
    if (connected || connectionClosed) break;
  }

  if (connectionClosed || !connected) {
    Serial.println(F("\n\n❌ ERROR: TCP Connection failed or closed by server before CIPSEND!"));
    Serial.println(F("Aborting test sequence."));
    return;
  }

  Serial.println(F("\n-> TCP CONNECTED successfully! Sending AT+CIPSEND immediately..."));

  // -------------------------------------------------------------
  // STEP 5: Immediate AT+CIPSEND Execution
  // -------------------------------------------------------------
  String cipsendCmd = "AT+CIPSEND=" + String(totalRequestLength);
  Serial.print(F("Sending: "));
  Serial.println(cipsendCmd);
  
  espSerial.println(cipsendCmd);

  // Wait specifically for '>' prompt from ESP-01
  bool promptReceived = false;
  unsigned long startPromptWait = millis();
  String sendBuffer = "";

  while (millis() - startPromptWait < 3000) {
    while (espSerial.available()) {
      char c = espSerial.read();
      sendBuffer += c;
      Serial.write(c); // Live debug echo

      if (c == '>' || sendBuffer.indexOf(">") != -1) {
        promptReceived = true;
        break;
      }
      if (sendBuffer.indexOf("CLOSED") != -1 || sendBuffer.indexOf("ERROR") != -1) {
        break;
      }
    }
    if (promptReceived) break;
  }

  if (!promptReceived) {
    Serial.println(F("\n\n❌ ERROR: Did NOT receive '>' prompt from ESP-01!"));
    Serial.println(F("Aborting HTTP transmission."));
    return;
  }

  Serial.println(F("\n-> '>' Prompt Received! Transmitting full HTTP Request immediately..."));

  // -------------------------------------------------------------
  // STEP 6: Transmit Complete HTTP Request
  // -------------------------------------------------------------
  espSerial.print(httpRequest);

  Serial.println(F("\n[5/5] HTTP Request Transmitted. Listening for Server Response..."));
  Serial.println(F("--------------------------------------------------"));

  // Listen for Server Response (+IPD, SEND OK, CLOSED)
  unsigned long startResponseWait = millis();

  while (millis() - startResponseWait < 8000) {
    while (espSerial.available()) {
      char c = espSerial.read();
      Serial.write(c); // Echo response directly to PC Serial Monitor
    }
  }

  Serial.println(F("\n--------------------------------------------------"));
  Serial.println(F("Test Execution Complete."));
  Serial.println(F("Check above output for +IPD response and verify on Vercel:"));
  Serial.println(F("https://smart-gas-sensor.vercel.app/api/sensor-data/latest"));
}

// Helper function to read ESP responses with timeout
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
