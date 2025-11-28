<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import logo from '$lib/assets/favicon.svg';
</script>

<header>
  <nav class="app-container">
    <a href={resolve('/')} class="logo">
      <img src={logo} alt="YGO Stats Logo" />
      <h1>YGOSTATS</h1>
    </a>
    <ul>
      <li>
        <a
          href={resolve('/md')}
          class:active={page.url.pathname.startsWith('/md')}
          aria-current={page.url.pathname.startsWith('/md') ? 'page' : undefined}>MD</a
        >
      </li>
      <li>
        <a
          href={resolve('/bo3')}
          class:active={page.url.pathname.startsWith('/bo3')}
          aria-current={page.url.pathname.startsWith('/bo3') ? 'page' : undefined}>BO3</a
        >
      </li>
      <li>
        <a
          href={resolve('/dc')}
          class:active={page.url.pathname.startsWith('/dc')}
          aria-current={page.url.pathname.startsWith('/dc') ? 'page' : undefined}>DC</a
        >
      </li>
    </ul>
  </nav>
</header>

<style>
  header {
    background-color: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid var(--border-color);
    padding: 0.75rem 0;
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(8px);
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-decoration: none;
  }

  .logo img {
    height: 2.5rem;
    width: auto;
  }

  .logo h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
  }

  ul {
    list-style: none;
    display: flex;
    gap: 1rem;
    margin: 0;
    padding: 0;
  }

  li a {
    color: var(--text-color-secondary);
    padding: 0.5rem 1rem;
    border-radius: var(--border-radius);
    transition:
      color 0.2s ease,
      background-color 0.2s ease;
    font-weight: 500;
  }

  li a:hover {
    color: var(--text-color);
    background-color: rgba(0, 0, 0, 0.05);
    text-decoration: none;
  }

  li a.active {
    color: #ffffff;
    background-color: var(--primary-color);
  }
</style>
