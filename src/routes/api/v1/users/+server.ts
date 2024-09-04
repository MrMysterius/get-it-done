import { json, type RequestEvent } from '@sveltejs/kit';
import { isAuthed } from '$lib/server/functions/isAuthed';
import prisma from '$lib/server/prisma';
import { z } from 'zod';
import { getJsonBody } from '$lib/server/getJsonBodySade';
import { generateIdentifier } from '$lib/server/functions/generateIdentifier';
import { generatePasswordHash } from '$lib/server/functions/generatePasswordHash';

export async function GET(e: RequestEvent) {
	isAuthed(e);
	if (e.locals.auth.user?.role != 'admin')
		return json({ message: 'Forbidden Access' }, { status: 403 });

	const users = await prisma.user.findMany({
		omit: { password_hash: true },
		include: { invitee: { omit: { password_hash: true } } }
	});

	return json({ users: users }, { status: 200 });
}

const VUserNew = z.object({
	username: z
		.string()
		.trim()
		.min(3, 'username must be 3 to 36 characters')
		.max(36, 'username must be 3 to 36 characters')
		.refine(
			async (v) => {
				const user = await prisma.user.findFirst({ where: { name: v } });
				if (user) return false;
				return true;
			},
			{ message: 'user with that name already exists' }
		),
	password: z
		.string()
		.trim()
		.min(2, 'password must be at least 2 characters long and a maximum of 128')
		.max(128, 'password must be at least 2 characters long and a maximum of 128'),
	displayname: z
		.string()
		.trim()
		.max(40, "displayname can't be longer than 40 characters")
		.optional(),
	role: z.union([z.literal('admin'), z.literal('user')]).default('user'),
	invitee_id: z
		.string()
		.trim()
		.refine(
			async (v) => {
				const user = await prisma.user.findFirst({ where: { id: v } });
				if (user) return true;
				return false;
			},
			{ message: "invitee doesn't exist" }
		)
		.optional()
});

//TODO User created event on User Events
export async function POST(e: RequestEvent) {
	isAuthed(e);
	if (e.locals.auth.user?.role != 'admin')
		return json({ message: 'Forbidden Access' }, { status: 403 });

	const bodyJson = await getJsonBody(e);
	const parsed = await VUserNew.safeParseAsync(bodyJson);

	if (!parsed.success)
		return json({ message: 'Bad Request', errors: parsed.error.errors }, { status: 400 });

	const user = await prisma.user.create({
		data: {
			id: generateIdentifier('usr'),
			name: parsed.data.username,
			displayname: parsed.data.displayname || parsed.data.username,
			password_hash: generatePasswordHash(parsed.data.password),
			role: parsed.data.role,
			active: true,
			invited_from: parsed.data.invitee_id || undefined
		},
		omit: {
			password_hash: true
		}
	});

	return json({ user }, { status: 200 });
}
