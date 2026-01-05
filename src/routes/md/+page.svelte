<script lang="ts">
  import { formatRate, resetDatesToToday } from '$lib/utils';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form?: ActionData } = $props();

  let isSubmitting = $state(false);
  let successMessage = $state<string | null>(null);
</script>

<div class="dashboard-grid">
  <section class="left">
    <form
      method="post"
      action="?/createRecord"
      class="card add-record-form"
      use:enhance={() => {
        isSubmitting = true;
        successMessage = null;
        return async ({ result, update }) => {
          await update();
          if (result.type === 'success') {
            successMessage = '紀錄已成功保存！';
            setTimeout(() => (successMessage = null), 3000);
          } else if (result.type === 'error') {
            console.error('Form submission error:', result.error);
          }
          isSubmitting = false;
        };
      }}
    >
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
        {#if form?.error}
          <p class="text-error">錯誤：{form.error}</p>
        {:else if successMessage}
          <p class="text-success">{successMessage}</p>
        {/if}
      </div>
    </form>
  </section>

  <section class="right">
    <div class="card">
      <h2>篩選日期</h2>
      <form method="GET" id="date-filter-form" class="date-filter-form">
        <label>
          開始日期
          <input type="date" name="start_date" value={data.startDate} />
        </label>
        <label>
          結束日期
          <input type="date" name="end_date" value={data.endDate} />
        </label>
        <div class="form-actions">
          <button type="submit">篩選</button>
          <button type="button" class="secondary" onclick={resetDatesToToday}>今天</button>
        </div>
      </form>

      {#if data.winLoseStats && data.counts}
        <h2 style="margin-top: var(--section-gap);">
          場次勝率 ({data.startDate === data.endDate
            ? data.startDate
            : `${data.startDate} ~ ${data.endDate}`})
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
              <td>{data.counts.total}</td>
              <td>{data.winLoseStats.total}</td>
              <td>{formatRate(data.winLoseStats.totalWinRate)}</td>
            </tr>
            <tr>
              <td>先手</td>
              <td>{data.winLoseStats.firstCount}</td>
              <td>{data.winLoseStats.firstWins}</td>
              <td>{formatRate(data.winLoseStats.firstWinRate)}</td>
            </tr>
            <tr>
              <td>後手</td>
              <td>{data.winLoseStats.secondCount}</td>
              <td>{data.winLoseStats.secondWins}</td>
              <td>{formatRate(data.winLoseStats.secondWinRate)}</td>
            </tr>
          </tbody>
        </table>

        <h2 style="margin-top: var(--section-gap);">
          硬幣正反 ({data.startDate === data.endDate
            ? data.startDate
            : `${data.startDate} ~ ${data.endDate}`})
        </h2>
        <table>
          <caption class="visually-hidden">硬幣投擲結果的正反面次數統計</caption>
          <thead>
            <tr>
              <th>結果</th>
              <th>次數</th>
              <th>佔比</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>正面</td>
              <td>{data.counts.heads}</td>
              <td>{formatRate(data.counts.headCoinRate)}</td>
            </tr>
            <tr>
              <td>反面</td>
              <td>{data.counts.tails}</td>
              <td>{formatRate(data.counts.tailCoinRate)}</td>
            </tr>
          </tbody>
        </table>
      {/if}
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
  .date-filter-form label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
  }
  .form-actions {
    display: flex;
    gap: 1rem;
  }
  .card h2 {
    margin-bottom: 1rem;
  }
  .form-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 1rem;
    align-items: center;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem 1.5rem;
    margin-bottom: 1rem;
  }
  .form-group {
    display: contents;
  }
  .form-item-row {
    display: contents;
  }
  .form-label {
    font-weight: 500;
    color: var(--text-color-secondary);
    justify-self: start;
  }
  .radio-group {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
</style>
