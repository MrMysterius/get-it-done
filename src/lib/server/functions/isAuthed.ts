import { error, type RequestEvent } from '@sveltejs/kit';

export function isAuthed(e: RequestEvent) {
	if (!e.locals.auth.isAuthed || !e.locals.auth.user) {
		if (e.locals.auth.isATExpired && !e.locals.auth.isRTExpired) {
			return error(401, { message: 'Current Access Token Expired' });
		}

		return error(401, { message: 'Unauthorized Request' });
	}

	return;
}
