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
  game1: 'win' | 'lose' | null;
  game2: 'win' | 'lose' | null;
  game3: 'win' | 'lose' | null;
  datetime: string;
}
