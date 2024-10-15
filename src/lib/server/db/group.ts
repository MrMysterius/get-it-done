import type { RequestEvent } from '@sveltejs/kit';
import prisma from '../prisma';

export async function getGroupWithMembers(group_id: string, event: RequestEvent) {
	const group = await prisma.group.findFirst({
		where: { id: group_id },
		include: {
			user: { select: { id: true, name: true, displayname: true } },
			group_members: {
				include: { user: { select: { id: true, name: true, displayname: true } } }
			}
		}
	});

	return {
		group,
		isOwner: event.locals.auth.user?.id === group?.owner
	};
}
