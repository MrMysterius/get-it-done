// See https://kit.svelte.dev/docs/types#app

import type { Prisma } from '@prisma/client';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth: AuthenticatedUser;
			group: {
				data: Prisma.groupGetPayload<{
					include: {
						user: { select: { id: true; name: true; displayname: true } };
						group_members: {
							include: { user: { select: { id: true; name: true; displayname: true } } };
						};
					};
				}>?;
				isOwner: boolean;
			}?;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		interface AuthenticatedUser {
			isAuthed: boolean;
			user?: Prisma.userGetPayload<null>;
			isATExpired?: boolean;
			isRTExpired?: boolean;
		}
	}
}

export {};
