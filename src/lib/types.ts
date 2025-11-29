// Shared literal types
export type CoinFlip = 'head' | 'tail';
export type DuelResult = 'win' | 'lose';
export type GoFirst = 0 | 1;

// --- Database Record Input Types ---

export interface MDDuelRecordInput {
  coin_flip: CoinFlip;
  duel_result: DuelResult;
  go_first: GoFirst;
}

export interface DCDuelRecordInput extends MDDuelRecordInput {
  vs_desk: string | null;
  points: number;
}

export interface BO3Duel {
  game_number: 1 | 2 | 3;
  duel_result: DuelResult;
  go_first: GoFirst;
}

export interface BO3MatchRecordInput {
  vs_desk: string;
  duels: BO3Duel[];
}

// --- Database Query Return Types ---

export interface CoinStats {
  heads: number;
  tails: number;
  total_matches: number;
}

export interface MDWinLoseStats {
  totalWins: number;
  firstCount: number;
  secondCount: number;
  firstWins: number;
  secondWins: number;
  totalMatches: number;
}

// --- SvelteKit Page Load Data Types ---

export interface MDDashboardLoadData {
  startDate: string;
  endDate: string;
  winLoseStats: {
    total: number;
    totalWinRate: number;
    firstWins: number;

    firstCount: number;
    secondCount: number;
    secondWins: number;
    firstWinRate: number;
    secondWinRate: number;
  };
  counts: {
    total: number;
    heads: number;
    tails: number;
  };
}

export interface BO3DashboardLoadData {
  match_id: number;
  vs_desk: string;
  game1: DuelResult | null;
  game2: DuelResult | null;
  game3: DuelResult | null;
  datetime: string;
}
