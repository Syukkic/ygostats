<script lang="ts">
  import { formatRate, resetDatesToToday } from '$lib/utils';
  import { onMount } from 'svelte';
  import type { PageData, ActionData } from './$types';
  import type { MDDashboardLoadData } from '$lib/types';

  let { data, form }: { data: PageData; form?: ActionData } = $props();
  let { winLoseStats, counts, startDate, endDate } = data as MDDashboardLoadData;

  let isSubmitting = $state(false);

  onMount(() => {
    const filterForm = document.getElementById('date-filter-form') as HTMLFormElement;
    const startDateInput = document.querySelector('input[name="start_date"]') as HTMLInputElement;
    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;

    if (filterForm && startDateInput && endDateInput) {
      filterForm.addEventListener('submit', (event) => {
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);

        if (start > end) {
          event.preventDefault(); // Prevent form submission
          alert('結束日期不能比開始日期早！');
        }
      });
    }
  });
</script>

<div class="dashboard-grid">
  <section class="left">
    <form method="post" action="?/createRecord" class="card">
      <h2>新增紀錄</h2>
      <div class="form-grid">
        <fieldset class="form-group">
          <legend class="visually-hidden">硬幣結果</legend>
          <div class="form-item-row">
            <span class="form-label">硬幣結果</span>
            <div class="radio-group">
              <label>
                <input type="radio" name="coin_flip" value="head" required />
                正面
              </label>
              <label>
                <input type="radio" name="coin_flip" value="tail" required />
                反面
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset class="form-group">
          <legend class="visually-hidden">是否先手</legend>
          <div class="form-item-row">
            <span class="form-label">是否先手</span>
            <div class="radio-group">
              <label>
                <input type="radio" name="go_first" value="1" required />
                先手
              </label>
              <label>
                <input type="radio" name="go_first" value="0" required />
                後手
              </label>
            </div>
          </div>
        </fieldset>

        <fieldset class="form-group">
          <legend class="visually-hidden">對局勝負</legend>
          <div class="form-item-row">
            <span class="form-label">對局勝負</span>
            <div class="radio-group">
              <label>
                <input type="radio" name="duel_result" value="win" required />
                勝利
              </label>
              <label>
                <input type="radio" name="duel_result" value="lose" required />
                失敗
              </label>
            </div>
          </div>
        </fieldset>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '保存中...' : '保存記錄'}
      </button>

      <div aria-live="polite" aria-atomic="true">
        {#if form?.success}
          <p class="text-success">紀錄已成功保存！</p>
        {/if}
      </div>
    </form>
  </section>

  <section class="right">
    <div class="card">
      <h2>篩選日期</h2>
      <form method="GET" data-sveltekit-reload id="date-filter-form" class="date-filter-form">
        <label>
          開始日期:
          <input type="date" name="start_date" value={startDate} />
        </label>
        <label>
          結束日期:
          <input type="date" name="end_date" value={endDate} />
        </label>
        <div class="form-actions">
          <button type="submit">篩選</button>
          <button type="button" class="secondary" onclick={resetDatesToToday}>今天</button>
        </div>
      </form>

      <h2 style="margin-top: var(--section-gap);">
        勝率與場次統計 ({startDate === endDate ? startDate : `${startDate} ~ ${endDate}`})
      </h2>
      <table>
        <caption class="visually-hidden">MD 總體勝率、先手勝率、後手勝率的詳細數據</caption>
        <thead>
          <tr>
            <th>項目</th>
            <th>總場次</th>
            <th>總勝場</th>
            <th>勝率</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>總計</td>
            <td>{counts.total}</td>
            <td>{winLoseStats.total}</td>
            <td>{formatRate(winLoseStats.totalWinRate)}</td>
          </tr>
          <tr>
            <td>先手</td>
            <td>{winLoseStats.firstCount}</td>
            <td>{winLoseStats.firstWins}</td>
            <td>{formatRate(winLoseStats.firstWinRate)}</td>
          </tr>
          <tr>
            <td>後手</td>
            <td>{winLoseStats.secondCount}</td>
            <td>{winLoseStats.secondWins}</td>
            <td>{formatRate(winLoseStats.secondWinRate)}</td>
          </tr>
        </tbody>
      </table>

      <h2 style="margin-top: var(--section-gap);">
        硬幣投擲計數 ({startDate === endDate ? startDate : `${startDate} ~ ${endDate}`})
      </h2>
      <table>
        <caption class="visually-hidden">硬幣投擲結果的正反面次數統計</caption>
        <thead>
          <tr>
            <th>結果</th>
            <th>次數</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>正面</td>
            <td>{counts.heads}</td>
          </tr>
          <tr>
            <td>反面</td>
            <td>{counts.tails}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</div>

<style>
  .right {
    display: flex;
    flex-direction: column;
    gap: var(--section-gap);
  }
  .date-filter-form {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    align-items: end;
  }
  .form-actions {
    display: flex;
    gap: 1rem;
  }
  .card h2 {
    margin-bottom: 1rem;
  }
  .form-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem 1.5rem;
  }
  .form-group {
    border: none;
    padding: 0;
    margin: 0;
  }
  .form-item-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .form-label {
    font-weight: 500;
    color: var(--text-color-secondary);
    flex-shrink: 0; /* Prevent label from shrinking */
  }
  .radio-group {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
  }
</style>
