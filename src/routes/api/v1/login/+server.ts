import { generateAccessToken, generateRefreshToken } from '$lib/server/functions/generateJWT';

import type { RequestEvent } from './$types';
import { comparePasswordHash } from '$lib/server/functions/comparePasswordHast';
import { getJsonBody } from '$lib/server/getJsonBodySade';
import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { z } from 'zod';

const VUserCredentials = z
	.object({
		username: z.string(),
		password: z.string()
	})
	.transform(async (creds) => {
		const user = await prisma.user.findFirst({ where: { name: creds.username } });
		if (!user) return { password_match: false, user: null };
		if (comparePasswordHash(creds.password, user.password_hash)) {
			return { password_match: true, user: user };
		} else {
			return { password_match: false, user: null };
		}
	});

export async function POST(e: RequestEvent) {
	const jsonBody = await getJsonBody(e);
	const parsed = await VUserCredentials.safeParseAsync(jsonBody);
	if (!parsed.success) {
		return json({ message: 'Bad Request', errors: parsed.error.errors }, { status: 400 });
	}

	if (!parsed.data.user) {
		return json({ message: 'Internal Server Error' }, { status: 500 });
	}

	if (!parsed.data.password_match) {
		return json({ message: 'Incorrect username and password combination' }, { status: 403 });
	}

	const at = generateAccessToken(parsed.data.user);
	const rt = generateRefreshToken(parsed.data.user);

	e.cookies.set('at', at, { httpOnly: true, sameSite: 'strict', path: '/' });
	e.cookies.set('rt', rt, { httpOnly: true, sameSite: 'strict', path: '/' });
	return json({
		message: 'Successfully authorized',
		access_token: at,
		refresh_token: rt
	});
}
