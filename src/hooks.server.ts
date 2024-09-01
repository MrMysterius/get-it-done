import { building } from '$app/environment';
import { databaseSetup } from '$lib/server/database-setup';

await databaseSetup();

if (!building) {
	if (process.env.TOKEN_SECRET == undefined) {
		console.error(
			'[ERROR] Environment Variable TOKEN_SECRET is not set. Which has to be in order for the authentication to work.'
		);
		process.exit(1);
	}
}
