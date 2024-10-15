import type { Handle } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const handle: Handle = async ({ event, resolve }) => {
	const group = await prisma.group.findFirst({
		where: { id: event.params.group_id },
		include: {
			user: { select: { id: true, name: true, displayname: true } },
			group_members: {
				include: { user: { select: { id: true, name: true, displayname: true } } }
			}
		}
	});

	event.locals.group = {
		data: group,
		isOwner: event.locals.auth.user?.id === group?.owner
	};
	console.log(event.locals.group);

	const res = await resolve(event);
	return res;
};
