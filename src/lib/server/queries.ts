import { database } from '$lib/server/db';

const WHERE_CLAUSE = `WHERE DATE(created_at) BETWEEN ? AND ?`;

export function getCoinStats(startDate: string, endDate: string) {
	const result = database
		.prepare(
			`SELECT
                SUM(CASE WHEN coin_flip = 'head' THEN 1 ELSE 0 END) as heads,
                SUM(CASE WHEN coin_flip = 'tail' THEN 1 ELSE 0 END) as tails,
                COUNT(coin_flip) as total_matches
            FROM records ${WHERE_CLAUSE};`
		)
		.get(startDate, endDate) as { heads: number; tails: number; total_matches: number } | undefined;

	return result || { heads: 0, tails: 0, total_matches: 0 };
}

export function getWinLoseStats(startDate: string, endDate: string) {
	const result = database
		.prepare(
			`SELECT
              SUM(CASE WHEN match_result = 'win' THEN 1 ELSE 0 END) as totalWins,
              SUM(CASE WHEN is_first = 1 THEN 1 ELSE 0 END) as firstCount,
              SUM(CASE WHEN is_first = 0 THEN 1 ELSE 0 END) as secondCount,
              SUM(CASE WHEN match_result = 'win' AND is_first = 1 THEN 1 ELSE 0 END) as firstWins,
              SUM(CASE WHEN match_result = 'win' AND is_first = 0 THEN 1 ELSE 0 END) as secondWins,
              COUNT(match_result) as totalMatches
             FROM records ${WHERE_CLAUSE};`
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

	return (
		result || {
			totalWins: 0,
			firstCount: 0,
			secondCount: 0,
			firstWins: 0,
			secondWins: 0,
			totalMatches: 0
		}
	);
}

export function createRecord(data: {
	coin_flip: string;
	match_result: string;
	is_first: number;
}) {
	database
		.prepare(
			`INSERT INTO records (coin_flip, match_result, is_first)
			 VALUES (@coin_flip, @match_result, @is_first)`
		)
		.run(data);
}
