import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import * as queries from './queries';
import type { BO3MatchRecordInput, DCDuelRecordInput, MDDuelRecordInput } from '$lib/types';

interface MDRecordForTest {
  coin_flip: 'head' | 'tail';
  duel_result: 'win' | 'lose';
  go_first: 0 | 1;
}

interface BO3MatchRecordForTest {
  vs_desk: string;
}

interface BO3DuelRecordForTest {
  game_number: 1 | 2 | 3;
  duel_result: 'win' | 'lose';
  go_first: 0 | 1;
}

interface DCRecordForTest {
  coin_flip: 'head' | 'tail';
  duel_result: 'win' | 'lose';
  go_first: 0 | 1;
  vs_desk: string | null;
  points: number;
}

vi.mock('$lib/server/db', () => {
  const mockDb = new Database(':memory:');
  const initSql = `
        CREATE TABLE IF NOT EXISTS md (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           coin_flip TEXT NOT NULL CHECK (coin_flip IN ('head', 'tail')),
           duel_result TEXT NOT NULL CHECK (duel_result IN ('win', 'lose')),
           go_first INTEGER NOT NULL CHECK (go_first IN (0, 1)),
           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS dc (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           coin_flip TEXT NOT NULL CHECK (coin_flip IN ('head', 'tail')),
           duel_result TEXT NOT NULL CHECK (duel_result IN ('win', 'lose')),
           go_first INTEGER NOT NULL CHECK (go_first IN (0, 1)),
           vs_desk TEXT,
           points INTEGER,
           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bo3_matches (
           match_id INTEGER PRIMARY KEY AUTOINCREMENT,
           vs_desk TEXT NOT NULL,
           created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bo3_duels (
           duel_id INTEGER PRIMARY KEY AUTOINCREMENT,
           match_id INTEGER NOT NULL,
           game_number INTEGER NOT NULL CHECK (game_number IN (1, 2, 3)),
           duel_result TEXT NOT NULL CHECK (duel_result IN ('win', 'lose')),
           go_first INTEGER NOT NULL CHECK (go_first IN (0, 1)),

           UNIQUE(match_id, game_number), 
           FOREIGN KEY (match_id) REFERENCES bo3_matches(match_id) ON DELETE CASCADE
         );
    `;
  mockDb.exec(initSql);
  return { database: mockDb };
});

const { database } = await import('$lib/server/db');

