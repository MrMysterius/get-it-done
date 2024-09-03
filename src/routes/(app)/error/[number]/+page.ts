import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = (event) => {
	switch (event.params.number) {
		case '400':
			error(400, { message: 'Bad Request' });
			break;
		case '401':
			error(401, { message: 'Unauthorized' });
			break;
		case '403':
			error(403, { message: 'Forbidden' });
			break;
		case '404':
			error(404, { message: 'Not Found' });
			break;
		case '500':
			error(500, { message: 'Internal Server Error' });
			break;
		default:
			error(parseInt(event.params.number), { message: 'Error' });
			break;
	}
};
