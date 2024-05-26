<script lang="js">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { AppRail, AppRailTile, AppRailAnchor } from '@skeletonlabs/skeleton';
	import Navigation from '../components/Navigation.svelte';
	import { initializeStores, Drawer, getDrawerStore } from '@skeletonlabs/skeleton';
	import '$lib/styles.css';
	initializeStores();
	const drawerStore = getDrawerStore();
	function drawerOpen() {
	drawerStore.open({});
}
	
</script>

<Drawer width="w-44">
	<h2 class="p-4">Navigation</h2>
	<hr />
	<Navigation/>
   
</Drawer>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar >
			<svelte:fragment slot="lead">
				<div class="flex items-center">
					<button class="btn btn-sm mr-4" on:click={drawerOpen}>
						<span>
							<svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
								<rect width="100" height="20" />
								<rect y="30" width="100" height="20" />
								<rect y="60" width="100" height="20" />
							</svg>
						</span>
					</button>
					<strong class="text-xl uppercase">Skeleton</strong>
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://www.hitachigymnasiet.se/"
					target="_blank"
					rel="noreferrer"
				>
					Hitachigymnasiet Västerås
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/abbindustrigymnasium/driverbot-beni"
					target="_blank"
					rel="noreferrer"
				>
					Repo
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://www.maqiatto.com/"
					target="_blank"
					rel="noreferrer"
				>
					Maqiatto
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	


	<!-- Page Route Content -->
	<slot />
	
</AppShell>

