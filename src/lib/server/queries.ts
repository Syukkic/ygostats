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

export function getMDWinLoseStats(startDate: string, endDate: string) {
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

export function createMDRecord(data: { coin_flip: string; duel_result: string; go_first: number }) {
  database
    .prepare(
      `INSERT INTO md (coin_flip, duel_result, go_first, created_at)
			 VALUES (@coin_flip, @duel_result, @go_first, DATETIME('now', '+8 hours'))`
    )
    .run(data);
}

export const createBO3Record = database.transaction(
  (data: {
    vs_desk: string;
    duels: {
      game_number: number;
      duel_result: string;
      go_first: number;
    }[];
  }) => {
    console.log(data);
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

    return match_id;
  }
);

export function getBO3WinLoseStats(startDate: string, endDate: string) {
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
    .all(startDate, endDate) as
    | {
        match_id: number;
        vs_desk: string;
        game1: 'win' | 'lose' | null;
        game2: 'win' | 'lose' | null;
        game3: 'win' | 'lose' | null;
        datetime: string;
      }[]
    | undefined;

  return result;
}

export function createDCRecord(data: {
  coin_flip: string;
  duel_result: string;
  go_first: number;
  vs_desk: string | null;
  points: number;
}) {
  database
    .prepare(
      `INSERT INTO dc (coin_flip, duel_result, go_first, vs_desk, points, created_at)
			 VALUES (@coin_flip, @duel_result, @go_first, @vs_desk, @points, DATETIME('now', '+8 hours'))`
    )
    .run(data);
}
