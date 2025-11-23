import { fail, type Actions } from '@sveltejs/kit';
import { database } from '$lib/server/db';

function getTodayStr() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0');
	const day = String(today.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export async function load({ url }) {
	const today = getTodayStr();
	const startDate = url.searchParams.get('start_date') || today;
	const endDate = url.searchParams.get('end_date') || today;

	const whereClause = `WHERE DATE(created_at) BETWEEN ? AND ?`;

	const coinStatsResult = database
		.prepare(
			`SELECT
	                SUM(CASE WHEN coin_flip = 'Head' THEN 1 ELSE 0 END) as heads,
	                SUM(CASE WHEN coin_flip = 'Tail' THEN 1 ELSE 0 END) as tails,
	                COUNT(coin_flip) as total_matches
	            FROM records ${whereClause};`
		)
		.get(startDate, endDate) as { heads: number; tails: number; total_matches: number } | undefined;

	const coinStats = coinStatsResult || { heads: 0, tails: 0, total_matches: 0 };

	const winLoseStatsResult = database
		.prepare(
			`SELECT
	              SUM(CASE WHEN match_result = 'win' THEN 1 ELSE 0 END) as totalWins,
	              SUM(CASE WHEN is_first = 1 THEN 1 ELSE 0 END) as firstCount,
	              SUM(CASE WHEN is_first = 0 THEN 1 ELSE 0 END) as secondCount,
	              SUM(CASE WHEN match_result = 'win' AND is_first = 1 THEN 1 ELSE 0 END) as firstWins,
	              SUM(CASE WHEN match_result = 'win' AND is_first = 0 THEN 1 ELSE 0 END) as secondWins,
                COUNT(match_result) as totalMatches
	             FROM records ${whereClause};`
		)
		.get(startDate, endDate) as
		| {
				totalWins: number;
				firstCount: number;
				secondCount: number;
				firstWins: number;
				secondWins: number;
				totalMatches: number;
		  }
		| undefined;

	const winLoseStats = winLoseStatsResult || {
		totalWins: 0,
		firstCount: 0,
		secondCount: 0,
		firstWins: 0,
		secondWins: 0,
		totalMatches: 0
	};

	const totalWinRate = (winLoseStats.totalWins / coinStats.total_matches) * 100.0;
	const firstWinRate = (winLoseStats.firstWins / winLoseStats.firstCount) * 100.0;
	const secondWinRate = (winLoseStats.secondWins / winLoseStats.secondCount) * 100.0;

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

		const coinFlip = data.get('coin_flip');
		const matchResult = data.get('match_result');
		const is_first = data.get('is_first');

		if (
			typeof coinFlip !== 'string' ||
			typeof matchResult !== 'string' ||
			typeof is_first !== 'string'
		) {
			return { error: 'Invalid form data' };
		}

		const firstMap = { Yes: 1, No: 0 } as const;
		const isFirst = firstMap[is_first as keyof typeof firstMap];

		try {
			database
				.prepare(
					`INSERT INTO records (coin_flip, match_result, is_first)
			 VALUES (?, ?, ?)`
				)
				.bind(coinFlip, matchResult, isFirst)
				.run();
			return { success: true };
		} catch (error) {
			console.error('DB Error:', error);
			return fail(500, { message: 'Database error occurred.' });
		}
	}
};
