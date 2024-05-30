document.addEventListener("DOMContentLoaded", () => setTimeout(connectMQTT, 200));

let keyState = {}, prevServoValue = 0, prevMotorValue = 0, lastUpdate = 0;
const updateInterval = 100;
let client, recording = false, recordedVals = [], recordStart = 0, gear = 0;

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

function onKeyDown(event) {
    keyState[event.key] = true;
    if (['1', '2', '3'].includes(event.key)) changeGear(event.key);
    if (event.key === ' ') connectMQTT();
    if (event.key === 'f') toggleLED();
    if (event.key === 'r') toggleRec();
    if (event.key === 'p') sendRecVals();
    update();
}

function onKeyUp(event) {
    keyState[event.key] = false;
    update();
}

function connectMQTT() {
    client = new Paho.MQTT.Client("maqiatto.com", 8883, `clientID_${Math.floor(Math.random() * 100)}`);
    client.onConnectionLost = (response) => {
        if (response.errorCode !== 0) console.error("Connection lost:", response.errorMessage);
    };
    client.connect({
        userName: "benijuste.ngabire@hitachigymnasiet.se",
        password: "brok",
        onSuccess: onConnect,
        onFailure: (error) => console.error("Failed to connect to MQTT broker", error)
    });
    document.getElementById("mqttStatus").innerText = "Connecting...";
}

function onConnect() {
    console.log("Connected to MQTT broker");
    document.getElementById("mqttStatus").innerText = "Connected";
    requestAnimationFrame(update);
}

function update() {
    if (!client || !client.isConnected()) {
        console.log("MQTT client is not connected, skipping update.");
        return;
    }

    let currentTime = Date.now();
    if (currentTime - lastUpdate > updateInterval) {
        let servoValue = calcServoVal();
        if (servoValue !== prevServoValue) {
            document.getElementById("servoValue").textContent = `Servo Value: ${servoValue}`;
            sendVal("servo", servoValue);
            prevServoValue = servoValue;
        }

        let motorValue = calcMotorVal();
        if (motorValue !== prevMotorValue) {
            document.getElementById("motorValue").textContent = `Motor Value: ${motorValue}`;
            sendVal("motor", motorValue);
            prevMotorValue = motorValue;
        }
        lastUpdate = currentTime;
    }
    requestAnimationFrame(update);
}

function calcServoVal() {
    if (keyState['ArrowLeft'] || keyState['a']) return 0;
    if (keyState['ArrowRight'] || keyState['d']) return 180;
    return 90;
}

function changeGear(key) {
    gear = key === '1' ? -1 : key === '2' ? 0 : key === '3' ? 1 : gear;
}

function calcMotorVal() {
    if (keyState['ArrowUp'] || keyState['w']) return gear === 1 ? 3 : gear === 0 ? 2 : 1;
    if (keyState['ArrowDown'] || keyState['s']) return gear === 1 ? -3 : gear === 0 ? -2 : -1;
    return 0;
}

function sendVal(type, value) {
    if (client && client.isConnected()) {
        try {
            // Validate and convert the value to a string if necessary
            if (typeof value !== "string") {
                value = value.toString();
            }
            if (typeof value !== "string" || value === "") {
                throw new Error("Invalid message value");
            }

            // Validate type
            if (typeof type !== "string" || type === "") {
                throw new Error("Invalid message type");
            }

            console.log(`Sending ${type} with value ${value}`);

            // Create and send the MQTT message
            let message = new Paho.MQTT.Message(value);
            message.destinationName = `benijuste.ngabire@hitachigymnasiet.se/gamepad/${type}`;
            client.send(message);
            if (recording) recordedVals.push({ type, value, time: Date.now() - recordStart });
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    } else {
        console.error("Error: MQTT client is not connected");
    }
}

function toggleLED() {
    sendVal("light", "toggle");
}

function toggleRec() {
    recording = !recording;
    console.log(recording ? "Recording started" : "Recording stopped");
    if (recording) {
        recordedVals = [];
        recordStart = Date.now();
    } else {
        console.log("Recorded values:", recordedVals);
    }
}

function sendRecVals() {
    if (!recording && client && client.isConnected() && recordedVals.length > 0) {
        let startTime = recordedVals[0].time;
        recordedVals.forEach((record, index) => {
            setTimeout(() => {
                try {
                    // Validate and convert the recorded value to a string if necessary
                    let value = record.value;
                    if (typeof value !== "string") {
                        value = value.toString();
                    }
                    if (typeof value !== "string" || value === "") {
                        throw new Error("Invalid recorded message value");
                    }

                    // Validate type
                    if (typeof record.type !== "string" || record.type === "") {
                        throw new Error("Invalid recorded message type");
                    }

                    console.log(`Sending recorded ${record.type} with value ${value}`);

                    // Create and send the MQTT message
                    let message = new Paho.MQTT.Message(value);
                    message.destinationName = `benijuste.ngabire@hitachigymnasiet.se/gamepad/${record.type}`;
                    client.send(message);
                    console.log(`Sent ${record.type} value: ${record.value}`);
                    if (index === recordedVals.length - 1) {
                        setTimeout(() => {
                            sendVal("motor", 0); // Stop the motor
                            console.log("Car stopped");
                        }, 500); // Delay the stop command to ensure it's after the last command
                    }
                } catch (error) {
                    console.error("Failed to send recorded message:", error);
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
