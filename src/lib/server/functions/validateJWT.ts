import JWT from 'jsonwebtoken';
import { TOKEN_SECRET } from '$env/static/private';

export function validateJWT(token: string) {
	try {
		const payload = JWT.verify(token, TOKEN_SECRET, {
			issuer: 'GetItDone',
			ignoreExpiration: true
		}) as { id: string; exp: number };

		return { payload, expired: Date.now() / 1000 > payload.exp };
	} catch {
		return { payload: null, expired: true };
	}
}
