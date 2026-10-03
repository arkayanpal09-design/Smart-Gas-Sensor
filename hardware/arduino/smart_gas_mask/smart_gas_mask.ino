#include <SoftwareSerial.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#define MQ2_PIN A0

// Setup Software Serial for ESP-01 module (RX, TX)
SoftwareSerial espSerial(10, 11);
Adafruit_MPU6050 mpu;

bool mpuConnected = false;
unsigned long lastSendTime = 0;

void setup() {
  // Setup primary developer Serial channel matching Arduino IDE standard speeds for print debugging
  Serial.begin(9600);           
  
  // Setup ESP-01 Module exactly at baud 115200 restriction
  espSerial.begin(115200);      

  Serial.println("\nSmart Gas Mask - Arduino Nano Initialization");

  pinMode(MQ2_PIN, INPUT);

  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println("MPU6050 NOT FOUND!");
    mpuConnected = false;
  } else {
    Serial.println("MPU6050 Configured.");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpuConnected = true;
  }
}

void loop() {
  if (millis() - lastSendTime >= 1000) {
    lastSendTime = millis();
    
    // Read raw relative analog value of MQ2 sensor 
    int gasValue = analogRead(MQ2_PIN);
    
    // Construct valid JSON structure natively to avoid dynamic memory overflow dependencies 
    String jsonPayload = "{";
    jsonPayload += "\"gas\":" + String(gasValue);

    Serial.print("MQ2: ");
    Serial.println(gasValue);

    if (mpuConnected) {
      sensors_event_t a, g, temp;
      mpu.getEvent(&a, &g, &temp);
      
      // Adafruit MPU-6050 returns native acceleration in m/s^2, physics requires dividing by standard gravity
      float x = a.acceleration.x / 9.80665;
      float y = a.acceleration.y / 9.80665;
      float z = a.acceleration.z / 9.80665;

      Serial.print("X: "); Serial.println(x, 2);
      Serial.print("Y: "); Serial.println(y, 2);
      Serial.print("Z: "); Serial.println(z, 2);

      jsonPayload += ", \"accel_x\":" + String(x, 2);
      jsonPayload += ", \"accel_y\":" + String(y, 2);
      jsonPayload += ", \"accel_z\":" + String(z, 2);
    } else {
      jsonPayload += ", \"error\":\"MPU6050 NOT FOUND\"";
    }

    // Terminal brackets
    jsonPayload += "}";

    // Print to ESP-01 UART terminated with implicit newline via `println`
    espSerial.println(jsonPayload);
    Serial.println("ESP: DATA SENT");
  }
}
