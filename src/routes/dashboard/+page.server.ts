import { database } from '$lib/server/db';

export async function load() {
	const coinStats = database
		.prepare(
			`SELECT
	                SUM(CASE WHEN coin_flip = 'Head' THEN 1 ELSE 0 END) as heads,
	                SUM(CASE WHEN coin_flip = 'Tail' THEN 1 ELSE 0 END) as tails,
	                COUNT(coin_flip) as total_matches
	            FROM records;`
		)
		.get() as { heads: number; tails: number; total_matches: number };

	const winLoseStats = database
		.prepare(
			`SELECT
	              SUM(CASE WHEN match_result = 'win' THEN 1 ELSE 0 END) as total_wins,
	              SUM(CASE WHEN is_first = 1 THEN 1 ELSE 0 END) as first_counts,
	              SUM(CASE WHEN is_first = 0 THEN 1 ELSE 0 END) as second_counts,
	              SUM(CASE WHEN match_result = 'win' AND is_first = 1 THEN 1 ELSE 0 END) as first_wins,
	              SUM(CASE WHEN match_result = 'win' AND is_first = 0 THEN 1 ELSE 0 END) as second_wins,
                COUNT(match_result) as total_matches
	             FROM records;`
		)
		.get() as {
		total_wins: number;
		first_counts: number;
		second_counts: number;
		first_wins: number;
		second_wins: number;
		total_matches: number;
	};

	const totalWins = winLoseStats.total_wins;
	const totalWinRate = (totalWins / coinStats.total_matches) * 100.0;
	const firstWinRate = (winLoseStats.first_wins / winLoseStats.first_counts) * 100.0;
	const secondWinRate = (winLoseStats.second_wins / winLoseStats.second_counts) * 100.0;

	return {
		winLoseStats: {
			total: totalWins,
			totalWinRate: totalWinRate,
			firstCount: winLoseStats.first_counts,
			secondCount: winLoseStats.second_counts,
			firstWins: winLoseStats.first_wins,
			secondWins: winLoseStats.second_wins,
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
