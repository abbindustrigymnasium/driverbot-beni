let prevJoystickValue = 0;
let prevMotorValue = 0;
let lastUpdateTime = 0;
const updateInterval = 10;
let prevCircleButtonState = false;

window.addEventListener("gamepadconnected", e => {
    gamepad = e.gamepad;
    document.getElementById("gamepadStatus").textContent = "Gamepad Status: Connected";
    document.getElementById("mqttStatus").innerHTML = "Connected";
    client = new Paho.MQTT.Client("maqiatto.com", 8883, "clientID_" + parseInt(Math.random() * 100));
    client.onConnectionLost = onConnectionLost;
    client.connect({ userName: "benijuste.ngabire@hitachigymnasiet.se", password: "brok", onSuccess: onConnect, onFailure: onFail });
});

window.addEventListener("gamepaddisconnected", e => {
    gamepad = null;
    document.getElementById("gamepadStatus").textContent = "Gamepad Status: Disconnected";
});

function update() {
    const gamepads = navigator.getGamepads();
    gamepad = gamepads[0];

    if (gamepad) {
        let currentTime = Date.now();
        if (currentTime - lastUpdateTime > updateInterval) {
            let joystickValue = Math.round(gamepad.axes[0] * 90 + 90);
            joystickValue = Math.min(Math.max(joystickValue, 0), 180);
            joystickValue = Math.round(joystickValue / 30) * 30;
            
            if (joystickValue !== prevJoystickValue) {
                document.getElementById("joystickValue").textContent = `Servo Value: ${joystickValue}`;
                sendValueToServo(joystickValue);
                prevJoystickValue = joystickValue;
            }

            let motorValue = 0;
            if (gamepad.buttons[7].pressed && !gamepad.buttons[6].pressed) {
                if (gamepad.buttons[7].value < 0.7) motorValue = 1;
                else if (gamepad.buttons[7].value < 0.999) motorValue = 2;
                else motorValue = 3;
            } else if (gamepad.buttons[6].pressed && !gamepad.buttons[7].pressed) {
                if (gamepad.buttons[6].value < 0.7) motorValue = -1;
                else if (gamepad.buttons[6].value < 0.999) motorValue = -2;
                else motorValue = -3;
            } else if (gamepad.buttons[6].pressed && gamepad.buttons[7].pressed) {
                motorValue = 0;
            }
            
            if (motorValue !== prevMotorValue) {
                document.getElementById("motorValue").textContent = `Motor Value: ${motorValue}`;
                sendValueToMotor(motorValue);
                prevMotorValue = motorValue;
            }

            lastUpdateTime = currentTime;
        }
    }
    requestAnimationFrame(update);
}

function sendValueToServo(value) {
    if (client && client.isConnected()) {
        let message = new Paho.MQTT.Message(value.toString());
        message.destinationName = "benijuste.ngabire@hitachigymnasiet.se/gamepad/servo";
        client.send(message);
    } else {
        logMessage("Error: MQTT client is not connected");
    }
}

function sendValueToMotor(value) {
    if (client && client.isConnected()) {
        let message = new Paho.MQTT.Message(value.toString());
        message.destinationName = "benijuste.ngabire@hitachigymnasiet.se/gamepad/motor";
        client.send(message);
    } else {
        logMessage("Error: MQTT client is not connected");
    }
}

function onConnect() {
    console.log("Connected to MQTT broker");
    requestAnimationFrame(update);
    setInterval(checkCircleButtonPress, 50); // Check for circle button press every 50ms
}

function onFail() {
    console.error("Failed to connect to MQTT broker");
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
        if (currentCircleButtonState && !prevCircleButtonState) {
            toggleLED();
        }
        prevCircleButtonState = currentCircleButtonState;
    }
}

function toggleLED() {
    if (client && client.isConnected()) {
        let message = new Paho.MQTT.Message("toggle");
        message.destinationName = "benijuste.ngabire@hitachigymnasiet.se/gamepad/light";
        client.send(message);
    } else {
        logMessage("Error: MQTT client is not connected");
    }
}
