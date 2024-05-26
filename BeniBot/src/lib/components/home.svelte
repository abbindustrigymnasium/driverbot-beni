<script>

    export let control = "";
    export let gamePadstat="";

</script>




<head>
    <meta charset="utf-8">
    <title>BeniDrive 3000</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js" type="text/javascript"></script>
</head>
<body>
    <div class="wrapper xl:text-xl md:text-[18px]  ">
        <h1>{control} Control</h1>
        
        <ul class=" mt-[3%]">
            <div id="gamepadStatus">{gamePadstat}</div>
            <div id="joystickValue">Joystick Value: </div>
            <div id="motorValue">Motor Value: </div>
            <div id="mqttStatus"></div>
            <div id="log"></div> <!-- Added log container -->
        </ul>
    </div>

   
   <slot name="script">
  
   </slot>
   

</body>




