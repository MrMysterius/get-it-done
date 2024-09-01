import { building } from '$app/environment';
import { generateIdentifier } from './functions/generateIdentifier';
import { generatePasswordHash } from './functions/generatePasswordHash';
import prisma from './prisma';

export async function databaseSetup() {
	if (!building) {
		try {
			const res = await prisma.gid_info.findFirstOrThrow({ where: { key: 'date_installation' } });
			console.log('[DB] Already initialized - skipping...', res.value);
		} catch {
			console.log('[DB] Needs to be initialized...');
			console.log(
				await prisma.gid_info.create({
					data: { key: 'date_installation', value: Date.now().toString() }
				})
			);
			console.log(
				await prisma.user.create({
					data: {
						id: generateIdentifier('usr'),
						name: 'admin',
						password_hash: generatePasswordHash('admin'),
						displayname: 'Admin',
						role: 'admin',
						active: true
					}
				})
			);
		}
	}
}
