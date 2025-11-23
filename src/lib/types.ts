export interface RecordRow {
	id: number;
	coin_flip: 'Head' | 'Tail';
	match_result: 'Win' | 'Lost';
	is_first: 1 | 0;
	created_at: string;
}

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
