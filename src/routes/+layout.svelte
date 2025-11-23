<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>YGOSTATS</title>
</svelte:head>

{@render children()}
