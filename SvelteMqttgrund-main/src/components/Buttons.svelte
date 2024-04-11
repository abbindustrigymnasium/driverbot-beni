<script>
    	import { onSend, startConnect} from '../stores/mqttStore';
    	import { isConnected} from '../stores/store';
let test="hejhej"
    // Function to send MQTT message
    function sendMessage(direction) {
        const message = direction === 'up' ? 'up' :
                                        direction === 'down' ? 'down' :
                                        direction === 'right' ? 'right' :
                                        direction === 'left' ? 'left' : '';

        // Publish the message to MQTT topic
        onSend('driver', message);
    }
</script>

<style>
</style>
<div class="flex justify-center bg-slate-100 space-x-4">
   
    <div class="flex flex-col items-center space-y-2 bg-white p-4 rounded shadow">
        {#if $isConnected}
        <img src="https://i.pinimg.com/originals/f7/4d/86/f74d8694bedb5967c075aa5a8fbc1a62.gif">
        <p class="text-green-500">Connected</p>
    {:else}
        <p class="text-red-500">Not Connected</p>
    {/if}
        <!-- Top Button -->
        <button class="btn variant-filled" on:click={() => sendMessage('up')}>
            Up</button>
        <!-- Middle Row of Buttons -->
        <div class="flex justify-between space-x-2 w-full">
            <button class="btn variant-filled" on:click={() => sendMessage('right')}>
                Right
            </button>
            <button class="btn variant-outline-secondary bg-cyan-300" disabled={$isConnected} on:click={startConnect}>
                Connect
            </button>
          <button class="btn variant-filled" on:click={() => sendMessage('left')}>
            Left
        </button>
        </div>
        
        <!-- Bottom Button -->
        <button class="btn variant-filled" on:click={() => sendMessage('down')}>
            Down
        </button>
      </div>
</div>