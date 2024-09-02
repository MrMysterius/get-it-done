import JWT from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

export function validateJWT(token: string) {
	try {
		const payload = JWT.verify(token, env.TOKEN_SECRET, {
			issuer: 'GetItDone',
			ignoreExpiration: true
		}) as { id: string; exp: number };

		return { payload, expired: Date.now() / 1000 > payload.exp };
	} catch {
		return { payload: null, expired: true };
	}
}
