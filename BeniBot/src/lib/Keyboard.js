
document.addEventListener("DOMContentLoaded", () => setTimeout(connectMQTT, 200));

let keyState = {}, prevServoValue = 0, prevMotorValue = 0, lastUpdate = 0;
const updateInterval = 0;
let client, recording = false, recordedVals = [], recordStart = 0, gear = 0;

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

// Registerar vilken knapp som trycks ned och kör korresponderande funktion
function onKeyDown(event) {
    document.getElementById("tutorial").innerText = "";
    keyState[event.key] = true;
    if (['1', '2', '3'].includes(event.key)) changeGear(event.key);
    if (event.key === 'f') toggleLED();
    if (event.key === 'r') toggleRec();
    if (event.key === 'p') sendRecVals();
    update();
}
// Samma sak fast när en tangent släpps
function onKeyUp(event) {
    keyState[event.key] = false;
    update();
}

//koppla till maqiatto.com broker med användarnamn och lösenord
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

// kör om kopplingen gick igenom
function onConnect() {
    console.log("Connected to MQTT broker");
    document.getElementById("mqttStatus").innerText = "Connected";
   
    requestAnimationFrame(update);
}

// update funktionen ser till att bara skicka alla värden ifall de har ändrats
function update() {
    if (!client || !client.isConnected()) {
        console.log("MQTT client is not connected, skipping update.");
        return;
    }

  
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
     
    
    requestAnimationFrame(update);
}

// ganska self explanatory, hämta värdena.
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
//skicka ett hämtat värde och skicka det till en specifik topic
function sendVal(type, value) {
    
    if (client && client.isConnected()) {
        try {
            console.log(`Sending ${type} with value ${value}`);
            value = value.toString();
            message = new Paho.MQTT.Message(value.toString());
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

//ändra lampans tillstånd 
function toggleLED() {
    sendVal("light", "toggle");
}

// börja "filma in" värden som skickas.
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
// med inspelade värden, skicka dem med rätt intervaller
function sendRecVals() {
    if (!recording && client && client.isConnected() && recordedVals.length > 0) {
        let startTime = recordedVals[0].time;
        recordedVals.forEach((record, index) => {
            setTimeout(() => {
                try {
                    console.log(`Sending recorded ${record.type} with value ${record.value}`);
                    let message = new Paho.MQTT.Message(record.value.toString());
                    message.destinationName = `benijuste.ngabire@hitachigymnasiet.se/gamepad/${record.type}`;
                    client.send(message);
                    console.log(`Sent ${record.type} value: ${record.value}`);
                    if (index === recordedVals.length - 1) {
                        setTimeout(() => {
                            sendVal("motor", 0); // Stop the motor
                            console.log("Car stopped");
                        }, 500); 
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
