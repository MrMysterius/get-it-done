import { json, type RequestEvent } from '@sveltejs/kit';

export function isAuthed(e: RequestEvent) {
	if (!e.locals.auth.isAuthed) {
		if (e.locals.auth.isATExpired && !e.locals.auth.isRTExpired) {
			return json({ message: 'Current Access Token Expired' }, { status: 401 });
		}

		return json({ message: 'Unauthorized Request' }, { status: 401 });
	}

	return;
}
