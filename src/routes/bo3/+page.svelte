<script lang="ts">
  import { formatDuelResult, resetDatesToToday } from '$lib/utils';
  import type { PageData, ActionData } from './$types';
  import { onMount } from 'svelte';

  let { data, form }: { data: PageData; form?: ActionData } = $props();
  let { matcHistory, startDate, endDate } = data;

  let g1Result = $state<'win' | 'lose' | ''>('');
  let g2Result = $state<'win' | 'lose' | ''>('');
  let g3Result = $state<'win' | 'lose' | ''>('');
  let g3First = $state<'1' | '0' | ''>('');
  let vsDesk = $state<string>('');
  let showSuccess = $state(false);
  let isSubmitting = $state(false);

  const score = $derived({
    win: (g1Result === 'win' ? 1 : 0) + (g2Result === 'win' ? 1 : 0),
    lose: (g1Result === 'lose' ? 1 : 0) + (g2Result === 'lose' ? 1 : 0)
  });
  const isCompleteG1G2 = $derived(!!g1Result && !!g2Result);
  const needG3 = $derived(isCompleteG1G2 && score.win === 1 && score.lose === 1);
  const isG3Filled = $derived(!!g3Result && !!g3First);

  const canSubmit = $derived(
    !!vsDesk && isCompleteG1G2 && (score.win === 2 || score.lose === 2 || (needG3 && isG3Filled))
  );

  onMount(() => {
    const filterForm = document.getElementById('date-filter-form') as HTMLFormElement;
    const startDateInput = document.querySelector('input[name="start_date"]') as HTMLInputElement;
    const endDateInput = document.querySelector('input[name="end_date"]') as HTMLInputElement;

    if (filterForm && startDateInput && endDateInput) {
      filterForm.addEventListener('submit', (event) => {
        const start = new Date(startDateInput.value);
        const end = new Date(endDateInput.value);

        if (start > end) {
          event.preventDefault();
          alert('結束日期不能比開始日期早！');
        }
      });
    }
  });
</script>

