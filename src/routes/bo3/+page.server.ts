import { createBO3Record, getBO3WinLoseStats } from '$lib/server/queries';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTodayStr, isDuelResult } from '$lib/utils';
import type { BO3Duel } from '$lib/types';

export const load: PageServerLoad = async ({ url }) => {
  const today = getTodayStr();
  const startDate = url.searchParams.get('start_date') || today;
  const endDate = url.searchParams.get('end_date') || today;
  if (new Date(startDate) > new Date(endDate)) {
    return fail(400, { message: '結束日期不能比開始日期早！' });
  }

  const matcHistory = getBO3WinLoseStats(startDate, endDate);

  return { matcHistory, startDate, endDate };
};

export const actions: Actions = {
  createRecord: async ({ request }) => {
    const data = await request.formData();

    const vs_desk = data.get('vs_desk') as string;
    const duels = [];
    let winCount = 0;
    let loseCount = 0;

    for (let i = 1; i <= 3; i++) {
      const go_first_str = data.get(`go_first_${i}`) as string | null;
      const duel_result_str = data.get(`duel_result_${i}`) as string | null;

      if (go_first_str && duel_result_str) {
        const go_first = Number(go_first_str);
        if (!isDuelResult(duel_result_str)) {
          return fail(400, { error: `Invalid result for game ${i}` });
        }

        if (duel_result_str === 'win') winCount++;
        if (duel_result_str === 'lose') loseCount++;

        duels.push({ game_number: i, go_first: go_first, duel_result: duel_result_str } as BO3Duel);

        if (winCount === 2 || loseCount === 2) break;
      }
    }

    if (duels.length < 2 || (winCount !== 2 && loseCount !== 2)) {
      return fail(400, { error: 'Bo3記錄不完整或邏輯錯誤。' });
    }

    try {
      const match_id = createBO3Record({
        vs_desk: vs_desk,
        duels: duels as BO3Duel[]
      });
      return { success: true, match_id: match_id };
    } catch (error) {
      console.error('DB Transaction Error:', error);
      return fail(500, { message: 'Database transaction failed.' });
    }
  }
};
