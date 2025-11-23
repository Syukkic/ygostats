<script lang="ts">
	import type { DashBoardLoadData } from '$lib/types';
	import type { PageProps } from '../$types';

	let { data }: PageProps = $props();
	let { winLoseStats, counts } = data as DashBoardLoadData;

	function formatRate(rate: number): string {
		if (typeof rate !== 'number' || isNaN(rate)) return 'N/A';
		return `${rate.toFixed(1)}%`;
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<section>
	<h2>勝率與場次統計</h2>
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
</section>

<section style="margin-top: 30px;">
	<h2>硬幣投擲計數</h2>
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

<style>
	table {
		width: 100%;
		max-width: 600px;
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
</style>