<div class="dashboard-grid">
  <section class="left">
    <form method="post" action="?/createRecord" class="card add-record-form">
      <h2>新增紀錄</h2>

      <fieldset>
        <div class="bo3-full-record-grid">
          <div class="header-row">
            <div>局數</div>
            <div>是否先手</div>
            <div>本局勝負</div>
          </div>

          <!-- Game 1 -->

          <div class="game-row" data-game="1">
            <h4>G1</h4>

            <select name="go_first_1" required aria-label="Game 1 Go First or Second">
              <option value="">-</option>

              <option value="1">先手</option>

              <option value="0">後手</option>
            </select>

            <select name="duel_result_1" required bind:value={g1Result} aria-label="Game 1 Result">
              <option value="">-</option>

              <option value="win">勝利</option>

              <option value="lose">失敗</option>
            </select>
          </div>

          <!-- Game 2 -->

          <div class="game-row" data-game="2">
            <h4>G2</h4>

            <select name="go_first_2" required aria-label="Game 2 Go First or Second">
              <option value="">-</option>

              <option value="1">先手</option>

              <option value="0">後手</option>
            </select>

            <select name="duel_result_2" required bind:value={g2Result} aria-label="Game 2 Result">
              <option value="">-</option>

              <option value="win">勝利</option>

              <option value="lose">失敗</option>
            </select>
          </div>

          <!-- Game 3 -->

          <div class="game-row optional" data-game="3">
            <h4>G3</h4>

            <select
              name="go_first_3"
              disabled={!needG3}
              bind:value={g3First}
              aria-label="Game 3 Go First or Second"
            >
              <option value="">-</option>

              <option value="1">先手</option>

              <option value="0">後手</option>
            </select>

            <select
              name="duel_result_3"
              disabled={!needG3}
              bind:value={g3Result}
              aria-label="Game 3 Result"
            >
              <option value="">-</option>

              <option value="win">勝利</option>

              <option value="lose">失敗</option>
            </select>
          </div>
          <div class="game-row optional">
            <h4>對手卡組</h4>
            <input
              type="text"
              id="vs_desk"
              name="vs_desk"
              maxlength="20"
              placeholder="例如：壹世壞"
              required
              bind:value={vsDesk}
            />
          </div>
        </div>
      </fieldset>

      <button type="submit" disabled={!canSubmit || isSubmitting}>
        {isSubmitting ? '保存中...' : '保存記錄'}
      </button>

      <div aria-live="polite" aria-atomic="true">
        {#if form?.error}
          <p class="text-error">錯誤：{form.error}</p>
        {:else if needG3 && (!g3Result || !g3First)}
          <p class="text-warning">比數 1:1，請填寫 G3 結果。</p>
        {:else if showSuccess}
          <p class="text-success">紀錄已成功保存！</p>
        {/if}
      </div>
    </form>
  </section>

  <section class="right">
    <div class="card">
      <h2>對局記錄</h2>

      <form method="GET" data-sveltekit-reload id="date-filter-form" class="date-filter-form">
        <label>
          開始日期
          <input type="date" name="start_date" value={startDate} />
        </label>

        <label>
          結束日期

          <input type="date" name="end_date" value={endDate} />
        </label>

        <div class="form-actions">
          <button type="submit">篩選</button>

          <button type="button" class="secondary" onclick={resetDatesToToday}>今天</button>
        </div>
      </form>

      {#if matcHistory && matcHistory.length > 0}
        <div class="table-wrapper">
          <table>
            <caption class="visually-hidden"
              >BO3 歷史對局記錄，包含對手卡組、每局結果和最終比分</caption
            >

            <thead>
              <tr>
                <th>日期</th>

                <th>對手卡組</th>

                <th>G1</th>

                <th>G2</th>

                <th>G3</th>

                <th>結果</th>
              </tr>
            </thead>

            <tbody>
              {#each matcHistory as match (match.match_id)}
                {@const matchWin =
                  (match.game1 === 'win' ? 1 : 0) +
                  (match.game2 === 'win' ? 1 : 0) +
                  (match.game3 === 'win' ? 1 : 0)}

                {@const matchLose =
                  (match.game1 === 'lose' ? 1 : 0) +
                  (match.game2 === 'lose' ? 1 : 0) +
                  (match.game3 === 'lose' ? 1 : 0)}

                <tr class:match-win={matchWin > matchLose} class:match-lose={matchLose > matchWin}>
                  <td>{match.datetime}</td>

                  <td>{match.vs_desk}</td>

                  <td>
                    {formatDuelResult(match.game1)}

                    <span class="visually-hidden">{match.game1}</span>
                  </td>

                  <td>
                    {formatDuelResult(match.game2)}

                    <span class="visually-hidden">{match.game2}</span>
                  </td>

                  <td>
                    {formatDuelResult(match.game3)}

                    <span class="visually-hidden">{match.game3}</span>
                  </td>

                  <td>
                    <strong
                      aria-label={`Result: ${matchWin > matchLose ? 'Win' : 'Lose'} ${matchWin} to ${matchLose}`}
                      >{matchWin}:{matchLose}</strong
                    >
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p>該日期範圍內沒有 BO3 記錄。</p>
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
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
  }
  .bo3-full-record-grid {
    display: grid;
    grid-template-columns: 40px 1fr 1fr;
    gap: 10px;
    align-items: center;
    margin-bottom: 1rem;
  }

  .header-row {
    display: contents;
    font-weight: bold;
    text-align: center;
  }

  .header-row > div:first-child {
    text-align: left;
  }

  .game-row {
    display: contents;
  }

  .game-row h4 {
    grid-column: 1;
    margin: 0;
    text-align: left;
  }

  .game-row input[type='text'] {
    grid-column: 2 / span 2;
  }

  .match-win {
    background-color: var(--win-bg-color);
  }
  .match-lose {
    background-color: var(--lose-bg-color);
  }
</style>
