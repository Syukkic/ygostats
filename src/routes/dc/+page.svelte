<script lang="ts">
  import { formatRate } from '$lib/utils';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { onMount } from 'svelte';
  import {
    CategoryScale,
    Chart,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip
  } from 'chart.js';

  let { data, form }: { data: PageData; form?: ActionData } = $props();

  let isSubmitting = $state(false);
  let successMessage = $state<string | null>(null);
  let canvasElement = $state<HTMLCanvasElement | undefined>(undefined);
  let chartInstance = $state<Chart | undefined>(undefined);

  const createDateArray = data.pointsHistory.map((p) => p.created_at);
  const dcPointArray = data.pointsHistory.map((p) => p.points);

  onMount(() => {
    Chart.register(
      LineController,
      LineElement,
      PointElement,
      CategoryScale,
      LinearScale,
      Title,
      Tooltip,
      Legend
    );
    const ctx = canvasElement!.getContext('2d');
    if (!ctx) {
      console.error('Canvas context is null. Chart cannot be initialized.');
      return;
    }

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: createDateArray,
        datasets: [
          {
            label: 'DC分數',
            data: dcPointArray,
            fill: false,
            borderColor: '#007bff',
            backgroundColor: '#007bff'
          }
        ]
      }
    });
  });

  $effect(() => {
    if (!chartInstance) return;

    const createDateArray = data.pointsHistory.map((p) => p.created_at);
    const dcPointArray = data.pointsHistory.map((p) => p.points);

    chartInstance.data.labels = createDateArray;
    chartInstance.data.datasets[0].data = dcPointArray;
    chartInstance.update();
  });

  function resetForm(formElement: HTMLFormElement) {
    formElement.reset();
    const radioButtons = formElement.querySelectorAll<HTMLInputElement>('input[type="radio"]');
    radioButtons.forEach((radio) => (radio.checked = false));
    successMessage = '紀錄已成功保存！';
    setTimeout(() => (successMessage = null), 3000);
  }
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
          if (result.type === 'success') {
            resetForm(document.querySelector('.add-record-form') as HTMLFormElement);
            await update({ reset: false });
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
            <div class="options-group">
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
            <div class="options-group">
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
            <div class="options-group">
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

        <fieldset class="form-group">
          <legend class="visually-hidden">對手卡組</legend>
          <div class="form-item-row">
            <span class="form-label">對手卡組</span>
            <div class="options-group">
              <input
                type="text"
                id="vs_desk"
                name="vs_desk"
                maxlength="20"
                placeholder="例如：壹世壞"
              />
            </div>
          </div>
        </fieldset>

        <fieldset class="form-group">
          <legend class="visually-hidden">當前分數</legend>
          <div class="form-item-row">
            <span class="form-label">當前分數</span>
            <div class="options-group">
              <input
                type="number"
                id="dc_points"
                name="dc_points"
                maxlength="6"
                required
                min="0"
                placeholder="例如：30000"
              />
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
      <h2>篩選DC二階</h2>
      <form method="GET" class="event-filter-form">
        <select
          name="event"
          id="event-select"
          onchange={(event) => (event.currentTarget as HTMLSelectElement).form?.submit()}
          disabled={data.allDCEvents.length === 0}
        >
          {#if data.allDCEvents.length === 0}
            <option value="">沒有 DC 活動紀錄</option>
          {:else}
            {#each data.allDCEvents as dc_event (dc_event.year_month)}
              <option
                value={dc_event.year_month}
                selected={data.selectedEvent === dc_event.year_month}
              >
                {dc_event.year_month} &nbsp;&nbsp;&nbsp;&nbsp;（共{dc_event.qty}場）
              </option>
            {/each}
          {/if}
        </select>
        <noscript><button type="submit">篩選</button></noscript>
      </form>

      {#if data.selectedEvent && data.counts.total > 0}
        <h2 style="margin-top: var(--section-gap);">場次勝率 ({data.selectedEvent})</h2>
        <table>
          <caption class="visually-hidden">DC 總體勝率、先手勝率、後手勝率的詳細數據</caption>
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

        <h2 style="margin-top: var(--section-gap);">硬幣正反 ({data.selectedEvent})</h2>
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
              <td>{data.counts.heads}</td>
            </tr>
            <tr>
              <td>反面</td>
              <td>{data.counts.tails}</td>
            </tr>
          </tbody>
        </table>

        <h2 style="margin-top: var(--section-gap);">對手卡組分佈</h2>
        <table>
          <caption class="visually-hidden">對手卡組分佈統計</caption>
          <thead>
            <tr>
              <th>卡組</th>
              <th>次數</th>
              <th>佔比</th>
            </tr>
          </thead>
          <tbody>
            {#each data.vsDeckStats as deck (deck.vs_desk)}
              <tr>
                <td>{deck.vs_desk}</td>
                <td>{deck.count}</td>
                <td>{deck.percentage.toFixed(1)}%</td>
              </tr>
            {/each}
          </tbody>
        </table>

        <h2 style="margin-top: var(--section-gap);">分數走勢</h2>
        <div class="chart-container">
          <canvas bind:this={canvasElement}></canvas>
        </div>
      {:else if data.selectedEvent}
        <p style="margin-top: var(--section-gap);">該月份沒有數據。</p>
      {:else}
        <p style="margin-top: var(--section-gap);">
          請先新增一筆紀錄，或選擇一個活動以查看統計數據。
        </p>
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
  .event-filter-form {
    display: flex;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
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
  .options-group {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
</style>
