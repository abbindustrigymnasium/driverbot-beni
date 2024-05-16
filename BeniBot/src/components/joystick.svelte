<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        .joy-div {
            position: relative;
            height: 157px;
            width: 157px;
            display: inline-block;
            border-width: 10px;
            border-style: solid;
            border-color: rgba(0, 0, 0, 0);
            border-image: initial;
            justify-content: center;
        }

        .x-axis {
            position: absolute;
            left: 0px;
            right: 0px;
            top: 50%;
            height: 1px;
            opacity: 0.2;
            background: black;
        }

    </style>
    <script>
        function joymap(x, in_min, in_max, out_min, out_max) {
            return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        }

        window.addEventListener("gamepadconnected", (event) => {
            console.log("A gamepad connected:");
            console.log(event.gamepad);
            let interval;
            if (!interval)
                interval = setInterval(pollGamepads, 10);
        });

        window.addEventListener("gamepaddisconnected", (event) => {
            console.log("A gamepad disconnected:");
            console.log(event.gamepad);
        });

       
        function pollGamepads() {
    try {
        const gp = window.navigator.getGamepads()[0];

        for (let i = 0; i < gp.buttons.length; i++) {
            if (gp.buttons[i].pressed) {
                console.log(`Button ${[i]} was pressed`);
            }
        }

        var joy1 = document.querySelector('#joy1');
        var steeringWheel = document.querySelector('#steeringWheel');

        // Only read the x-axis value
        let joyleft1 = gp.axes[0];
        if (Math.abs(joyleft1) < 0.1) joyleft1 = 0;
        joyleft1 = joymap(joyleft1, -1, 1, -90, 90); // Adjust the range of rotation as needed
        steeringWheel.style.transform = `rotate(${joyleft1*0.5}deg)`;

    } catch (e) {
        console.log(e);
        clearInterval(interval);
    }s
}


    </script>
</head>

<body>
    <div>
        <div class="joy-div">
            <img id="steeringWheel" src="steering-wheel.png"  alt="">
        </div>
     

    </div>
</body>

</html>
