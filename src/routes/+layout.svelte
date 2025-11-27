<script lang="ts">
  import favicon from '$lib/assets/favicon.svg';
  import Navigation from '$lib/components/Navigation.svelte';
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>YGO Tool</title>
</svelte:head>

<Navigation />
<main class="app-container">
  {@render children()}
</main>
