import { fail, type Actions } from '@sveltejs/kit';
import { getCoinStats, getWinLoseStats, createRecord } from '$lib/server/queries';
import { getTodayStr } from '$lib/utils';

export async function load({ url }) {
	const today = getTodayStr();
	const startDate = url.searchParams.get('start_date') || today;
	const endDate = url.searchParams.get('end_date') || today;

	if (new Date(startDate) > new Date(endDate)) {
		return fail(400, { message: '結束日期不能比開始日期早！' });
	}

	const coinStats = getCoinStats(startDate, endDate);
	const winLoseStats = getWinLoseStats(startDate, endDate);

	const totalWinRate =
		coinStats.total_matches > 0 ? (winLoseStats.totalWins / coinStats.total_matches) * 100.0 : 0;
	const firstWinRate =
		winLoseStats.firstCount > 0 ? (winLoseStats.firstWins / winLoseStats.firstCount) * 100.0 : 0;
	const secondWinRate =
		winLoseStats.secondCount > 0 ? (winLoseStats.secondWins / winLoseStats.secondCount) * 100.0 : 0;

	return {
		startDate,
		endDate,
		winLoseStats: {
			total: winLoseStats.totalWins,
			totalWinRate: totalWinRate,
			firstCount: winLoseStats.firstCount,
			secondCount: winLoseStats.secondCount,
			firstWins: winLoseStats.firstWins,
			secondWins: winLoseStats.secondWins,
			firstWinRate: firstWinRate,
			secondWinRate: secondWinRate
		},
		counts: {
			total: coinStats.total_matches,
			heads: coinStats.heads,
			tails: coinStats.tails
		}
	};
}

export const actions: Actions = {
	createRecord: async ({ request }) => {
		const data = await request.formData();

		const coin_flip = data.get('coin_flip');
		const match_result = data.get('match_result');
		const is_first_str = data.get('is_first');

		if (
			typeof coin_flip !== 'string' ||
			typeof match_result !== 'string' ||
			typeof is_first_str !== 'string'
		) {
			return fail(400, { error: 'Invalid form data' });
		}

		const is_first = Number(is_first_str);

		if (isNaN(is_first) || (is_first !== 0 && is_first !== 1)) {
			return fail(400, { error: 'Invalid value for is_first' });
		}

		try {
			createRecord({ coin_flip, match_result, is_first });
			return { success: true };
		} catch (error) {
			console.error('DB Error:', error);
			return fail(500, { message: 'Database error occurred.' });
		}
	}
};
