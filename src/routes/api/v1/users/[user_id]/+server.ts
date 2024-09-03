import { generatePasswordHash } from '$lib/server/functions/generatePasswordHash';
import { isAuthed } from '$lib/server/functions/isAuthed';
import { getJsonBody } from '$lib/server/getJsonBodySade';
import prisma from '$lib/server/prisma';
import { json, type RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

export async function GET(e: RequestEvent) {
	isAuthed(e);
	if (e.locals.auth.user?.role != 'admin')
		return json({ message: 'Forbidden Access' }, { status: 403 });

	const user = await prisma.user.findFirst({
		where: { id: e.params.user_id },
		omit: { password_hash: true },
		include: { invitee: { omit: { password_hash: true } } }
	});

	if (!user) return json({ message: 'User not found' }, { status: 404 });
	return json({ user }, { status: 200 });
}

const VUserUpdate = z.object({
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
		)
		.optional(),
	password: z
		.string()
		.trim()
		.min(2, 'password must be at least 2 characters long and a maximum of 128')
		.max(128, 'password must be at least 2 characters long and a maximum of 128')
		.optional(),
	displayname: z
		.string()
		.trim()
		.max(40, "displayname can't be longer than 40 characters")
		.optional(),
	role: z.union([z.literal('admin'), z.literal('user')]).optional(),
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
		.optional(),
	is_active: z.boolean().optional()
});

export async function PUT(e: RequestEvent) {
	isAuthed(e);
	if (e.locals.auth.user?.role != 'admin' && e.locals.auth.user?.id != e.params.user_id)
		return json({ message: 'Forbidden Access' }, { status: 403 });

	const bodyJson = await getJsonBody(e);

	if (e.locals.auth.user?.role == 'admin') {
		const parsed = await VUserUpdate.safeParseAsync(bodyJson);

		if (!parsed.success)
			return json({ message: 'Bad Request', errors: parsed.error.errors }, { status: 400 });

		try {
			const user = await prisma.user.update({
				where: { id: e.params.user_id },
				data: {
					name: parsed.data.username,
					displayname: parsed.data.displayname,
					password_hash: parsed.data.password
						? generatePasswordHash(parsed.data.password)
						: undefined,
					invited_from: parsed.data.invitee_id,
					role: parsed.data.role,
					active: parsed.data.is_active
				},
				omit: { password_hash: true }
			});
			return json({ messae: 'Updated user', user }, { status: 200 });
		} catch {
			return json({ message: 'User not found' }, { status: 404 });
		}
	}

	const parsed = await VUserUpdate.omit({
		invitee_id: true,
		role: true,
		is_active: true
	}).safeParseAsync(bodyJson);

	if (!parsed.success)
		return json({ message: 'Bad Request', errors: parsed.error.errors }, { status: 400 });

	try {
		const user = await prisma.user.update({
			where: { id: e.params.user_id },
			data: {
				name: parsed.data.username,
				displayname: parsed.data.displayname,
				password_hash: parsed.data.password ? generatePasswordHash(parsed.data.password) : undefined
			},
			omit: { password_hash: true }
		});
		return json({ messae: 'Updated user', user }, { status: 200 });
	} catch {
		return json({ message: 'User not found' }, { status: 404 });
	}
}

export async function DELETE(e: RequestEvent) {
	isAuthed(e);

	if (e.locals.auth.user?.role == 'admin' && e.locals.auth.user.id != e.params.user_id) {
		try {
			const user = await prisma.user.delete({ where: { id: e.params.user_id } });
			return json({ message: 'Successfully deleted user', user_id: user.id }, { status: 200 });
		} catch {
			return json({ message: 'User not found' }, { status: 404 });
		}
	}

	if (e.locals.auth.user?.role != 'admin' && e.locals.auth.user?.id == e.params.user_id) {
		try {
			const user = await prisma.user.delete({ where: { id: e.params.user_id } });
			return json({ message: 'Successfully deleted user', user_id: user.id }, { status: 200 });
		} catch {
			return json({ message: 'User not found' }, { status: 404 });
		}
	}

	return json({ message: 'Forbidden Access' }, { status: 403 });
}
