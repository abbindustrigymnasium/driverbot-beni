#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Servo.h>

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
Servo myServo;
// konfiguration för nätverk samt för maqiatto
const char* ssid = "ABBgym_2.4";
const char* password = "mittwifiarsabra";
const char* mqtt_server = "maqiatto.com";
const int mqtt_port = 1883;
const char* mqtt_username = "benijuste.ngabire@hitachigymnasiet.se";
const char* mqtt_password = "brok";
const char* mqtt_topic_servo = "benijuste.ngabire@hitachigymnasiet.se/gamepad/servo";
const char* mqtt_topic_motor = "benijuste.ngabire@hitachigymnasiet.se/gamepad/motor";

// Pins för riktning och hastighet
#define motorPin  5 
#define motorDir  0 
// Anslut till nätverket
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
//Funktionen körs när ett meddelande tas emot
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  static char payloadBuffer[256]; // Static buffer for payload
  Serial.printf("\rMessage received in topic: %s\n", topic);

  // Copy payload to static buffer and null-terminate
  strncpy(payloadBuffer, (char*)payload, length);
  payloadBuffer[length] = '\0';
  Serial.printf("Payload: %s   ", payloadBuffer);

  if (strcmp(topic, mqtt_topic_servo) == 0) {
    // gör om meddelandet från en string till en int
    int angle = atoi(payloadBuffer);
    angle = constrain(angle, 0, 180); 

    // Uppdatera servons position
    myServo.write(angle);
    
    Serial.print("Servo turned to ");
    Serial.print(angle);
    Serial.print(" degrees.       ");
  } else if (strcmp(topic, mqtt_topic_motor) == 0) {
    
    int speedIndex = atoi(payloadBuffer);
    
    // Bestäm körriktning beroende på om det mottagna värdet är positivt eller negativt
    int motorDirValue = (speedIndex < 0) ? HIGH : LOW;
    digitalWrite(motorDir, motorDirValue);

    // Gör om till positivt tal för beräkningar
    speedIndex = abs(speedIndex);

    // Olika hastigheter beroende på det skickade meddelandet, stanna om 0
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
}

//Återanslut
void reconnect() {
  while (!mqttClient.connected()) {
    Serial.println("Attempting MQTT connection...");
    if (mqttClient.connect("ESP8266Client", mqtt_username, mqtt_password)) {
      //Om allt går rätt, subscribea till båda topics
      Serial.println("MQTT connected");
      mqttClient.subscribe(mqtt_topic_servo, 0);
      mqttClient.subscribe(mqtt_topic_motor, 0);
      break;
    } else {
      Serial.print("Failed to connect to MQTT, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
      break; 
    }
  }
}

void setup() {
  Serial.begin(115200);
  setupWiFi();
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
  myServo.attach(D7);
  pinMode(motorPin, OUTPUT);
  pinMode(motorDir, OUTPUT);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnect();
  }
  // Processera information och behåll anslutning
  mqttClient.loop();
  delay(30)
}
