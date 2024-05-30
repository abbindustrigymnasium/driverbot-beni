<script>
    import { onMount } from "svelte";





onMount(async () =>{
        connectMQTT();
    });
</script>




<head>
    <meta charset="utf-8">
    <title>BeniDrive 3000 - Keyboard</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/paho-mqtt/1.0.1/mqttws31.min.js" type="text/javascript"></script>
</head>
<body>
    <div class="wrapper xl:text-xl md:text-[18px]  ">
        <h1>Keyboard Control</h1>
        
        <ul class=" mt-[3%]">
         
            <div id="servoValue">Press a/d or left/right arrows! </div>
            <div id="motorValue">Press w/s or up/down arrows! </div>
            <p>Press F to toggle light</p>
            <div id="mqttStatus">---</div>
            <div id="log"></div> <!-- Added log container -->
        </ul>
    </div>
    <script src="src/lib/Keyboard.js"></script>

</body>




