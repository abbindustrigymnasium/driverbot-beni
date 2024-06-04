<script>
    import { onMount } from "svelte";

onMount(async () =>{
        connectToMQTT();
    });


</script>




<head>
    <meta charset="utf-8">
    <title>BeniDrive 3000 - Controller</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js" type="text/javascript"></script>
    <script src="src/lib/controller.js"></script>
</head>
<body>
    <div class="wrapper xl:text-xl md:text-[18px]  ">
        <h1>Gamepad Control</h1>
        
        <ul class=" mt-[3%]">
            <div id="gamepadStatus">Gamepad Not Connected</div>
            <div id="joystickValue">Joystick Value: </div>
            <div id="motorValue">Motor Value: </div>
            <div id="mqttStatus"></div>
   
        </ul>
    </div>

   
   <slot name="script">
  
   </slot>
   

</body>




