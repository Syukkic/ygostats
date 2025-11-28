import { fail, type Actions } from '@sveltejs/kit';
import { createDCRecord } from '$lib/server/queries';
// import { getTodayStr } from '$lib/utils';
// import type { PageServerLoad } from './$types';

// export const load: PageServerLoad = async ({ url }) => {
//   const today = getTodayStr();
//   const startDate = url.searchParams.get('start_date') || today;
//   const endDate = url.searchParams.get('end_date') || today;
//
//   if (new Date(startDate) > new Date(endDate)) {
//     return fail(400, { message: '結束日期不能比開始日期早！' });
//   }
//
//   const coinStats = getCoinStats(startDate, endDate);
//   const winLoseStats = getMDWinLoseStats(startDate, endDate);
//
//   const totalWinRate =
//     coinStats.total_matches > 0 ? (winLoseStats.totalWins / coinStats.total_matches) * 100.0 : 0;
//   const firstWinRate =
//     winLoseStats.firstCount > 0 ? (winLoseStats.firstWins / winLoseStats.firstCount) * 100.0 : 0;
//   const secondWinRate =
//     winLoseStats.secondCount > 0 ? (winLoseStats.secondWins / winLoseStats.secondCount) * 100.0 : 0;
//
//   return {
//     startDate,
//     endDate,
//     winLoseStats: {
//       total: winLoseStats.totalWins,
//       totalWinRate: totalWinRate,
//       firstCount: winLoseStats.firstCount,
//       secondCount: winLoseStats.secondCount,
//       firstWins: winLoseStats.firstWins,
//       secondWins: winLoseStats.secondWins,
//       firstWinRate: firstWinRate,
//       secondWinRate: secondWinRate
//     },
//     counts: {
//       total: coinStats.total_matches,
//       heads: coinStats.heads,
//       tails: coinStats.tails
//     }
//   };
// };

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

    console.log(
      `coin_flip: ${coin_flip}, duel_result: ${duel_result}, go_first_str: ${go_first_str}, vs_desk: ${vs_desk}, dc_points_str: ${dc_points_str}`
    );

    const dc_points = Number(dc_points_str);
    if (!Number.isFinite(dc_points) || dc_points < 0) {
      return fail(400, { error: 'Invalid DC points value' });
    }

    try {
      createDCRecord({
        coin_flip,
        duel_result,
        go_first,
        vs_desk: typeof vs_desk === 'string' ? vs_desk : null,
        points: dc_points
      });
      return { success: true };
    } catch (error) {
      console.error('DB Error:', error);
      return fail(500, { message: 'Database error occurred.' });
    }
  }
};
