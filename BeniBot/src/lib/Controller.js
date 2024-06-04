document.addEventListener("DOMContentLoaded", () => setTimeout(connectMQTT, 200));
let keyState = {}, prevJoystickValue = 0, prevMotorValue = 0, lastUpdateTime = 0;
const updateInterval = 0;
let recording = false, recordedValues = [], recordStartTime = 0, client, gamepad;

window.addEventListener("gamepadconnected", e => {
    gamepad = e.gamepad;
    document.getElementById("gamepadStatus").textContent = "Gamepad Status: Connected";
    connectToMQTT();
});

window.addEventListener("gamepaddisconnected", () => {
    gamepad = null;
    document.getElementById("gamepadStatus").textContent = "Gamepad Status: Disconnected";
});

function connectToMQTT() {
    client = new Paho.MQTT.Client("maqiatto.com", 8883, "clientID_" + parseInt(Math.random() * 100));
    client.onConnectionLost = onConnectionLost;
    client.connect({
        userName: "benijuste.ngabire@hitachigymnasiet.se",
        password: "brok",
        onSuccess: onConnect,
        onFailure: () => console.error("Failed to connect to MQTT broker")
    });
    document.getElementById("mqttStatus").innerHTML = "Connected";
}

function update() {
    const gamepads = navigator.getGamepads();
    gamepad = gamepads[0];

    if (gamepad) {

            let joystickValue = Math.round(gamepad.axes[0] * 90 + 90);
            joystickValue = Math.min(Math.max(joystickValue, 0), 180);

            // Map joystick value to only 0, 45, 90, 135, 180
            joystickValue = joystickValue <= 22.5 ? 0 : joystickValue <= 67.5 ? 45 : joystickValue <= 112.5 ? 90 : joystickValue <= 157.5 ? 135 : 180;
            
            if (joystickValue !== prevJoystickValue) {
                document.getElementById("joystickValue").textContent = `Servo Value: ${joystickValue}`;
                sendValueToServo(joystickValue);
                prevJoystickValue = joystickValue;
            }

            let motorValue = 0;
            if (gamepad.buttons[7].pressed && !gamepad.buttons[6].pressed) {
                motorValue = gamepad.buttons[7].value < 0.7 ? 1 : gamepad.buttons[7].value < 0.999 ? 2 : 3;
            } else if (gamepad.buttons[6].pressed && !gamepad.buttons[7].pressed) {
                motorValue = gamepad.buttons[6].value < 0.7 ? -1 : gamepad.buttons[6].value < 0.999 ? -2 : -3;
            }

            if (motorValue !== prevMotorValue) {
                document.getElementById("motorValue").textContent = `Motor Value: ${motorValue}`;
                sendValueToMotor(motorValue);
                prevMotorValue = motorValue;
            }

            if (gamepad.buttons[2].pressed && !keyState['recording']) {
                toggleRecording();
                keyState['recording'] = true;
            } else if (!gamepad.buttons[2].pressed && keyState['recording']) {
                keyState['recording'] = false;
            }

            if (gamepad.buttons[3].pressed && !keyState['send']) {
                sendRecordedValues();
                keyState['send'] = true;
            } else if (!gamepad.buttons[3].pressed && keyState['send']) {
                keyState['send'] = false;
            }

    }
    requestAnimationFrame(update);
}

function toggleRecording() {
    recording = !recording;
    console.log(recording ? "Recording started" : "Recording stopped");
    if (recording) {
        recordedValues = [];
        recordStartTime = Date.now();
    }
}
function sendRecordedValues() {
    
    if (client && client.isConnected() && recordedValues.length > 0) {
        let startTime = recordedValues[0].time;
        recordedValues.forEach((record, index) => {
            setTimeout(() => {
                sendVal(record.type, record.value);
                // Check if it's the last recorded value, and if so, send a stop command
                if (index === recordedValues.length - 1) {
                    setTimeout(() => {
                        sendValueToMotor(0); // Stop the motor
                        console.log("Car stopped");
                    }, 500); // Delay the stop command to ensure it's after the last command
                }
            }, record.time - startTime);
        });
        console.log("All recorded values sent with correct intervals.");
    } else {
        if (!client || !client.isConnected()) {
            console.error("Error: MQTT client is not connected");
        }
        if (recordedValues.length === 0) {
            console.error("Error: No recorded values");
        }
    }
}


function sendVal(type, value) {
    if (client && client.isConnected()) {
        try {
            value = value.toString();
            let message = new Paho.MQTT.Message(value); // <--- Convert value to JSON string
            message.destinationName = `benijuste.ngabire@hitachigymnasiet.se/gamepad/${type}`;
            client.send(message);
            if (recording) recordedValues.push({ type, value, time: Date.now() - recordStartTime });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    } else {
        console.error("Error: MQTT client is not connected");
    }
}

function sendValueToServo(value) {
    sendVal("servo", value);
}

function sendValueToMotor(value) {
    sendVal("motor", value);
}

function onConnect() {
    console.log("Connected to MQTT broker");
    requestAnimationFrame(update);
    setInterval(checkCircleButtonPress, 50);
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.error("Connection lost:", responseObject.errorMessage);
    }
}

function checkCircleButtonPress() {
    const gamepads = navigator.getGamepads();
    gamepad = gamepads[0];

    if (gamepad) {
        let currentCircleButtonState = gamepad.buttons[1].pressed;
        if (currentCircleButtonState && !prevCircleButtonState) toggleLED();
        prevCircleButtonState = currentCircleButtonState;
    }
}

function toggleLED() {
    sendValue("light", "toggle");
}
