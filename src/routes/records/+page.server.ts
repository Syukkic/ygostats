import { fail, type Actions } from '@sveltejs/kit';
import { database } from '$lib/server/db';

export const actions: Actions = {
	createRecord: async ({ request }) => {
		const data = await request.formData();

		const coinFlip = data.get('coin_flip');
		const matchResult = data.get('match_result');
		const is_first = data.get('is_first');

		if (
			typeof coinFlip !== 'string' ||
			typeof matchResult !== 'string' ||
			typeof is_first !== 'string'
		) {
			return { error: 'Invalid form data' };
		}

		const firstMap = { Yes: 1, No: 0 } as const;
		const isFirst = firstMap[is_first as keyof typeof firstMap];

		try {
			database
				.prepare(
					`INSERT INTO records (coin_flip, match_result, is_first)
			 VALUES (?, ?, ?)`
				)
				.bind(coinFlip, matchResult, isFirst)
				.run();
			return { success: true };
		} catch (error) {
			console.error('DB Error:', error);
			return fail(500, { message: 'Database error occurred.' });
		}
	}
};
