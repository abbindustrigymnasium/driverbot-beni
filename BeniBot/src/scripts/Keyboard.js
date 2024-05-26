let keyState = {};
let prevStickValue = 0;
let prevDriveValue = 0;
let lastUpdateTime = 0;
const updateInterval = 100;
let client;

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

function handleKeyDown(event) {
    keyState[event.key] = true;
    update();
}

function handleKeyUp(event) {
    keyState[event.key] = false;
    update();
}

function connectToMQTT() {
    client = new Paho.MQTT.Client("maqiatto.com", 8883, "clientID_" + parseInt(Math.random() * 100));
    client.onConnectionLost = onConnectionLost;
    client.connect({ userName: "benijuste.ngabire@hitachigymnasiet.se", password: "brok", onSuccess: onConnect, onFailure: onFail });
    document.getElementById("mqttStatus").innerHTML = "Connected"
}

function update() {
    let currentTime = Date.now();
    if (currentTime - lastUpdateTime > updateInterval) {
        let stickValue = calculateStickValueFromKeys();
        if (stickValue !== prevStickValue) {
            document.getElementById("joystickValue").textContent = `Stick Value: ${stickValue}`;
            sendValueToStick(stickValue);
            prevStickValue = stickValue;
        }

        let driveValue = calculateDriveValueFromKeys();
        if (driveValue !== prevDriveValue) {
            document.getElementById("motorValue").textContent = `Drive Value: ${driveValue}`;
            sendValueToDrive(driveValue);
            prevDriveValue = driveValue;
        }

        lastUpdateTime = currentTime;
    }
    requestAnimationFrame(update);
}

function calculateStickValueFromKeys() {
    if (keyState['ArrowLeft'] || keyState['a']) {
        return 0;
    } else if (keyState['ArrowRight'] || keyState['d']) {
        return 180;
    }
    return 90;
}

let driveGear = 0; // Initialize drive gear

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

function handleKeyDown(event) {
    keyState[event.key] = true;
    if (event.key === '1' || event.key === '2' || event.key === '3') {
        changeDriveGear(event.key);
    }
      if (event.key === ' ') { // Check if space key is pressed
        connectToMQTT(); // Connect to MQTT broker
    }
    update();
}

function handleKeyUp(event) {
    keyState[event.key] = false;
    update();
}

function changeDriveGear(key) {
    if (key === '1') {
        driveGear = -1;
    } else if (key === '2') {
        driveGear = 0;
    } else if (key === '3') {
        driveGear = 1;
    }
}

function calculateDriveValueFromKeys() {
    let driveValue = 0;
    if (keyState['ArrowUp'] || keyState['w']) {
        driveValue = driveGear === 1 ? 3 : (driveGear === 0 ? 2 : 1);
    } else if (keyState['ArrowDown'] || keyState['s']) {
        driveValue = driveGear === 1 ? -3 : (driveGear === 0 ? -2 : -1);
    }
    return driveValue;
}


function sendValueToStick(value) {
    if (client && client.isConnected()) {
        let message = new Paho.MQTT.Message(value.toString());
        message.destinationName = "benijuste.ngabire@hitachigymnasiet.se/gamepad/servo";
        client.send(message);
    } else {
        console.error("Error: MQTT client is not connected");
    }
}

function sendValueToDrive(value) {
    if (client && client.isConnected()) {
        let message = new Paho.MQTT.Message(value.toString());
        message.destinationName = "benijuste.ngabire@hitachigymnasiet.se/gamepad/motor";
        client.send(message);
    } else {
        console.error("Error: MQTT client is not connected");
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
