import type { RequestHandler } from './$types';
import { generateIdentifier } from '$lib/server/functions/generateIdentifier';
import { getJsonBody } from '$lib/server/getJsonBodySade';
import { isAuthed } from '$lib/server/functions/isAuthed';
import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { z } from 'zod';

export const GET: RequestHandler = async (e) => {
	isAuthed(e);

	if (e.locals.auth.user?.role == 'admin') {
		const groups = await prisma.group.findMany({
			include: {
				user: { select: { id: true, name: true, displayname: true } },
				group_members: {
					include: { user: { select: { id: true, name: true, displayname: true } } }
				}
			}
		});
		return json({ groups }, { status: 200 });
	}

	const groups = await prisma.group.findMany({
		where: {
			OR: [
				{
					owner: e.locals.auth.user?.id
				},
				{
					group_members: { some: { user_id: e.locals.auth.user?.id } }
				}
			]
		},
		include: {
			user: { select: { id: true, name: true, displayname: true } },
			group_members: {
				include: { user: { select: { id: true, name: true, displayname: true } } }
			}
		}
	});
	return json({ groups }, { status: 200 });
};

const VGroupNew = z.object({
	name: z
		.string()
		.min(1, 'name has to be at least one character and less than 60')
		.max(60, 'name has to be at least one character and less than 60'),
	owner_id: z
		.string()
		.refine(async (v) => {
			const user = await prisma.user.findFirst({ where: { id: v } });
			if (!user) return false;
			return true;
		})
		.optional()
});

//TODO Creation Event in Group Events
export const POST: RequestHandler = async (e) => {
	isAuthed(e);

	const bodyJson = await getJsonBody(e);

	if (e.locals.auth.user?.role == 'admin') {
		const parsed = await VGroupNew.safeParseAsync(bodyJson);
		if (!parsed.success)
			return json({ message: 'Bad Request', errors: parsed.error.errors }, { status: 400 });

		const group = await prisma.group.create({
			data: {
				id: generateIdentifier('grp'),
				name: parsed.data.name,
				owner: parsed.data.owner_id || e.locals.auth.user.id
			}
		});

		return json({ group }, { status: 200 });
	}

	const parsed = await VGroupNew.omit({ owner_id: true }).safeParseAsync(bodyJson);
	if (!parsed.success)
		return json({ message: 'Bad Request', errors: parsed.error.errors }, { status: 400 });

	const group = await prisma.group.create({
		data: {
			id: generateIdentifier('grp'),
			name: parsed.data.name,
			//@ts-expect-error auth.user is already checked for existence in isAuthed()
			owner: e.locals.auth.user.id
		}
	});

	return json({ group }, { status: 200 });
};