describe('queries.ts', () => {
  beforeEach(() => {
    database.exec(`
      DELETE FROM md;
      DELETE FROM dc;
      DELETE FROM bo3_matches;
      DELETE FROM bo3_duels;
    `);
  });

  describe('getCoinStats', () => {
    it('should return default stats when no records exist', () => {
      const stats = queries.getCoinStats('2023-01-01', '2023-01-31');
      expect(stats).toEqual({ heads: 0, tails: 0, total_matches: 0 });
    });

    it('should return correct coin flip statistics', () => {
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('head', 'win', 1, '2023-01-15 10:00:00');
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('tail', 'lose', 0, '2023-01-16 11:00:00');
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('head', 'win', 1, '2023-01-17 12:00:00');

      const stats = queries.getCoinStats('2023-01-01', '2023-01-31');
      expect(stats).toEqual({ heads: 2, tails: 1, total_matches: 3 });
    });

    it('should filter by date range', () => {
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('head', 'win', 1, '2023-01-01 10:00:00');
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('tail', 'lose', 0, '2023-01-15 11:00:00');
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('head', 'win', 1, '2023-02-01 12:00:00'); // Outside range

      const stats = queries.getCoinStats('2023-01-01', '2023-01-31');
      expect(stats).toEqual({ heads: 1, tails: 1, total_matches: 2 });
    });
  });

  describe('getMDWinLoseStats', () => {
    it('should return default stats when no records exist', () => {
      const stats = queries.getMDWinLoseStats('2023-01-01', '2023-01-31');
      expect(stats).toEqual({
        totalWins: 0,
        firstCount: 0,
        secondCount: 0,
        firstWins: 0,
        secondWins: 0,
        totalMatches: 0
      });
    });

    it('should return correct win/lose and go-first/second statistics', () => {
      // three matches
      // win, go_first (head)
      // lose, go_second (tail)
      // win, go_first (head)
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('head', 'win', 1, '2023-01-15 10:00:00');
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('tail', 'lose', 0, '2023-01-16 11:00:00');
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('head', 'win', 1, '2023-01-17 12:00:00');

      // two matches
      // lose, go_first (tail)
      // win, go_second (head)
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('tail', 'lose', 1, '2023-01-18 13:00:00');
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('head', 'win', 0, '2023-01-19 14:00:00');

      const stats = queries.getMDWinLoseStats('2023-01-01', '2023-01-31');
      expect(stats).toEqual({
        totalWins: 3, // (1,3,5)
        firstCount: 3, // (1,3,4)
        secondCount: 2, // (2,5)
        firstWins: 2, // (1,3)
        secondWins: 1, // (5)
        totalMatches: 5
      });
    });

    it('should filter by date range', () => {
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('head', 'win', 1, '2023-01-01 10:00:00');
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('tail', 'lose', 0, '2023-01-15 11:00:00');
      database
        .prepare(
          'INSERT INTO md (coin_flip, duel_result, go_first, created_at) VALUES (?, ?, ?, ?)'
        )
        .run('head', 'win', 1, '2023-02-01 12:00:00'); // Outside range

      const stats = queries.getMDWinLoseStats('2023-01-01', '2023-01-31');
      expect(stats).toEqual({
        totalWins: 1,
        firstCount: 1,
        secondCount: 1,
        firstWins: 1,
        secondWins: 0,
        totalMatches: 2
      });
    });
  });

  describe('createMDRecord', () => {
    it('should insert a new MD record', () => {
      const initialCount = (
        database.prepare('SELECT COUNT(*) as count FROM md').get() as { count: number }
      ).count;
      expect(initialCount).toBe(0);

      const recordData: MDDuelRecordInput = { coin_flip: 'head', duel_result: 'win', go_first: 1 };
      queries.createMDRecord(recordData);

      const finalCount = (
        database.prepare('SELECT COUNT(*) as count FROM md').get() as { count: number }
      ).count;
      expect(finalCount).toBe(1);

      const record = database
        .prepare('SELECT coin_flip, duel_result, go_first FROM md')
        .get() as MDRecordForTest;
      expect(record).toEqual({ coin_flip: 'head', duel_result: 'win', go_first: 1 });
    });
  });

  describe('createBO3Record', () => {
    it('should insert a new BO3 match and its duels', () => {
      const initialMatchesCount = (
        database.prepare('SELECT COUNT(*) as count FROM bo3_matches').get() as { count: number }
      ).count;
      const initialDuelsCount = (
        database.prepare('SELECT COUNT(*) as count FROM bo3_duels').get() as { count: number }
      ).count;
      expect(initialMatchesCount).toBe(0);
      expect(initialDuelsCount).toBe(0);

      const data: BO3MatchRecordInput = {
        vs_desk: 'Kashtira',
        duels: [
          { game_number: 1, duel_result: 'win', go_first: 1 },
          { game_number: 2, duel_result: 'lose', go_first: 0 }
        ]
      };
      const matchId = queries.createBO3Record(data);

      const finalMatchesCount = (
        database.prepare('SELECT COUNT(*) as count FROM bo3_matches').get() as { count: number }
      ).count;
      const finalDuelsCount = (
        database.prepare('SELECT COUNT(*) as count FROM bo3_duels').get() as { count: number }
      ).count;

      expect(finalMatchesCount).toBe(1);
      expect(finalDuelsCount).toBe(2);

      const match = database
        .prepare('SELECT vs_desk FROM bo3_matches WHERE match_id = ?')
        .get(matchId) as BO3MatchRecordForTest;
      expect(match).toEqual({ vs_desk: 'Kashtira' });

      const duels = database
        .prepare(
          'SELECT game_number, duel_result, go_first FROM bo3_duels WHERE match_id = ? ORDER BY game_number'
        )
        .all(matchId) as BO3DuelRecordForTest[];
      expect(duels).toEqual([
        { game_number: 1, duel_result: 'win', go_first: 1 },
        { game_number: 2, duel_result: 'lose', go_first: 0 }
      ]);
    });
  });

  describe('getBO3WinLoseStats', () => {
    it('should return empty array when no records exist', () => {
      const stats = queries.getBO3WinLoseStats('2023-01-01', '2023-01-31');
      expect(stats).toEqual([]);
    });

    it('should return correct BO3 match statistics', () => {
      // Match 1: vs Kashtira, G1 Win, G2 Lose, G3 Win
      const match1Id = queries.createBO3Record({
        vs_desk: 'Kashtira',
        duels: [
          { game_number: 1, duel_result: 'win', go_first: 1 },
          { game_number: 2, duel_result: 'lose', go_first: 0 },
          { game_number: 3, duel_result: 'win', go_first: 1 }
        ]
      });
      database
        .prepare('UPDATE bo3_matches SET created_at = ? WHERE match_id = ?')
        .run('2023-01-15 10:00:00', match1Id);

      // Match 2: vs Branded, G1 Lose, G2 Win (incomplete match)
      const match2Id = queries.createBO3Record({
        vs_desk: 'Branded',
        duels: [
          { game_number: 1, duel_result: 'lose', go_first: 0 },
          { game_number: 2, duel_result: 'win', go_first: 1 }
        ]
      });
      database
        .prepare('UPDATE bo3_matches SET created_at = ? WHERE match_id = ?')
        .run('2023-01-16 11:00:00', match2Id);

      const stats = queries.getBO3WinLoseStats('2023-01-01', '2023-01-31');
      expect(stats).toHaveLength(2);
      expect(stats).toEqual([
        {
          match_id: match1Id,
          vs_desk: 'Kashtira',
          game1: 'win',
          game2: 'lose',
          game3: 'win',
          datetime: '2023-01-15'
        },
        {
          match_id: match2Id,
          vs_desk: 'Branded',
          game1: 'lose',
          game2: 'win',
          game3: null,
          datetime: '2023-01-16'
        }
      ]);
    });

    it('should filter by date range', () => {
      // Match 1: In range
      const result1 = queries.createBO3Record({
        vs_desk: 'Kashtira',
        duels: [{ game_number: 1, duel_result: 'win', go_first: 1 }]
      });
      database
        .prepare('UPDATE bo3_matches SET created_at = ? WHERE match_id = ?')
        .run('2023-01-05 10:00:00', result1);

      // Match 2: Out of range
      const result2 = queries.createBO3Record({
        vs_desk: 'Branded',
        duels: [{ game_number: 1, duel_result: 'lose', go_first: 0 }]
      });
      database
        .prepare('UPDATE bo3_matches SET created_at = ? WHERE match_id = ?')
        .run('2023-02-01 11:00:00', result2);

      const stats = queries.getBO3WinLoseStats('2023-01-01', '2023-01-31');
      expect(stats).toHaveLength(1);
      expect(stats?.[0].vs_desk).toBe('Kashtira');
    });
  });

  describe('createDCRecord', () => {
    it('should insert a new DC record', () => {
      const initialCount = (
        database.prepare('SELECT COUNT(*) as count FROM dc').get() as { count: number }
      ).count;
      expect(initialCount).toBe(0);

      const recordData: DCDuelRecordInput = {
        coin_flip: 'tail',
        duel_result: 'win',
        go_first: 0,
        vs_desk: 'Spright',
        points: 500
      };
      queries.createDCRecord(recordData);

      const finalCount = (
        database.prepare('SELECT COUNT(*) as count FROM dc').get() as { count: number }
      ).count;
      expect(finalCount).toBe(1);

      const record = database
        .prepare('SELECT coin_flip, duel_result, go_first, vs_desk, points FROM dc')
        .get() as DCRecordForTest;
      expect(record).toEqual({
        coin_flip: 'tail',
        duel_result: 'win',
        go_first: 0,
        vs_desk: 'Spright',
        points: 500
      });
    });

    it('should insert a new DC record with null vs_desk', () => {
      const recordData: DCDuelRecordInput = {
        coin_flip: 'head',
        duel_result: 'lose',
        go_first: 1,
        vs_desk: null,
        points: 100
      };
      queries.createDCRecord(recordData);

      const record = database.prepare('SELECT vs_desk FROM dc').get() as Pick<
        DCRecordForTest,
        'vs_desk'
      >;
      expect(record.vs_desk).toBeNull();
    });
  });
});
