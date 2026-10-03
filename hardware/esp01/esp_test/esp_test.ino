#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// -------------------------------------------------------------
// CONFIGURATION - Update these before flashing
// -------------------------------------------------------------
const char* WIFI_SSID = "YOUR_WIFI_SSID_HERE";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD_HERE";

// The Local LAN IPv4 address of the computer running FastAPI
const char* BACKEND_IP = "192.168.1.100";  
const int BACKEND_PORT = 8000;
// -------------------------------------------------------------

void setup() {
  // Hard restriction to 115200 baud parsing over UART pins
  Serial.begin(115200);
  delay(10);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Block indefinitely until Wi-Fi validates
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    
    // Listen to UART directly for physical connections via Arduino Nano D11 string emissions
    if (Serial.available()) {
      // Collect payload string
      String incomingJson = Serial.readStringUntil('\n');
      incomingJson.trim(); // strip ending carriage routines

      // Extremely lightweight validation block avoiding heavy JSON decode deps
      if (incomingJson.startsWith("{") && incomingJson.endsWith("}")) {
        
        WiFiClient client;
        HTTPClient http;

        String url = String("http://") + BACKEND_IP + ":" + BACKEND_PORT + "/api/sensor-data";
        
        http.begin(client, url);
        http.addHeader("Content-Type", "application/json");

        // Execute pass-forward pipeline
        int httpResponseCode = http.POST(incomingJson);
        http.end();
      }
    }
  } else {
    // Graceful offline reconnection
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    delay(5000);
  }
}
