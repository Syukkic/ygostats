<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>BO3</title>
</svelte:head>

{@render children()}
