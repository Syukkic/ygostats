import { database } from '$lib/server/db';

export function getCoinStats(startDate: string, endDate: string) {
  const result = database
    .prepare(
      `SELECT
                SUM(CASE WHEN coin_flip = 'head' THEN 1 ELSE 0 END) as heads,
                SUM(CASE WHEN coin_flip = 'tail' THEN 1 ELSE 0 END) as tails,
                COUNT(coin_flip) as total_matches
            FROM md
			WHERE DATE(created_at) BETWEEN ? AND ?;`
    )
    .get(startDate, endDate) as { heads: number; tails: number; total_matches: number } | undefined;

  return result || { heads: 0, tails: 0, total_matches: 0 };
}

export function getWinLoseStats(startDate: string, endDate: string) {
  const result = database
    .prepare(
      `SELECT
              SUM(CASE WHEN duel_result = 'win' THEN 1 ELSE 0 END) as totalWins,
              SUM(CASE WHEN go_first = 1 THEN 1 ELSE 0 END) as firstCount,
              SUM(CASE WHEN go_first = 0 THEN 1 ELSE 0 END) as secondCount,
              SUM(CASE WHEN duel_result = 'win' AND go_first = 1 THEN 1 ELSE 0 END) as firstWins,
              SUM(CASE WHEN duel_result = 'win' AND go_first = 0 THEN 1 ELSE 0 END) as secondWins,
              COUNT(duel_result) as totalMatches
            FROM md
			WHERE DATE(created_at) BETWEEN ? AND ?;`
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

export function createRecord(data: { coin_flip: string; duel_result: string; go_first: number }) {
  database
    .prepare(
      `INSERT INTO md (coin_flip, duel_result, go_first)
			 VALUES (@coin_flip, @duel_result, @go_first)`
    )
    .run(data);
}
