import { fail, type Actions } from '@sveltejs/kit';
import { createDCRecord } from '$lib/server/queries';
import { isCoinFlip, isDuelResult } from '$lib/utils';

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
