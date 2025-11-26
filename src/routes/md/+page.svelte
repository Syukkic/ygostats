<script lang="ts">
	import Navigation from '$lib/components/Navigation.svelte';
	import type { DashBoardLoadData } from '$lib/types';
	import { formatRate, resetDatesToToday } from '$lib/utils';
	import type { ActionData, PageData } from './$types';
	import { onMount } from 'svelte';

	let { data, form }: { data: PageData; form?: ActionData } = $props();
	let { winLoseStats, counts, startDate, endDate } = data as DashBoardLoadData;

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

			startDateInput.addEventListener('change', (event) => {
				(event.target as HTMLInputElement).blur();
			});
			endDateInput.addEventListener('change', (event) => {
				(event.target as HTMLInputElement).blur();
			});
		}
	});
</script>

<Navigation />

<div class="dashboard-grid">
	<section class="left">
		<h2>新增紀錄</h2>
		<form method="post" action="?/createRecord">
			<fieldset>
				<legend>硬幣結果</legend>
				<label>
					<input type="radio" name="coin_flip" value="head" required />
					正面
				</label>
				<label>
					<input type="radio" name="coin_flip" value="tail" required />
					反面
				</label>
			</fieldset>

			<fieldset>
				<legend>是否先手</legend>
				<label>
					<input type="radio" name="go_first" value="1" required />
					先手
				</label>
				<label>
					<input type="radio" name="go_first" value="0" required />
					後手
				</label>
			</fieldset>

			<fieldset>
				<legend>對局勝負</legend>
				<label>
					<input type="radio" name="duel_result" value="win" required />
					勝利
				</label>
				<label>
					<input type="radio" name="duel_result" value="lose" required />
					失敗
				</label>
			</fieldset>

			<button type="submit">保存記錄</button>
		</form>

		{#if form?.success}
			<p style="color: green;">紀錄已成功保存！</p>
		{/if}
	</section>

	<section class="right">
		<section>
			<h2>篩選日期</h2>
			<form method="GET" data-sveltekit-reload id="date-filter-form">
				<label>
					開始日期:
					<input type="date" name="start_date" value={startDate} />
				</label>
				<label style="margin-left: 15px">
					結束日期:
					<input type="date" name="end_date" value={endDate} />
				</label>
				<button type="submit" style="margin-left: 15px">篩選</button>
				<button type="button" style="margin-left: 15px" onclick={resetDatesToToday}>今天</button>
			</form>
		</section>
		<h2 style="margin-top: 30px">
			勝率與場次統計 ({startDate === endDate ? startDate : `${startDate} ~ ${endDate}`})
		</h2>
		<table>
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

		<section style="margin-top: 30px;">
			<h2>硬幣投擲計數 ({startDate === endDate ? startDate : `${startDate} ~ ${endDate}`})</h2>
			<table>
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
		</section>
	</section>
</div>

<style>
	.dashboard-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 40px;
		align-items: start;
		padding: 2em;
		margin: 0 auto;
		max-width: 1600px;
	}

	.left {
		display: flex;
		flex-direction: column;
	}

	.right {
		text-align: left;
	}

	table {
		width: 100%;
		max-width: 500px;
		border-collapse: collapse;
		margin-top: 15px;
	}

	th,
	td {
		border: 1px solid #ccc;
		padding: 10px;
		text-align: left;
	}

	th {
		background-color: #f0f0f0;
	}

	fieldset {
		margin-bottom: 1em;
		border: 1px solid #ccc;
		border-radius: 4px;
		max-width: 50%;
	}

	@media (max-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: 1fr;
			margin: 2em;
			padding: 0;
		}

		.left,
		.right {
			padding-left: 0;
			padding-right: 0;
		}
	}

	@media (max-width: 768px) {
		.dashboard-grid {
			margin: 1em;
			gap: 20px;
		}

		h2 {
			font-size: 1.25rem;
		}

		button,
		input {
			font-size: 1rem;
		}
	}
</style>
