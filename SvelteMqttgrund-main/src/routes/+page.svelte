<script>
	import Buttons from '../components/Buttons.svelte';
// import { onSend,startConnect} from '../stores/mqttStore';

// 	let messageToSend = '';
// 	let receivedMessages = [];
  

	
	// Funktion för att skicka meddelanden
	// function sendMessage() {
	// 	onSend('logger', messageToSend);
	// 	receivedMessages = [...receivedMessages, messageToSend];
	//   messageToSend = ''; // Rensa meddelandefältet efter att meddelandet skickats
	// }
  
	// Exempel på hur du kan lyssna på meddelanden (implementeras vanligtvis i mqttService.js och uppdaterar en butik eller liknande)
  </script>
  

  <!-- <button class=" text-blue-500 bg-blue-200 " on:click={startConnect}>Connect</button> -->

  <!-- <button class=" text-blue-500 bg-blue-200 " on:click={startDisconnect}>Disconnect</button> -->

  <!-- <div class="message-sender">
	<input type="text" class="text-black " bind:value={messageToSend} placeholder="Skriv ett meddelande" />
	<button class=" text-blue-500 bg-blue-200 " on:click={sendMessage}>Skicka</button>
  </div>
  
  <div class="received-messages">
	<h2>Mottagna meddelanden</h2>
	<ul>
	  {#each receivedMessages as message}
		<li>{message}</li>
	  {/each}
	</ul>
  </div>
   -->

<Buttons/>

  <style>
	/* Lägg till dina stilar här */
  </style>
  