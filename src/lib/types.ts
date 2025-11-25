export interface DashBoardLoadData {
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
