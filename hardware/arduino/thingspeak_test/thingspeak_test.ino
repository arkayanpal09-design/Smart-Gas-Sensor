/*
 * Arduino Nano + ESP-01 Standalone ThingSpeak Connection Test Sketch
 * ------------------------------------------------------------------
 * Purpose: Verify Arduino Nano -> ESP-01 -> Wi-Fi -> ThingSpeak pipeline.
 * Hardware Setup:
 * - Nano Pin 2 (RX) <--- ESP-01 TX
 * - Nano Pin 3 (TX) ---> Voltage Divider (1k / 2k) ---> ESP-01 RX
 * - ESP-01 VCC & EN/CH_PD, RST, GPIO0 ---> 3.3V
 * - ESP-01 GND & Nano GND ---> Common GND
 * 
 * ESP-01 Baud Rate: 9600 baud
 * PC Serial Monitor: 115200 baud
 */

#include <SoftwareSerial.h>

// SoftwareSerial setup: Pin 2 = Nano RX, Pin 3 = Nano TX
SoftwareSerial espSerial(2, 3);

// -------------------------------------------------------------
// CONFIGURATION CONSTANTS
// -------------------------------------------------------------
const char* WIFI_SSID         = "Arkayan's S26";
const char* WIFI_PASSWORD     = "apal1234";

const char* THINGSPEAK_WRITE_KEY = "PASTE_WRITE_API_KEY_HERE";
const char* THINGSPEAK_HOST      = "api.thingspeak.com";
const int   THINGSPEAK_PORT      = 80;

// Helper to read ESP-01 serial response with timeout
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

void setup() {
  // PC Serial Monitor at 115200 baud
  Serial.begin(115200);
  delay(1000);

  // ESP-01 SoftwareSerial at 9600 baud
  espSerial.begin(9600);
  delay(500);

  Serial.println(F("=============================="));
  Serial.println(F("THINGSPEAK TEST"));
  Serial.println(F("===============\n"));

  runThingSpeakTest();
}

void loop() {
  // Single execution test - do not loop
}

void runThingSpeakTest() {
  // Clear any stale serial buffer data
  while (espSerial.available()) espSerial.read();

  // -------------------------------------------------------------
  // STEP 1: Basic AT & Station Mode Setup
  // -------------------------------------------------------------
  espSerial.println(F("AT"));
  readEspResponse(500);

  espSerial.println(F("AT+CWMODE=1"));
  readEspResponse(500);

  espSerial.println(F("AT+CIPMUX=0"));
  readEspResponse(500);

  // -------------------------------------------------------------
  // STEP 2: Wi-Fi Connection
  // -------------------------------------------------------------
  String cwjapCmd = "AT+CWJAP=\"" + String(WIFI_SSID) + "\",\"" + String(WIFI_PASSWORD) + "\"";
  espSerial.println(cwjapCmd);
  
  String wifiResp = readEspResponse(8000);
  if (wifiResp.indexOf("WIFI CONNECTED") != -1 || wifiResp.indexOf("WIFI GOT IP") != -1 || wifiResp.indexOf("OK") != -1) {
    Serial.println(F("WIFI CONNECTED\n"));
  } else {
    // Check via AT+CIFSR if already connected
    espSerial.println(F("AT+CIFSR"));
    String cifsrResp = readEspResponse(2000);
    if (cifsrResp.indexOf("STAIP") != -1 && cifsrResp.indexOf("0.0.0.0") == -1) {
      Serial.println(F("WIFI CONNECTED\n"));
    } else {
      Serial.println(F("WIFI CONNECTION FAILED"));
      Serial.println(F("UPLOAD FAILED"));
      return;
    }
  }

  // -------------------------------------------------------------
  // STEP 3: DNS Resolution Check (AT+CIPDOMAIN)
  // -------------------------------------------------------------
  String cipdomainCmd = "AT+CIPDOMAIN=\"" + String(THINGSPEAK_HOST) + "\"";
  espSerial.println(cipdomainCmd);
  
  String dnsResp = readEspResponse(3000);
  if (dnsResp.indexOf("OK") != -1 || dnsResp.indexOf("+CIPDOMAIN:") != -1) {
    Serial.println(F("DNS SUCCESS\n"));
  } else {
    Serial.println(F("DNS FAILED"));
  }

  // -------------------------------------------------------------
  // STEP 4: Initiate TCP Connection (AT+CIPSTART)
  // -------------------------------------------------------------
  String cipstartCmd = "AT+CIPSTART=\"TCP\",\"" + String(THINGSPEAK_HOST) + "\"," + String(THINGSPEAK_PORT);
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
    Serial.println(F("TCP CONNECTION FAILED"));
    Serial.println(F("UPLOAD FAILED"));
    return;
  }

  Serial.println(F("TCP CONNECTED\n"));

  // -------------------------------------------------------------
  // STEP 5: Construct HTTP GET Request & Calculate Length Dynamically
  // -------------------------------------------------------------
  String httpRequest = "GET /update?api_key=";
  httpRequest += THINGSPEAK_WRITE_KEY;
  httpRequest += "&field1=786 HTTP/1.1\r\n";
  httpRequest += "Host: ";
  httpRequest += THINGSPEAK_HOST;
  httpRequest += "\r\n";
  httpRequest += "Connection: close\r\n\r\n";

  int totalRequestLength = httpRequest.length();

  Serial.println(F("SENDING DATA\n"));

  // -------------------------------------------------------------
  // STEP 6: Execute AT+CIPSEND
  // -------------------------------------------------------------
  String cipsendCmd = "AT+CIPSEND=" + String(totalRequestLength);
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
    Serial.println(F("CIPSEND PROMPT FAILED"));
    Serial.println(F("UPLOAD FAILED"));
    return;
  }

  // -------------------------------------------------------------
  // STEP 7: Transmit HTTP Payload & Receive Response
  // -------------------------------------------------------------
  espSerial.print(httpRequest);

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

  // Clean numeric ID from HTTP body
  String cleanId = "";
  for (unsigned int i = 0; i < body.length(); i++) {
    if (isDigit(body[i])) {
      cleanId += body[i];
    }
  }

  Serial.println(cleanId);

  if (cleanId.length() > 0 && cleanId != "0") {
    Serial.println(F("\nUPLOAD SUCCESS"));
  } else {
    Serial.println(F("\nUPLOAD FAILED"));
  }
}
