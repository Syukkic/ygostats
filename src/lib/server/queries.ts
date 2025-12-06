import { database } from '$lib/server/db';
import type {
  CoinStats,
  MDWinLoseStats,
  MDDuelRecordInput,
  BO3MatchRecordInput,
  BO3DashboardLoadData,
  DCDuelRecordInput,
  DCWinLoseStats,
  DCPoint,
  DCVsDeckStat,
  DCEventCount
} from '$lib/types';

export function getCoinStats(startDate: string, endDate: string): CoinStats {
  const result = database
    .prepare(
      `SELECT
                IFNULL(SUM(CASE WHEN coin_flip = 'head' THEN 1 ELSE 0 END), 0) as heads,
                IFNULL(SUM(CASE WHEN coin_flip = 'tail' THEN 1 ELSE 0 END), 0) as tails,
                COUNT(coin_flip) as total_matches
            FROM md
			WHERE DATE(created_at) BETWEEN ? AND ?;`
    )
    .get(startDate, endDate) as CoinStats;

  return result;
}

export function getMDWinLoseStats(startDate: string, endDate: string): MDWinLoseStats {
  const result = database
    .prepare(
      `SELECT
              IFNULL(SUM(CASE WHEN duel_result = 'win' THEN 1 ELSE 0 END), 0) as totalWins,
              IFNULL(SUM(CASE WHEN go_first = 1 THEN 1 ELSE 0 END), 0) as firstCount,
              IFNULL(SUM(CASE WHEN go_first = 0 THEN 1 ELSE 0 END), 0) as secondCount,
              IFNULL(SUM(CASE WHEN duel_result = 'win' AND go_first = 1 THEN 1 ELSE 0 END), 0) as firstWins,
              IFNULL(SUM(CASE WHEN duel_result = 'win' AND go_first = 0 THEN 1 ELSE 0 END), 0) as secondWins,
              COUNT(duel_result) as totalMatches
            FROM md
			WHERE DATE(created_at) BETWEEN ? AND ?;`
    )
    .get(startDate, endDate) as MDWinLoseStats;

  return result;
}

export function createMDRecord(data: MDDuelRecordInput): void {
  database
    .prepare(
      `INSERT INTO md (coin_flip, duel_result, go_first, created_at)
			 VALUES (@coin_flip, @duel_result, @go_first, DATETIME('now', '+8 hours'))`
    )
    .run(data);
}

export const createBO3Record = database.transaction((data: BO3MatchRecordInput): number => {
  const matchStmt = database.prepare(`
        INSERT INTO bo3_matches (vs_desk, created_at)
        VALUES (@vs_desk, DATETIME('now', '+8 hours'))
    `);
  const result = matchStmt.run({ vs_desk: data.vs_desk });

  const match_id = result.lastInsertRowid;

  const duelStmt = database.prepare(`
        INSERT INTO bo3_duels (match_id, game_number, duel_result, go_first)
        VALUES (@match_id, @game_number, @duel_result, @go_first)
    `);

  for (const d of data.duels) {
    duelStmt.run({
      match_id,
      game_number: d.game_number,
      duel_result: d.duel_result,
      go_first: d.go_first
    });
  }

  return Number(match_id);
});

export function getBO3WinLoseStats(startDate: string, endDate: string): BO3DashboardLoadData[] {
  const result = database
    .prepare(
      `
			SELECT
            	bm.match_id,
            	bm.vs_desk,
            	MAX(CASE WHEN bd.game_number = 1 THEN bd.duel_result END) AS game1,
            	MAX(CASE WHEN bd.game_number = 2 THEN bd.duel_result END) AS game2,
            	MAX(CASE WHEN bd.game_number = 3 THEN bd.duel_result END) AS game3,
            	STRFTIME('%Y-%m-%d', bm.created_at) AS datetime
			FROM bo3_matches bm
			LEFT JOIN 
			    bo3_duels bd ON bm.match_id = bd.match_id
			WHERE Date(bm.created_at) BETWEEN ? AND ?
			GROUP BY bm.match_id, bm.vs_desk, bm.created_at
			ORDER BY bm.match_id ;
			`
    )
    .all(startDate, endDate) as BO3DashboardLoadData[];

  return result || [];
}

