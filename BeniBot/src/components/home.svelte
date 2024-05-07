
<style>
    h1 {
        font-size: 2em;
    }
    body{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      
   
      
        color: #fff;
        font-family: sans-serif;
        font-size: 16px;
        text-align: center;
        
        font-family:'Courier New', Courier, monospace;
        font-weight: bold; 
    }
    .wrapper {
        margin-top: 5%;
    }
</style>



<head>
    <meta charset="utf-8">
    <title>BeniDrive 3000</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js" type="text/javascript"></script>
</head>
<body>
    <div class="wrapper">
        <h1>Gamepad Joystick Control</h1>
        <div id="gamepadStatus">Gamepad Status: Disconnected</div>
        <div id="joystickValue">Joystick Value: </div>
        <div id="motorValue">Motor Value: </div>
        <div id="mqttStatus">MQTT Connection Status: Not connected, Press space or any button on Controller</div>
        <div id="log"></div> <!-- Added log container -->
    </div>

   
   
    <script src="src\scripts\Controller.js"></script>
   
 <!-- Added script for disconnect button -->
</body>


