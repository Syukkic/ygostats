<script lang="ts">
  import { resolve } from '$app/paths';
</script>

<div class="home-container">
  <section class="hero">
    <h1>个人遊戲王數據記錄</h1>
  </section>

  <section class="card-grid">
    <a href={resolve('/md')} class="card">
      <h2>Master Duel</h2>
      <p>記錄天梯勝率和硬幣運氣</p>
    </a>

    <a href={resolve('/bo3')} class="card">
      <h2>BO3比賽</h2>
      <p>記錄BO3比賽情況</p>
    </a>

    <a href={resolve('/dc')} class="card">
      <h2>Duelist Cup</h2>
      <p>記錄參與DC盃的分數</p>
    </a>
  </section>
</div>

<style>
  .home-container {
    padding: 2rem 0;
    text-align: center;
  }

  .hero {
    margin-bottom: 3rem;
  }

  .hero h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 960px;
    margin: 0 auto;
  }

  .card {
    background-color: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius-lg);
    padding: 2rem;
    text-decoration: none;
    color: var(--text-color);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    box-shadow: var(--shadow-sm);
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }

  .card h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .card p {
    color: var(--text-color-secondary);
    line-height: 1.6;
  }
</style>