export function createDCRecord(data: DCDuelRecordInput): void {
  database
    .prepare(
      `INSERT INTO dc (coin_flip, duel_result, go_first, vs_desk, points, created_at)
			 VALUES (@coin_flip, @duel_result, @go_first, @vs_desk, @points, DATETIME('now', '+8 hours'))`
    )
    .run(data);
}

export function getDCEventByYearMonth() {
  const result = database
    .prepare(
      `
    SELECT
      STRFTIME('%Y-%m', d.created_at) AS year_month,
      COUNT(1) AS qty
    FROM dc d
    GROUP BY year_month
    ORDER BY year_month  DESC;
    `
    )
    .all() as DCEventCount[];

  return result;
}

export function getDCCoinStats(yearMonth: string): CoinStats {
  const result = database
    .prepare(
      `SELECT
                IFNULL(SUM(CASE WHEN coin_flip = 'head' THEN 1 ELSE 0 END), 0) as heads,
                IFNULL(SUM(CASE WHEN coin_flip = 'tail' THEN 1 ELSE 0 END), 0) as tails,
                COUNT(coin_flip) as total_matches
            FROM dc
			WHERE STRFTIME('%Y-%m', created_at) = ?;`
    )
    .get(yearMonth) as CoinStats;

  return result;
}

export function getDCWinLoseStats(yearMonth: string): DCWinLoseStats {
  const result = database
    .prepare(
      `SELECT
              IFNULL(SUM(CASE WHEN duel_result = 'win' THEN 1 ELSE 0 END), 0) as totalWins,
              IFNULL(SUM(CASE WHEN go_first = 1 THEN 1 ELSE 0 END), 0) as firstCount,
              IFNULL(SUM(CASE WHEN go_first = 0 THEN 1 ELSE 0 END), 0) as secondCount,
              IFNULL(SUM(CASE WHEN duel_result = 'win' AND go_first = 1 THEN 1 ELSE 0 END), 0) as firstWins,
              IFNULL(SUM(CASE WHEN duel_result = 'win' AND go_first = 0 THEN 1 ELSE 0 END), 0) as secondWins,
              COUNT(duel_result) as totalMatches
            FROM dc
			WHERE STRFTIME('%Y-%m', created_at) = ?;`
    )
    .get(yearMonth) as DCWinLoseStats;

  return result;
}

export function getDCPointsHistory(yearMonth: string): DCPoint[] {
  return database
    .prepare(
      `SELECT points, created_at
       FROM dc
       WHERE STRFTIME('%Y-%m', created_at) = ?
       ORDER BY created_at ASC`
    )
    .all(yearMonth) as DCPoint[];
}

export function getDCVsDeckStats(yearMonth: string): DCVsDeckStat[] {
  const totalMatchesResult = database
    .prepare(
      `SELECT COUNT(*) as count
       FROM dc
       WHERE STRFTIME('%Y-%m', created_at) = ?`
    )
    .get(yearMonth) as { count: number } | undefined;

  const totalMatches = totalMatchesResult?.count ?? 0;

  if (totalMatches === 0) {
    return [];
  }

  const deckCounts = database
    .prepare(
      `SELECT vs_desk, COUNT(*) as count
       FROM dc
       WHERE STRFTIME('%Y-%m', created_at) = ?
       GROUP BY vs_desk
       ORDER BY count DESC`
    )
    .all(yearMonth) as { vs_desk: string; count: number }[];

  return deckCounts.map((deck) => ({
    ...deck,
    percentage: (deck.count / totalMatches) * 100
  }));
}
