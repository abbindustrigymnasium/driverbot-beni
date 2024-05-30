document.addEventListener("DOMContentLoaded", () => setTimeout(connectToMQTT, 200));

let keyState = {}, prevStickValue = 0, prevDriveValue = 0, lastUpdateTime = 0;
const updateInterval = 100;
let client, recording = false, recordedValues = [], recordStartTime = 0, driveGear = 0;

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

function handleKeyDown(event) {
    keyState[event.key] = true;
    if (['1', '2', '3'].includes(event.key)) changeDriveGear(event.key);
    if (event.key === ' ') connectToMQTT();
    if (event.key === 'f') toggleLED();
    if (event.key === 'r') toggleRecording();
    if (event.key === 'p') sendRecordedValues();
    update();
}

function handleKeyUp(event) {
    keyState[event.key] = false;
    update();
}

function connectToMQTT() {
    client = new Paho.MQTT.Client("maqiatto.com", 8883, `clientID_${Math.floor(Math.random() * 100)}`);
    client.onConnectionLost = (responseObject) => {
        if (responseObject.errorCode !== 0) console.error("Connection lost:", responseObject.errorMessage);
    };
    client.connect({
        userName: "benijuste.ngabire@hitachigymnasiet.se",
        password: "brok",
        onSuccess: onConnect,
        onFailure: () => console.error("Failed to connect to MQTT broker")
    });
    document.getElementById("mqttStatus").innerText = "Connected";
}

function onConnect() {
    console.log("Connected to MQTT broker");
    requestAnimationFrame(update);
}

function update() {
    let currentTime = Date.now();
    if (currentTime - lastUpdateTime > updateInterval) {
        let stickValue = calculateStickValueFromKeys();
        if (stickValue !== prevStickValue) {
            document.getElementById("joystickValue").textContent = `Servo Value: ${stickValue}`;
            sendValue("servo", stickValue);
            prevStickValue = stickValue;
        }

        let driveValue = calculateDriveValueFromKeys();
        if (driveValue !== prevDriveValue) {
            document.getElementById("motorValue").textContent = `Motor Value: ${driveValue}`;
            sendValue("motor", driveValue);
            prevDriveValue = driveValue;
        }
        lastUpdateTime = currentTime;
    }
    requestAnimationFrame(update);
}

function calculateStickValueFromKeys() {
    if (keyState['ArrowLeft'] || keyState['a']) return 0;
    if (keyState['ArrowRight'] || keyState['d']) return 180;
    return 90;
}

function changeDriveGear(key) {
    driveGear = key === '1' ? -1 : key === '2' ? 0 : 1;
}

function calculateDriveValueFromKeys() {
    if (keyState['ArrowUp'] || keyState['w']) return driveGear === 1 ? 3 : driveGear === 0 ? 2 : 1;
    if (keyState['ArrowDown'] || keyState['s']) return driveGear === 1 ? -3 : driveGear === 0 ? -2 : -1;
    return 0;
}

function sendValue(type, value) {
    if (client && client.isConnected()) {
        let message = new Paho.MQTT.Message(value.toString());
        message.destinationName = `benijuste.ngabire@hitachigymnasiet.se/gamepad/${type}`;
        client.send(message);
        if (recording) recordedValues.push({ type, value, time: Date.now() - recordStartTime });
    } else {
        console.error("Error: MQTT client is not connected");
    }
}

function toggleLED() {
    sendValue("light", "toggle");
}

function toggleRecording() {
    recording = !recording;
    console.log(recording ? "Recording started" : "Recording stopped");
    if (recording) {
        recordedValues = [];
        recordStartTime = Date.now();
    } else {
        console.log("Recorded values:", recordedValues);
    }
}

function sendRecordedValues() {
    if (!recording && client && client.isConnected() && recordedValues.length > 0) {
        let startTime = recordedValues[0].time;
        recordedValues.forEach((record, index) => {
            setTimeout(() => {
                let message = new Paho.MQTT.Message(record.value.toString());
                message.destinationName = `benijuste.ngabire@hitachigymnasiet.se/gamepad/${record.type}`;
                client.send(message);
                console.log(`Sent ${record.type} value: ${record.value}`);
                // Check if it's the last recorded value, and if so, send a stop command
                if (index === recordedValues.length - 1) {
                    setTimeout(() => {
                        sendValue("motor", 0); // Stop the motor
                        console.log("Car stopped");
                    }, 500); // Delay the stop command to ensure it's after the last command
                }
            }, record.time - startTime);
        });
        console.log("All recorded values sent with correct intervals.");
    } else if (recording) {
        console.error("Error: Cannot playback while recording is in progress");
    } else {
        console.error("Error: MQTT client is not connected or no recorded values");
    }
}

