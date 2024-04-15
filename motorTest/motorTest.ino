#define motorPinRightDir  0 //D2
#define motorPinRightSpeed 5 //D1
#include <Servo.h> // Servo library
Servo servo;

unsigned long previousMillis = 0; // Variable to store the last time servo position was updated
const long interval = 2200; // Interval between servo movements

void setup() {
  pinMode(motorPinRightDir, OUTPUT);
  pinMode(motorPinRightSpeed, OUTPUT);
  servo.attach(9); // Attach servo to pin 9
  servo.write(90); // Set initial servo position
  Serial.begin(115200);
}

void loop() {
  unsigned long currentMillis = millis(); // Get the current time

  // Move the servo to position 180 after every 'interval' milliseconds
  if (currentMillis - previousMillis >= interval) {
    servo.write(180);
    previousMillis = currentMillis; // Save the last time the servo position was updated
  }

  // Move the servo to position 0 after half the interval
  if (currentMillis - previousMillis >= interval / 2 && currentMillis - previousMillis < interval) {
    servo.write(0);
  }

  // Motor control logic
  int speed = 512;
  int dir = 0;

  // Motor movement at regular intervals
  if (currentMillis - previousMillis >= interval / 2) {
    digitalWrite(motorPinRightDir, dir);
    analogWrite(motorPinRightSpeed, speed);
  }

  // Stop motor after each movement
  if (currentMillis - previousMillis >= interval) {
    analogWrite(motorPinRightSpeed, 0);
  }

  // Add a still delay after the completion of the loop
  if (currentMillis - previousMillis >= interval * 2) {
    delay(1000); // Adjust the duration of the delay as needed
  }
}
