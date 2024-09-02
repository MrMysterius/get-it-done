import { redirect, type Handle, type RequestEvent } from '@sveltejs/kit';

import { TOKEN_SECRET } from '$env/static/private';
import { building } from '$app/environment';
import { databaseSetup } from '$lib/server/database-setup';
import prisma from '$lib/server/prisma';
import { validateJWT } from '$lib/server/functions/validateJWT';

await databaseSetup();

if (!building) {
	if (TOKEN_SECRET == undefined) {
		console.error(
			'[ERROR] Environment Variable TOKEN_SECRET is not set. Which has to be in order for the authentication to work.'
		);
		process.exit(1);
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	await authenticate(event);

	if (!event.locals.auth.isAuthed && !isPublicRoute(event.url.pathname)) {
		return redirect(307, '/error/401');
	}

	const response = await resolve(event);
	return response;
};

async function authenticate(e: RequestEvent) {
	const at = e.cookies.get('at') || '';
	const rt = e.cookies.get('rt') || '';

	const vat = validateJWT(at);
	const vrt = validateJWT(rt);

	if (!vat.payload || !vrt.payload) {
		e.locals.auth = { isAuthed: false };
		return;
	}

	const user = await prisma.user.findFirst({ where: { id: vat.payload.id } });

	e.locals.auth = {
		isAuthed: user && !vat.expired ? true : false,
		user: user || undefined,
		isATExpired: vat.expired,
		isRTExpired: vrt.expired
	};

	return;
}

const public_paths = ['/', '/api', '/error'];

function isPublicRoute(path: string) {
	return public_paths.some(
		(public_path) => path === public_path || path.startsWith(public_path + '/')
	);
}
