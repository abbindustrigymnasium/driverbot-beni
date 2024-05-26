<script>

	import { onMount } from 'svelte';
	import Home from "$lib/components/home.svelte";
	
</script>
<Home control = "Keyboard">

<slot slot="script"> 
	<script src="src/lib/keyboard.js"></script> 
</slot>
</Home>

