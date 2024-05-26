<script>
import { getDrawerStore } from "@skeletonlabs/skeleton";

const drawerStore = getDrawerStore();

function drawerClose(){
     drawerStore.close();
}
</script>
<nav class="list-nav ">
    <ul data-sveltekit-reload>
        <li><a href="/" on:click={drawerClose}>Homepage</a></li>
        <li><a href="/about" on:click={drawerClose}>About</a></li>
        <li><a href="/controller" on:click={drawerClose}>Controller</a></li>
        <li><a href="/keyboard" on:click={drawerClose}>Keyboard</a></li>
    </ul>
</nav>
                                                      