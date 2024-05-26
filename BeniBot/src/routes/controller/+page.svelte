<script>
	import Home from "$lib/components/home.svelte";
	import { AppBar } from '@skeletonlabs/skeleton';
	import { AppShell } from '@skeletonlabs/skeleton';
    
   
</script>
<Home control="Gamepad" gamePadstat="Gamepad Status: Disconnected">

<slot slot="script">
    <script src="src\lib\Controller.js">
        
    </script>
</slot>
</Home>
