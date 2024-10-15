import type { RequestHandler } from './$types';
import { getJsonBody } from '$lib/server/getJsonBodySade';
import { isAuthed } from '$lib/server/functions/isAuthed';
import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { z } from 'zod';
import { getGroupWithMembers } from '$lib/server/db/group';

export const GET: RequestHandler = async (e) => {
	isAuthed(e);

	if (e.locals.auth.user?.role == 'admin') {
		const group = await prisma.group.findFirst({
			where: {
				id: e.params.group_id
			},
			include: {
				user: { select: { id: true, name: true, displayname: true } },
				group_members: {
					include: { user: { select: { id: true, name: true, displayname: true } } }
				}
			}
		});
		if (!group) return json({ message: 'Group not found' }, { status: 404 });
		return json({ group }, { status: 200 });
	}

	const group = await prisma.group.findFirst({
		where: {
			OR: [
				{
					id: e.params.group_id,
					owner: e.locals.auth.user?.id
				},
				{
					id: e.params.group_id,
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

	if (!group) return json({ message: 'Group not found' }, { status: 404 });
	return json({ group }, { status: 200 });
};

const VGroupUpdate = z.object({
	name: z
		.string()
		.min(1, 'name has to be at least one character and less than 60')
		.max(60, 'name has to be at least one character and less than 60')
		.optional(),
	owner_id: z
		.string()
		.refine(async (v) => {
			const user = await prisma.user.findFirst({ where: { id: v } });
			if (!user) return false;
			return true;
		}, "user with that id doesn't exist")
		.optional()
});

export const PUT: RequestHandler = async (e) => {
	isAuthed(e);
	const preGroup = await getGroupWithMembers(e.params.group_id, e);

	const bodyJson = await getJsonBody(e);

	if (e.locals.auth.user?.role == 'admin') {
		const parsed = await VGroupUpdate.safeParseAsync(bodyJson);
		if (!parsed.success)
			return json({ message: 'Bad Request', errors: parsed.error.errors }, { status: 400 });

		try {
			const group = await prisma.group.update({
				where: { id: e.params.group_id },
				data: {
					name: parsed.data.name,
					owner: parsed.data.owner_id
				}
			});
			return json({ message: 'Updated group', group }, { status: 200 });
		} catch {
			return json({ message: 'Group not found' }, { status: 404 });
		}
	}

	if (!preGroup.isOwner || !preGroup.group)
		return json({ message: 'Forbidden Access' }, { status: 403 });

	const parsed = await VGroupUpdate.safeParseAsync(bodyJson);
	if (!parsed.success)
		return json({ message: 'Bad Request', errors: parsed.error.errors }, { status: 400 });

	if (
		parsed.data.owner_id &&
		preGroup.group.group_members.some((m) => m.user_id == parsed.data.owner_id)
	)
		try {
			if (parsed.data.owner_id) {
				const group = await prisma.group.update({
					where: { id: e.params.group_id },
					data: {
						name: parsed.data.name,
						owner: parsed.data.owner_id,
						group_members: {
							create: { user_id: preGroup.group.owner },
							delete: { group_id: e.params.group_id, user_id: parsed.data.owner_id }
						}
					}
				});
			} else {
				const group = await prisma.group.update({
					where: { id: e.params.group_id },
					data: {
						name: parsed.data.name,
						owner: parsed.data.owner_id
					}
				});
				return json({ message: 'Updated group', group }, { status: 200 });
			}
		} catch {
			return json({ message: 'Group not found' }, { status: 404 });
		}
};
