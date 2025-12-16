import { fail, type Actions } from '@sveltejs/kit';
import { getCoinStats, getMDWinLoseStats, createMDRecord } from '$lib/server/queries';
import { getTodayStr, isCoinFlip, isDuelResult } from '$lib/utils';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const today = getTodayStr();
  const startDate = url.searchParams.get('start_date') || today;
  const endDate = url.searchParams.get('end_date') || today;

  if (new Date(startDate) > new Date(endDate)) {
    return fail(400, { message: '結束日期不能比開始日期早！' });
  }

  const coinStats = getCoinStats(startDate, endDate);
  const winLoseStats = getMDWinLoseStats(startDate, endDate);

  const totalWinRate =
    coinStats.total_matches > 0 ? (winLoseStats.totalWins / coinStats.total_matches) * 100.0 : 0;
  const firstWinRate =
    winLoseStats.firstCount > 0 ? (winLoseStats.firstWins / winLoseStats.firstCount) * 100.0 : 0;
  const secondWinRate =
    winLoseStats.secondCount > 0 ? (winLoseStats.secondWins / winLoseStats.secondCount) * 100.0 : 0;

  const headCoinRate =
    coinStats.total_matches > 0 ? (coinStats.heads / coinStats.total_matches) * 100.0 : 0;
  const tailCoinRate =
    coinStats.total_matches > 0 ? (coinStats.tails / coinStats.total_matches) * 100.0 : 0;

  return {
    startDate,
    endDate,
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
      total: coinStats.total_matches,
      heads: coinStats.heads,
      tails: coinStats.tails,
      headCoinRate: headCoinRate,
      tailCoinRate: tailCoinRate
    }
  };
};

export const actions: Actions = {
  createRecord: async ({ request }) => {
    const data = await request.formData();

    const coin_flip = data.get('coin_flip');
    const duel_result = data.get('duel_result');
    const go_first_str = data.get('go_first');

    if (
      typeof coin_flip !== 'string' ||
      typeof duel_result !== 'string' ||
      typeof go_first_str !== 'string'
    ) {
      return fail(400, { error: 'Invalid form data' });
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

    const go_first = Number(go_first_str);

    if (isNaN(go_first) || (go_first !== 0 && go_first !== 1)) {
      return fail(400, { error: 'Invalid value for is_first' });
    }

    try {
      createMDRecord({ coin_flip, duel_result, go_first });
      return { success: true };
    } catch (error) {
      console.error('DB Error:', error);
      return fail(500, { message: 'Database error occurred.' });
    }
  }
};
