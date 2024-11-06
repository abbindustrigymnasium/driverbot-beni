#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
Servo myServo;
String clientId = "IoTPractice-" + String(ESP.getChipId());

// Configuration for network and maqiatto
const char* ssid = "ABB_Gym_IOT";
const char* password = "Welcome2abb";
const char* mqtt_server = "maqiatto.com";
const int mqtt_port = 1883;
const char* mqtt_username = "benijuste.ngabire@hitachigymnasiet.se";
const char* mqtt_password = "1234";
const char* mqtt_topic_servo = "benijuste.ngabire@hitachigymnasiet.se/gamepad/servo";
const char* mqtt_topic_motor = "benijuste.ngabire@hitachigymnasiet.se/gamepad/motor";
const char* mqtt_topic_light = "benijuste.ngabire@hitachigymnasiet.se/gamepad/light";

bool lightState = false;
// Pins for direction and speed
#define motorPin  5 //D1
#define motorDir  0 //D3




// Connect to the network
void setupWiFi() {
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

// Function runs when a message is received
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  static char payloadBuffer[256]; // Static buffer for payload
  // Copy payload to static buffer and null-terminate
  strncpy(payloadBuffer, (char*)payload, length);
  payloadBuffer[length] = '\0';

  if (strcmp(topic, mqtt_topic_servo) == 0) {
    // Convert the message from a string to an int
    int angle = atoi(payloadBuffer);

    // Update servo position
    myServo.write(angle);
    
    Serial.print("Servo turned to ");
    Serial.print(angle);
    Serial.println(" degrees.");
  } else if (strcmp(topic, mqtt_topic_motor) == 0) {
    int speedIndex = atoi(payloadBuffer);
    // Determine driving direction based on whether the received value is positive or negative
    int motorDirValue = (speedIndex < 0) ? HIGH : LOW;
    digitalWrite(motorDir, motorDirValue);
    
    // Convert to positive number for calculations
    speedIndex = abs(speedIndex);

    // Different speeds depending on the sent message, stop if 0
    int motorSpeed;
    switch(speedIndex) {
      case 1:
        motorSpeed = 100;
        break;
      case 2:
        motorSpeed = 178;
        break;
      case 3:
        motorSpeed = 256;
        break;
      default:
        motorSpeed = 0; // Stop motor if an invalid speed is received
        break;
    }
    analogWrite(motorPin, motorSpeed);
    Serial.print("Motor speed set to ");
    Serial.print(motorSpeed);
    Serial.print(" PWM. Direction: ");
    Serial.print((motorDirValue == HIGH) ? "Reverse" : "Forward");
    Serial.println();
  }
  else if (strcmp(topic, mqtt_topic_light) == 0) {
    // Toggle the light state
    lightState = !lightState;
    digitalWrite(D5, lightState ? HIGH : LOW);
    Serial.print("Light state toggled to ");
    Serial.println(lightState ? "ON" : "OFF");
  }
}

// Reconnect
void reconnect() {
  while (!mqttClient.connected()) {
    Serial.println("Attempting MQTT connection...");
    if (mqttClient.connect(clientId.c_str(), mqtt_username, mqtt_password)) {
      // If everything goes right, subscribe to both topics
      Serial.println("MQTT connected");
      mqttClient.subscribe(mqtt_topic_servo, 0);
      mqttClient.subscribe(mqtt_topic_motor, 0);
      mqttClient.subscribe(mqtt_topic_light, 0);
   
    } else {
      Serial.print("Failed to connect to MQTT, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);

  setupWiFi();
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
  myServo.attach(D6);
  pinMode(motorPin, OUTPUT);
  pinMode(motorDir, OUTPUT);
  pinMode(D6, OUTPUT);
  pinMode(D5, OUTPUT);
  reconnect();
  analogWrite(motorPin,100);
  delay(300);
  analogWrite(motorPin, 0);

}


void loop() {
  if (!mqttClient.connected()) {
    reconnect();
  }
  mqttClient.loop();
}

