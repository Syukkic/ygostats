import { fail, type Actions } from '@sveltejs/kit';
import {
  createDCRecord,
  getDCCoinStats,
  getDCWinLoseStats,
  getDCPointsHistory,
  getDCVsDeckStats,
  getDCEventByYearMonth
} from '$lib/server/queries';
import { isCoinFlip, isDuelResult } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const allDCEvents = getDCEventByYearMonth();
  const selectedEvent =
    url.searchParams.get('event') || (allDCEvents.length > 0 ? allDCEvents[0].year_month : null);

  if (!selectedEvent) {
    return {
      allDCEvents,
      selectedEvent: null,
      winLoseStats: {
        total: 0,
        totalWinRate: 0,
        firstCount: 0,
        secondCount: 0,
        firstWins: 0,
        secondWins: 0,
        firstWinRate: 0,
        secondWinRate: 0
      },
      counts: { total: 0, heads: 0, tails: 0, headCoinRate: 0, tailCoinRate: 0 },
      pointsHistory: [],
      vsDeckStats: []
    };
  }

  const coinStats = getDCCoinStats(selectedEvent);
  const winLoseStats = getDCWinLoseStats(selectedEvent);
  const pointsHistory = getDCPointsHistory(selectedEvent);
  const vsDeckStats = getDCVsDeckStats(selectedEvent);

  const totalMatches = winLoseStats.totalMatches;
  const totalWinRate = totalMatches > 0 ? (winLoseStats.totalWins / totalMatches) * 100.0 : 0;
  const firstWinRate =
    winLoseStats.firstCount > 0 ? (winLoseStats.firstWins / winLoseStats.firstCount) * 100.0 : 0;
  const secondWinRate =
    winLoseStats.secondCount > 0 ? (winLoseStats.secondWins / winLoseStats.secondCount) * 100.0 : 0;

  const headCoinRate =
    coinStats.total_matches > 0 ? (coinStats.heads / coinStats.total_matches) * 100.0 : 0;
  const tailCoinRate =
    coinStats.total_matches > 0 ? (coinStats.tails / coinStats.total_matches) * 100.0 : 0;

  return {
    allDCEvents,
    selectedEvent,
    winLoseStats: {
      total: winLoseStats.totalWins,
      totalWinRate: totalWinRate,
      firstCount: winLoseStats.firstCount,
      secondCount: winLoseStats.secondCount,
      firstWins: winLoseStats.firstWins,
      secondWins: winLoseStats.secondWins,
      firstWinRate: firstWinRate,
      secondWinRate: secondWinRate
    },
    counts: {
      total: totalMatches,
      heads: coinStats.heads,
      tails: coinStats.tails,
      headCoinRate: headCoinRate,
      tailCoinRate: tailCoinRate
    },
    pointsHistory,
    vsDeckStats
  };
};

export const actions: Actions = {
  createRecord: async ({ request }) => {
    const data = await request.formData();

    const coin_flip = data.get('coin_flip');
    const duel_result = data.get('duel_result');
    const go_first_str = data.get('go_first');
    const vs_desk = data.get('vs_desk');
    const dc_points_str = data.get('dc_points');

    if (
      typeof coin_flip !== 'string' ||
      typeof duel_result !== 'string' ||
      typeof go_first_str !== 'string' ||
      typeof dc_points_str !== 'string'
    ) {
      return fail(400, { error: 'Invalid form data' });
    }

    const go_first = Number(go_first_str);
    if (isNaN(go_first) || (go_first !== 0 && go_first !== 1)) {
      return fail(400, { error: 'Invalid value for is_first' });
    }

    const dc_points = Number(dc_points_str);
    if (!Number.isFinite(dc_points) || dc_points < 0) {
      return fail(400, { error: 'Invalid DC points value' });
    }

    if (!isCoinFlip(coin_flip)) {
      return fail(400, {
        error: `Invalid value for coin_flip: ${coin_flip}. Expected 'head' or 'tail'.`
      });
    }

    if (!isDuelResult(duel_result)) {
      return fail(400, {
        error: `Invalid value for duel_result: ${duel_result}. Expected 'win' or 'lose'.`
      });
    }

    let final_vs_desk: string | null = null;
    if (typeof vs_desk === 'string' && vs_desk.trim() !== '') {
      final_vs_desk = vs_desk.trim();
    } else {
      final_vs_desk = '未知卡組';
    }

    try {
      createDCRecord({
        coin_flip,
        duel_result,
        go_first,
        vs_desk: final_vs_desk,
        points: dc_points
      });
      return { success: true };
    } catch (error) {
      console.error('DB Error:', error);
      return fail(500, { message: 'Database error occurred.' });
    }
  }
};
