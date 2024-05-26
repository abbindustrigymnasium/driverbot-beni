let prevJoystickValue = 0;
let prevMotorValue = 0;
let lastUpdateTime = 0;
const updateInterval = 10;

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
                document.getElementById("joystickValue").textContent = `Joystick Value: ${joystickValue}`;
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

            // Check for circle button press and send "honk1"
            if (gamepad.buttons[1].pressed) {
                sendHonk();
                displayHonk();
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

function sendHonk() {
    if (client && client.isConnected()) {
        let message = new Paho.MQTT.Message("honk1");
        message.destinationName = "benijuste.ngabire@hitachigymnasiet.se/gamepad/honk";
        client.send(message);
    } else {
        logMessage("Error: MQTT client is not connected");
    }
}

function onConnect() {
    console.log("Connected to MQTT broker");
    
    requestAnimationFrame(update);
}

function onFail() {
    console.error("Failed to connect to MQTT broker");
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        console.error("Connection lost:", responseObject.errorMessage);
    }
}

function displayHonk() {
    let honkDiv = document.createElement("div");
    honkDiv.id = "honkDiv";
    honkDiv.textContent = "Honk!";
    honkDiv.style.position = "fixed";
    honkDiv.style.top = "50%";
    honkDiv.style.left = "50%";
    honkDiv.style.transform = "translate(-50%, -50%)";
    honkDiv.style.backgroundColor = "black";
    honkDiv.style.padding = "20px";
    honkDiv.style.border = "2px solid black";
    document.body.appendChild(honkDiv);
    
    setTimeout(() => {
        honkDiv.remove();
    }, 500);
}
